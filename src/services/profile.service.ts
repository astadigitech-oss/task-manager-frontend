import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/interceptors";
import { ProfileApiResponse, ProfileGetResponse } from "@/types/api/profile.api";
import { UserProfile } from "@/types/api/user.api";
import { apiProfileToUserProfile, getProfileToUserProfile } from "@/lib/utils/converters";

const handleApiError = (error: any, customMessage?: string) => {
    if (error instanceof ApiError) {
        throw error;
    }
    throw new ApiError(500, customMessage || "Terjadi kesalahan tidak terduga");
};

export const profileService = {
    /**
     * Get current user profile
     */
    getMyProfile: async (existingUser?: UserProfile): Promise<UserProfile> => {
        try {
            const response = await apiClient.get<ProfileGetResponse>(
                API_ENDPOINTS.PROFILE.GET
            );
            return getProfileToUserProfile(response.data, existingUser);
        } catch (error) {
            throw handleApiError(error, "Gagal mengambil profile");
        }
    },

    /**
     * Update profile (SUPPORT FormData)
     */
    updateMyProfile: async (data: FormData): Promise<UserProfile> => {
        try {
            const response = await apiClient.put<ProfileApiResponse>(
                API_ENDPOINTS.PROFILE.UPDATE,
                data
            );
            return apiProfileToUserProfile(response.data);
        } catch (error) {
            console.error("profileService error:", error);
            throw handleApiError(error, "Gagal mengupdate profile");
        }
    },
};