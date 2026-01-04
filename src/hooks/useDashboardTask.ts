import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";
import { TaskApi } from "@/types/api/task.api";
import { mapDashboardTask } from "@/lib/mapper/dashboardTask.mapper";
import { dashboardKeys } from "@/lib/react-query/dashboardKeys";

export function useDashboardTasks() {
    return useQuery<TaskApi[]>({
        queryKey: dashboardKeys.all,
        queryFn: async () => {
            const res = await dashboardService.get();

            if (!res.success) {
                throw new Error("Gagal memuat dashboard");
            }

            const tasks = res.data?.tasks ?? [];
            return tasks.map(mapDashboardTask);
        },
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
    });
}

export function useAdminDashboardTasks() {
    return useQuery<TaskApi[]>({
        queryKey: [...dashboardKeys.all, 'admin'],
        queryFn: async () => {
            const res = await dashboardService.getAdmin();

            if (!res.success) {
                throw new Error("Gagal memuat dashboard admin");
            }

            const tasks = res.data?.tasks ?? [];
            return tasks.map(mapDashboardTask);
        },
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
    });
}