import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/interceptors';
import { WorkspaceApi, WorkspaceRequest } from '@/types/api/workspace.api';
import { ApiResponse } from '@/types/api/user.api';

const handleApiError = (error: any, customMessage?: string) => {
    if (error instanceof ApiError) {
        throw error;
    }
    throw new ApiError(500, customMessage || "Terjadi kesalahan tidak terduga");
};

export const workspaceService = {
    /**
     * List All Workspace List
     */
    list: async (): Promise<ApiResponse<WorkspaceApi[]>> => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.WORKSPACE.LIST);
            return response.data;
        } catch (error) {
            throw handleApiError(error, "Gagal memuat workspace");
        }
    },

    /**
     * Workspace Detail
     */
    detail: async (id: number, color: string): Promise<ApiResponse<WorkspaceApi>> => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.WORKSPACE.DETAIL(id));
            return response.data;
        } catch (error) {
            throw handleApiError(error, "Gagal memuat detail workspace");
        }
    },

    /**
     * Create new Workspace
     */
    create: async (payload: WorkspaceRequest): Promise<ApiResponse<WorkspaceApi>> => {
        try {
            const response = await apiClient.post(
                API_ENDPOINTS.WORKSPACE.CREATE,
                payload
            );
            return response.data;
        } catch (error) {
            throw handleApiError(error, "Gagal membuat workspace");
        }
    },

    /**
     * Update Workspace
     */
    update: async (
        id: number,
        payload: Partial<WorkspaceRequest>
    ): Promise<ApiResponse<WorkspaceApi>> => {
        try {
            const response = await apiClient.put(
                API_ENDPOINTS.WORKSPACE.UPDATE(id),
                payload
            );
            return response.data;
        } catch (error) {
            throw handleApiError(error, "Gagal update workspace");
        }
    },

    /**
     * Soft delete Workspace
     */
    softDelete: async (id: number): Promise<ApiResponse<void>> => {
        try {
            const response = await apiClient.delete(
                API_ENDPOINTS.WORKSPACE.SOFT_DELETE(id)
            );
            return response.data;
        } catch (error) {
            throw handleApiError(error, "Gagal menghapus workspace");
        }
    },

    /**
     * Hard Delete Workspace
     */
    hardDelete: async (id: number): Promise<ApiResponse<void>> => {
        try {
            const response = await apiClient.delete(
                API_ENDPOINTS.WORKSPACE.HARD_DELETE(id)
            );
            return response.data;
        } catch (error) {
            throw handleApiError(error, "Gagal menghapus workspace secara permanen");
        }
    },
};

