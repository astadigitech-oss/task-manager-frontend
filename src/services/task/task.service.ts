import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/interceptors";
import {
    TaskRequest,
    TaskListResponse,
    TaskResponse,
} from "@/types/api/task.api";
import { ApiResponse } from "@/types/api/user.api";

const handleApiError = (error: any, customMessage?: string) => {
    if (error instanceof ApiError) {
        throw error;
    }

    throw new ApiError(
        500,
        customMessage || "Terjadi kesalahan tidak terduga"
    );
};

export const tasksService = {
    /**
     * Get list of tasks in a project
     */
    list: async (
        workspace_id: number,
        project_id: number
    ): Promise<TaskListResponse> => {
        try {
            const url = API_ENDPOINTS.TASKS.LIST(workspace_id, project_id);

            const response = await apiClient.get(url);

            return response.data;
        } catch (error) {

            if (error instanceof ApiError && error.status === 403) {
                const errorMessage = error.data?.error || error.message || '';


                if (
                    errorMessage.toLowerCase().includes('tidak ditemukan') ||
                    errorMessage.toLowerCase().includes('not found')
                ) {

                    return {
                        success: true,
                        code: 200,
                        data: [],
                        message: 'Project kosong'
                    };
                }

                throw error;
            }

            throw handleApiError(error, "Gagal memuat daftar task");
        }
    },

    /**
     * Get task detail
     */
    detail: async (
        workspace_id: number,
        project_id: number,
        task_id: number
    ): Promise<TaskResponse> => {
        try {
            const url = API_ENDPOINTS.TASKS.DETAIL(workspace_id, project_id, task_id);
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {

            throw handleApiError(error, "Gagal memuat detail task");
        }
    },

    /**
     * Create task
     */
    create: async (
        workspace_id: number,
        project_id: number,
        payload: TaskRequest
    ): Promise<TaskResponse> => {
        try {
            const url = API_ENDPOINTS.TASKS.CREATE(workspace_id, project_id);

            const response = await apiClient.post(url, payload);

            return response.data;
        } catch (error) {

            throw handleApiError(error, "Gagal membuat task");
        }
    },

    /**
     * Update existing task
     */
    update: async (
        workspace_id: number,
        project_id: number,
        task_id: number,
        payload: Partial<TaskRequest>
    ): Promise<TaskResponse> => {
        try {
            const url = API_ENDPOINTS.TASKS.UPDATE(workspace_id, project_id, task_id);

            const response = await apiClient.put(url, payload);

            return response.data;
        } catch (error) {

            throw handleApiError(error, "Gagal update task");
        }
    },

    // async updateOrder(
    //     workspaceId: number,
    //     projectId: number,
    //     orderedTaskIds: number[]
    // ): Promise<ApiResponse<void>> {
    //     const response = await apiClient.put(
    //         API_ENDPOINTS.TASKS.UPDATE_ORDER(workspaceId, projectId),
    //         { task_ids: orderedTaskIds }
    //     );
    //     return response.data;
    // },

    /**
     * Soft delete task
     */
    softDelete: async (
        workspace_id: number,
        project_id: number,
        task_id: number
    ): Promise<void> => {
        try {
            const url = API_ENDPOINTS.TASKS.SOFT_DELETE(workspace_id, project_id, task_id);

            await apiClient.delete(url);

        } catch (error) {

            throw handleApiError(error, "Gagal menghapus task");
        }
    },

    /**
     * Hard delete task
     */
    hardDelete: async (
        workspace_id: number,
        project_id: number,
        task_id: number
    ): Promise<void> => {
        try {
            const url = API_ENDPOINTS.TASKS.HARD_DELETE(workspace_id, project_id, task_id);

            await apiClient.delete(url);

        } catch (error) {

            throw handleApiError(error, "Gagal menghapus task secara permanen");
        }
    },
};