import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/interceptors";
import { WorkspaceMemberApi, WorkspaceMemberListResponse } from "@/types/api/workspace.api";

const handleApiError = (error: any, customMessage?: string) => {
    if (error instanceof ApiError) {
        throw error;
    }
    throw new ApiError(500, customMessage || "Terjadi kesalahan tidak terduga");
};

export const workspaceMembersService = {
    /**
     * List all members in Workspace
     */
    getAll: async (workspace_id: number): Promise<WorkspaceMemberListResponse> => {
        try {
            const url = API_ENDPOINTS.WORKSPACE.MEMBERS.LIST(workspace_id);
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            throw handleApiError(error, "Gagal memuat anggota workspace");
        }
    },

    /**
     * Add member to Workspace
     */
    add: async (
        workspace_id: number,
        payload: { user_id: number }
    ): Promise<WorkspaceMemberApi> => {
        try {
            const url = API_ENDPOINTS.WORKSPACE.MEMBERS.ADD(workspace_id);
            const response = await apiClient.post(url, payload);
            return response.data;
        } catch (error) {
            throw handleApiError(error, "Gagal menambahkan anggota");
        }
    },

    /**
     * Add user to workspace
     */
    addBulk: async (
        workspace_id: number,
        user_ids: number[]
    ): Promise<WorkspaceMemberApi[]> => {
        try {
            const url = API_ENDPOINTS.WORKSPACE.MEMBERS.ADD(workspace_id);
            
            const payload = {
                members: user_ids.map(user_id => ({ user_id }))
            };
            
            const response = await apiClient.post(url, payload);
            
            return Array.isArray(response.data) 
                ? response.data 
                : response.data.data || [];
        } catch (error) {
            throw handleApiError(error, "Gagal menambahkan beberapa anggota");
        }
    },

    /**
     * Remove member from Workspace
     */
    remove: async (workspace_id: number, member_id: number): Promise<void> => {
        try {
            const url = API_ENDPOINTS.WORKSPACE.MEMBERS.SOFT_DELETE(workspace_id, member_id);
            await apiClient.delete(url);
        } catch (error) {
            throw handleApiError(error, "Gagal menghapus anggota");
        }
    },
};