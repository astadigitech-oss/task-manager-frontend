"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectMembersService } from "@/services/projects/projectMember.service";
import { projectKeys } from "@/context/ProjectContext";
import { ApiError } from "@/lib/api/interceptors";
import { showErrorToast, showSuccessToast } from "@/lib/helpers/toast-helpers";
import { ProjectMemberApi } from "@/types/api/project.api";

export function useProjectMembers(projectId?: number) {
    const queryClient = useQueryClient();

    // =========================
    // GET MEMBERS
    // =========================
    const membersQuery = useQuery<ProjectMemberApi[]>({
        queryKey: projectKeys.members(projectId as number),
        queryFn: async () => {
            if (!projectId) return [];
            const res = await projectMembersService.getAll(projectId);
            if (!res.success || !res.data) {
                throw new Error("Gagal memuat anggota project");
            }
            return res.data;
        },
        enabled: !!projectId,
        staleTime: 2 * 60 * 1000,
    });

    // =========================
    // ADD MEMBERS (BULK)
    // =========================
    const addMembersMutation = useMutation({
        mutationFn: async (userIds: number[]) => {
            if (!projectId) {
                throw new Error("Project ID tidak valid");
            }
            return projectMembersService.addBulk(projectId, userIds);
        },
        onSuccess: (_, userIds) => {
            queryClient.invalidateQueries({
                queryKey: projectKeys.members(projectId as number),
            });

            showSuccessToast(`${userIds.length} anggota berhasil ditambahkan`);
        },
        onError: (error: any) => {
            const message =
                error instanceof ApiError
                    ? error.message
                    : "Gagal menambahkan anggota project";
            showErrorToast(message);
        },
    });

    // =========================
    // REMOVE MEMBER
    // =========================
    const removeMemberMutation = useMutation({
        mutationFn: async (memberId: number) => {
            if (!projectId) return;
            await projectMembersService.remove(projectId, memberId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: projectKeys.members(projectId as number),
            });
            showSuccessToast("Anggota berhasil dihapus");
        },
        onError: () => {
            showErrorToast("Gagal menghapus anggota");
        },
    });

    return {
        members: membersQuery.data || [],
        isLoading: membersQuery.isLoading,
        error: membersQuery.error,

        addMembers: addMembersMutation.mutateAsync,
        removeMember: removeMemberMutation.mutateAsync,
    };
}
