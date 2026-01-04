import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/interceptors";
import { ProjectMemberApi, ProjectMemberListResponse } from "@/types/api/project.api";

const handleApiError = (error: any, customMessage?: string) => {
    if (error instanceof ApiError) {
        throw error;
    }
    throw new ApiError(500, customMessage || "Terjadi kesalahan tidak terduga");
};

export const projectMembersService = {
    /**
     * Get all members inside a specific project
     */
    getAll: async (project_id: number): Promise<ProjectMemberListResponse> => {
        try {
            const url = API_ENDPOINTS.PROJECTS.MEMBERS.LIST(project_id);
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            throw handleApiError(error, "Gagal memuat anggota project");
        }
    },

    /**
     * Add member to a project
     */
    add: async (
        project_id: number,
        payload: { user_id: number; role?: string }
    ): Promise<ProjectMemberApi> => {
        try {
            const url = API_ENDPOINTS.PROJECTS.MEMBERS.ADD(project_id);
            const response = await apiClient.post(url, { 
                ...payload, 
                role: payload.role || 'member' 
            });
            return response.data.data;
        } catch (error) {
            throw handleApiError(error, "Gagal menambahkan anggota ke project");
        }
    },

    /**
     * Add multiple members to a project
     */
    addBulk: async (
        project_id: number,
        user_ids: number[]
    ): Promise<ProjectMemberApi[]> => {
        try {
            const url = API_ENDPOINTS.PROJECTS.MEMBERS.ADD(project_id);
            
            const payload = {
                members: user_ids.map(user_id => ({ user_id }))
            };
            
            const response = await apiClient.post(url, payload);
            
            return Array.isArray(response.data) 
                ? response.data 
                : response.data.data || [];
        } catch (error) {
            console.error("addBulk error:", error);
            throw handleApiError(error, "Gagal menambahkan beberapa anggota");
        }
    },

    /**
     * Remove member from a project
     */
    remove: async (project_id: number, member_id: number): Promise<void> => {
        try {
            const url = `${API_ENDPOINTS.PROJECTS.MEMBERS.LIST(project_id)}/${member_id}`;
            await apiClient.delete(url);
        } catch (error) {
            throw handleApiError(error, "Gagal menghapus anggota dari project");
        }
    },

    /**
     * Update member role inside project
     */
    updateRole: async (
        project_id: number,
        member_id: number,
        payload: { role: string }
    ): Promise<ProjectMemberApi> => {
        try {
            const url = `${API_ENDPOINTS.PROJECTS.MEMBERS.LIST(project_id)}/${member_id}`;
            const response = await apiClient.put(url, payload);
            return response.data;
        } catch (error) {
            throw handleApiError(error, "Gagal update role anggota");
        }
    },
};