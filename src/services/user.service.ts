import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/interceptors";
import { UserListResponse, } from "@/types/api/user.api";

interface GetUsersParams {
    page?: number;
    limit?: number;
    workspace_id?: number;
}


export const usersService = {
    /**
     * Get all users with pagination
     */
    getAllUsers: async (params?: GetUsersParams): Promise<UserListResponse> => {
        try {
            const response = await apiClient.get<UserListResponse>(
                API_ENDPOINTS.USER.LIST,
                { params }
            );
            return response.data;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(500, "Gagal memuat data user");
        }
    },

    /**
     * Delete user
     */
    deleteUser: async (user_id: number): Promise<void> => {
        try {
            await apiClient.delete(API_ENDPOINTS.USER.DELETE(user_id));
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(500, "Gagal menghapus user");
        }
    },
};