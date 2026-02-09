"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useState,
  useEffect,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WorkspaceApi, WorkspaceRequest } from "@/types/api/workspace.api";
import { workspaceService } from "@/services/workspaces/workspace.service";
import { workspaceMembersService } from "@/services/workspaces/workspaceMember.service";
import { showErrorToast, showSuccessToast } from "@/lib/helpers/toast-helpers";
import { useAuthStore } from "@/store/useAuthStore";
import { ApiError } from "@/lib/api/interceptors";

export const workspaceKeys = {
  all: ['workspaces'] as const,
  lists: () => [...workspaceKeys.all, 'list'] as const,
  list: () => [...workspaceKeys.lists()] as const,
  details: () => [...workspaceKeys.all, 'detail'] as const,
  detail: (id: number) => [...workspaceKeys.details(), id] as const,
  members: (id: number) => [...workspaceKeys.all, 'members', id] as const,
};

interface WorkspaceContextType {
  workspaces: WorkspaceApi[];
  isLoading: boolean;
  selectedWorkspaceId: number | null;
  setSelectedWorkspaceId: (id: number | null) => void;
  selectedWorkspace: WorkspaceApi | null;

  createWorkspace: (payload: WorkspaceRequest) => Promise<WorkspaceApi | null>;
  updateWorkspace: (id: number, payload: Partial<WorkspaceRequest>) => Promise<void>;
  softDeleteWorkspace: (id: number) => Promise<void>;
  addBulkMembersToWorkspace: (workspace_id: number, user_ids: number[]) => Promise<void>;

  refetchWorkspaces: () => void;
}

export const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { isAuthenticated, defaultWorkspaceId, setDefaultWorkspaceId } = useAuthStore();

  const [selectedWorkspaceId, setSelectedWorkspaceIdState] =
    useState<number | null>(null);

  // Fetch Workspaces dengan React Query
  const {
    data: workspacesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: workspaceKeys.list(),
    queryFn: async () => {
      const res = await workspaceService.list();
      if (!res.success || !res.data) {
        throw new Error("Gagal memuat workspaces");
      }
      return res.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });

  useEffect(() => {
    if (isLoading || !workspacesData?.length) return;

    if (selectedWorkspaceId === null) {
      if (defaultWorkspaceId) {
        const exists = workspacesData.find(ws => ws.id === defaultWorkspaceId);
        if (exists) {
          setSelectedWorkspaceIdState(defaultWorkspaceId);
          return;
        }
      }

      setSelectedWorkspaceIdState(workspacesData[0].id);
      setDefaultWorkspaceId(workspacesData[0].id);
    }
  }, [isLoading, workspacesData, selectedWorkspaceId, defaultWorkspaceId, setDefaultWorkspaceId]);

  const setSelectedWorkspaceId = useCallback((id: number | null) => {
    setSelectedWorkspaceIdState(id);

    if (id !== null) {
      setDefaultWorkspaceId(id);
    }
  }, [setDefaultWorkspaceId]);

  const createMutation = useMutation({
    mutationFn: async (payload: WorkspaceRequest) => {
      const res = await workspaceService.create(payload);
      if (!res.success || !res.data) {
        throw new Error("Gagal membuat workspace");
      }
      return res.data;
    },
    onError: (error: any) => {
      console.error("Create workspace error:", error);
      const message = error instanceof ApiError
        ? error.message
        : "Gagal membuat workspace";
      showErrorToast(message);
    },
  });

  // Update Workspace Mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      payload
    }: {
      id: number;
      payload: Partial<WorkspaceRequest>
    }) => {
      const res = await workspaceService.update(id, payload);
      if (!res.success || !res.data) {
        throw new Error("Gagal update workspace");
      }
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(data.id) });
      showSuccessToast("Workspace berhasil diperbarui!");
    },
    onError: (error: any) => {
      console.error("Update workspace error:", error);
      const message = error instanceof ApiError
        ? error.message
        : "Gagal update workspace";
      showErrorToast(message);
    },
  });

  // Delete Workspace Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await workspaceService.softDelete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
      showSuccessToast("Workspace berhasil dihapus!");
    },
    onError: (error: any) => {
      console.error("Delete workspace error:", error);
      const message = error instanceof ApiError
        ? error.message
        : "Gagal menghapus workspace";
      showErrorToast(message);
    },
  });

  // Add Bulk Members Mutation
  const addBulkMembersMutation = useMutation({
    mutationFn: async ({
      workspace_id,
      user_ids
    }: {
      workspace_id: number;
      user_ids: number[]
    }) => {
      await workspaceMembersService.addBulk(workspace_id, user_ids);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.members(variables.workspace_id)
      });
      showSuccessToast(`${variables.user_ids.length} anggota berhasil ditambahkan!`);
    },
    onError: (error: any) => {
      console.error("Add bulk members error:", error);
      const message = error instanceof ApiError
        ? error.message
        : "Gagal menambahkan anggota";
      showErrorToast(message);
    },
  });

  // Wrapper functions
  const createWorkspace = useCallback(
    async (payload: WorkspaceRequest): Promise<WorkspaceApi | null> => {
      try {
        const result = await createMutation.mutateAsync(payload);
        return result;
      } catch (error) {
        console.error("Create workspace error:", error);
        return null;
      }
    },
    [createMutation]
  );

  const updateWorkspace = useCallback(
    async (id: number, payload: Partial<WorkspaceRequest>) => {
      await updateMutation.mutateAsync({ id, payload });
    },
    [updateMutation]
  );

  const softDeleteWorkspace = useCallback(
    async (id: number) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation]
  );

  const addBulkMembersToWorkspace = useCallback(
    async (workspace_id: number, user_ids: number[]) => {
      await addBulkMembersMutation.mutateAsync({ workspace_id, user_ids });
    },
    [addBulkMembersMutation]
  );

  const refetchWorkspaces = useCallback(() => {
    refetch();
  }, [refetch]);

  const selectedWorkspace = workspacesData?.find(
    ws => ws.id === selectedWorkspaceId
  ) || null;

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces: workspacesData || [],
        isLoading,
        selectedWorkspaceId,
        setSelectedWorkspaceId,
        selectedWorkspace,
        createWorkspace,
        updateWorkspace,
        softDeleteWorkspace,
        addBulkMembersToWorkspace,
        refetchWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context)
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return context;
}