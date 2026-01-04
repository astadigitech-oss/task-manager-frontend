
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskMembersService } from "@/services/task/taskMembers.service";
import { taskKeys, invalidateTaskQueries } from "@/lib/react-query/taskKeys";
import { showSuccessToast, showErrorToast } from "@/lib/helpers/toast-helpers";

/**
 * Hook untuk fetch task members
 */
export function useTaskMembers(
    workspaceId: number | null,
    projectId: number | null,
    taskId: number | null
) {
    return useQuery({
        queryKey: taskKeys.members(workspaceId || 0, projectId || 0, taskId || 0),
        queryFn: async () => {
            if (!workspaceId || !projectId || !taskId) return [];

            const res = await taskMembersService.list(workspaceId, projectId, taskId);

            if (!res.success || !res.data) {
                return [];
            }

            return res.data;
        },
        enabled: !!workspaceId && !!projectId && !!taskId,
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    });
}

/**
 * Hook untuk add task member
 */
export function useAddTaskMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            workspaceId,
            projectId,
            taskId,
            userId,
            role = "member"
        }: {
            workspaceId: number;
            projectId: number;
            taskId: number;
            userId: number;
            role?: string;
        }) => {
            const newMember = await taskMembersService.add(
                workspaceId,
                projectId,
                taskId,
                { user_id: userId, role }
            );

            return { workspaceId, projectId, taskId, newMember };
        },
        onSuccess: ({ workspaceId, projectId, taskId }) => {
            invalidateTaskQueries.taskMembers(queryClient, workspaceId, projectId, taskId);
            invalidateTaskQueries.allInProject(queryClient, workspaceId, projectId);
            showSuccessToast("Member berhasil ditambahkan!");
        },
        onError: () => {
            showErrorToast("Gagal menambahkan member");
        },
    });
}

/**
 * Hook untuk remove task member
 */
export function useRemoveTaskMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            workspaceId,
            projectId,
            taskId,
            memberId
        }: {
            workspaceId: number;
            projectId: number;
            taskId: number;
            memberId: number;
        }) => {
            await taskMembersService.remove(workspaceId, projectId, taskId, memberId);
            return { workspaceId, projectId, taskId, memberId };
        },
        onSuccess: ({ workspaceId, projectId, taskId }) => {
            invalidateTaskQueries.taskMembers(queryClient, workspaceId, projectId, taskId);
            invalidateTaskQueries.allInProject(queryClient, workspaceId, projectId);
            showSuccessToast("Member berhasil dihapus!");
        },
        onError: () => {
            showErrorToast("Gagal menghapus member");
        },
    });
}