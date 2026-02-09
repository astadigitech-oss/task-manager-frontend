"use client";

import {
    createContext,
    useContext,
    ReactNode,
    useCallback,
    useState,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { showErrorToast, showSuccessToast } from "@/lib/helpers/toast-helpers";
import { ProjectApi, ProjectRequest } from "@/types/api/project.api";
import { projectsService } from "@/services/projects/project.service";
import { mapProject } from "@/lib/mapper/project.mapper";
import { useAuthStore } from "@/store/useAuthStore";
import { ApiError } from "@/lib/api/interceptors";

export const projectKeys = {
    all: ['projects'] as const,
    lists: () => [...projectKeys.all, 'list'] as const,
    list: (workspaceId?: number) =>
        [...projectKeys.lists(), workspaceId] as const,
    details: () => [...projectKeys.all, 'detail'] as const,
    detail: (id: number) => [...projectKeys.details(), id] as const,
    members: (projectId: number) => [...projectKeys.all, 'members', projectId] as const,
};

interface ProjectContextType {
    projects: ProjectApi[];
    isLoading: boolean;
    error: Error | null;

    createProject: (payload: ProjectRequest) => Promise<void>;
    updateProject: (id: number, payload: Partial<ProjectRequest>) => Promise<void>;
    deleteProject: (id: number) => Promise<void>;

    selectedWorkspaceId: number | null;
    setSelectedWorkspaceId: (id: number | null) => void;
    refetchProjects: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();
    const { isAuthenticated } = useAuthStore();

    const [selectedWorkspaceId, setSelectedWorkspaceIdState] =
        useState<number | null>(null);

    const setSelectedWorkspaceId = useCallback((id: number | null) => {
        setSelectedWorkspaceIdState(id);
    }, []);

    // Fetch Projects
    const {
        data: projectsData,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: projectKeys.list(selectedWorkspaceId || undefined),
        queryFn: async () => {
            const res = await projectsService.list(selectedWorkspaceId || undefined);
            if (!res.success || !res.data) {
                throw new Error("Gagal memuat projects");
            }
            return res.data.map(mapProject);
        },
        enabled: isAuthenticated,
        staleTime: 5 * 60 * 1000, // 5 menit
        gcTime: 10 * 60 * 1000,
        retry: (failureCount, error) => {
            if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
                return false;
            }
            return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    // Create Project Mutation
    const createMutation = useMutation({
        mutationFn: async (payload: ProjectRequest) => {
            const res = await projectsService.create(payload);
            if (!res.success || !res.data) {
                throw new Error("Gagal membuat project");
            }
            return res.data;
        },
        onSuccess: (data) => {
            // Invalidate queries untuk refresh data
            queryClient.invalidateQueries({
                queryKey: projectKeys.lists()
            });
            showSuccessToast("Project berhasil dibuat!");
        },
        onError: (error: any) => {
            console.error("Create project error:", error);
            const message = error instanceof ApiError
                ? error.message
                : "Gagal membuat project";
            showErrorToast(message);
        },
    });

    // Update Project Mutation
    const updateMutation = useMutation({
        mutationFn: async ({
            id,
            payload
        }: {
            id: number;
            payload: Partial<ProjectRequest>
        }) => {
            const res = await projectsService.update(id, payload);
            if (!res.success || !res.data) {
                throw new Error("Gagal update project");
            }
            return res.data;
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({
                queryKey: projectKeys.lists()
            });

            const previousData = queryClient.getQueryData(
                projectKeys.list(selectedWorkspaceId || undefined)
            );

            queryClient.setQueryData(
                projectKeys.list(selectedWorkspaceId || undefined),
                (old: ProjectApi[] | undefined) => {
                    if (!old) return old;
                    return old.map(p =>
                        p.id === variables.id
                            ? { ...p, ...variables.payload }
                            : p
                    );
                }
            );

            return { previousData };
        },
    });

    // Delete Project Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await projectsService.softDelete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: projectKeys.lists()
            });
            showSuccessToast("Project berhasil dihapus!");
        },
        onError: (error: any) => {
            console.error("Delete project error:", error);
            const message = error instanceof ApiError
                ? error.message
                : "Gagal menghapus project";
            showErrorToast(message);
        },
    });

    const createProject = useCallback(
        async (payload: ProjectRequest) => {
            await createMutation.mutateAsync(payload);
        },
        [createMutation]
    );

    const updateProject = useCallback(
        async (id: number, payload: Partial<ProjectRequest>) => {
            await updateMutation.mutateAsync({ id, payload });
        },
        [updateMutation]
    );

    const deleteProject = useCallback(
        async (id: number) => {
            await deleteMutation.mutateAsync(id);
        },
        [deleteMutation]
    );

    const refetchProjects = useCallback(() => {
        refetch();
    }, [refetch]);

    return (
        <ProjectContext.Provider
            value={{
                projects: projectsData || [],
                isLoading,
                error: error as Error | null,
                selectedWorkspaceId,
                setSelectedWorkspaceId,
                createProject,
                updateProject,
                deleteProject,
                refetchProjects,
            }}
        >
            {children}
        </ProjectContext.Provider>
    );
}

export function useProject() {
    const ctx = useContext(ProjectContext);
    if (!ctx) {
        throw new Error("useProject must be used within ProjectProvider");
    }
    return ctx;
}