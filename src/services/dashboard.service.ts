import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { DashboardResponse } from "@/types/api/dashboard.api";
import { ApiError } from "@/lib/api/interceptors";

export const dashboardService = {
    /**
     * fetch dashboard
     */
    get: async (): Promise<DashboardResponse> => {
        try {
            const res = await apiClient.get(API_ENDPOINTS.DASHBOARD.LIST);
            return res.data;
        } catch (err) {
            throw new ApiError(500, "Gagal memuat dashboard");
        }
    },
    /**
     * fetch dashboard from admin
     */
    getAdmin: async (): Promise<DashboardResponse> => {
        try {
            const res = await apiClient.get(API_ENDPOINTS.DASHBOARD.ADMINS.LIST);
            return res.data;
        } catch (err) {
            throw new ApiError(500, "Gagal memuat dashboard");
        }
    },
};
