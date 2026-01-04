import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/interceptors";
import { TaskMemberApi, TaskMemberListResponse } from "@/types/api/task.api";

const handleApiError = (error: any, customMessage?: string) => {
    if (error instanceof ApiError) {
        throw error;
    }
    throw new ApiError(
        500,
        customMessage || "Terjadi kesalahan tidak terduga"
    );
};

export const taskMembersService = {
    /**
     * Get all members inside a specific task
     */
    list: async (
        workspace_id: number,
        project_id: number,
        task_id: number,
    ): Promise<TaskMemberListResponse> => {
        try {
            const url = API_ENDPOINTS.TASKS.MEMBERS.LIST(workspace_id, project_id, task_id);
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            throw handleApiError(error, "Gagal memuat daftar anggota task");
        }
    },

    /**
     * Add member to a task
     */
    add: async (
        workspace_id: number,
        project_id: number,
        task_id: number,
        payload: { user_id: number; role?: string }
    ): Promise<TaskMemberApi> => {
        try {
            const url = API_ENDPOINTS.TASKS.MEMBERS.ADD(workspace_id, project_id, task_id);

            const response = await apiClient.post(url, {
                ...payload,
                role: payload.role || 'member'
            });
;
            return response.data.data || response.data;
        } catch (error) {

            throw handleApiError(error, "Gagal menambahkan anggota ke task");
        }
    },

    /**
     * Add multiple members to a task
     */
    addBulk: async (
        workspace_id: number,
        project_id: number,
        task_id: number,
        user_ids: number[]
    ): Promise<TaskMemberApi[]> => {
        try {
            const results: TaskMemberApi[] = [];
            
            for (const user_id of user_ids) {
                const member = await taskMembersService.add(
                    workspace_id,
                    project_id,
                    task_id,
                    { user_id, role: 'member' }
                );
                results.push(member);
            }
            
            return results;
        } catch (error) {
            throw handleApiError(error, "Gagal menambahkan anggota secara bulk");
        }
    },

    /**
     * Remove member from a task
     */
    remove: async (
        workspace_id: number,
        project_id: number,
        task_id: number,
        member_id: number
    ): Promise<void> => {
        try {
            const url = API_ENDPOINTS.TASKS.MEMBERS.SOFT_DELETE(
                workspace_id,
                project_id,
                task_id,
                member_id
            );
            await apiClient.delete(url);
        } catch (error) {
            throw handleApiError(error, "Gagal menghapus anggota dari task");
        }
    },
};