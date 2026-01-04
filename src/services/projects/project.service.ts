import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/interceptors";
import {
    ProjectRequest,
    ProjectResponse,
    ProjectListResponse,
    ProjectApi,
} from "@/types/api/project.api";
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

export const projectsService = {
    /**
     * Get list of projects
     */
    list: async (workspace_id?: number): Promise<ApiResponse<ProjectApi[]>> => {
        try {
            const url = workspace_id
                ? `${API_ENDPOINTS.PROJECTS.LIST}?workspace_id=${workspace_id}`
                : API_ENDPOINTS.PROJECTS.LIST;

            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            throw handleApiError(error, "Gagal memuat daftar project");
        }
    },

    /**
     * Get project detail by ID
     */
    detail: async (id: number): Promise<ProjectResponse> => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.PROJECTS.DETAIL(id));
            return response.data;
        } catch (error) {
            throw handleApiError(error, "Gagal memuat detail project");
        }
    },

    /**
     * Create new project
     */
    create: async (payload: ProjectRequest): Promise<ApiResponse<ProjectApi>> => {
        try {
            console.log(" Creating project with payload:", payload);
            const response = await apiClient.post(
                API_ENDPOINTS.PROJECTS.CREATE,
                payload
            );
            return response.data;
        } catch (error) {
            throw handleApiError(error, "Gagal membuat project");
        }
    },

    /**
     * Update existing project
     */
    update: async (
        id: number,
        payload: Partial<ProjectRequest>
    ): Promise<ProjectResponse> => {
        try {
            const response = await apiClient.put(
                API_ENDPOINTS.PROJECTS.UPDATE(id),
                payload
            );
            return response.data;
        } catch (error) {
            throw handleApiError(error, "Gagal update project");
        }
    },

    /**
     * Soft delete project
     */
    softDelete: async (id: number): Promise<void> => {
        try {
            await apiClient.delete(API_ENDPOINTS.PROJECTS.SOFT_DELETE(id));
        } catch (error) {
            throw handleApiError(error, "Gagal menghapus project");
        }
    },

    /**
     * Hard delete project (permanent)
     */
    hardDelete: async (id: number): Promise<void> => {
        try {
            await apiClient.delete(API_ENDPOINTS.PROJECTS.HARD_DELETE(id));
        } catch (error) {
            throw handleApiError(error, "Gagal menghapus project secara permanen");
        }
    },
};