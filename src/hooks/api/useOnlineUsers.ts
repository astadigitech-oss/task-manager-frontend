import { useQuery } from "@tanstack/react-query";
import { onlineUsersService } from "@/services/onlineUsers.service";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Hook untuk query online users (hanya untuk admin)
 * WebSocket updates akan di-handle di OnlineUserContext
 */
export function useOnlineUsersQuery() {
    const { isAuthenticated, user } = useAuthStore();
    
    // Check if user is admin
    const isAdmin = user?.role === "admin";
    const canFetchOnlineUsers = isAuthenticated && isAdmin;

    return useQuery({
        queryKey: ["online-users"],
        queryFn: async () => {

            if (!isAdmin) {
                console.warn("⚠️ Non-admin users cannot fetch online users");
                return [];
            }
            return onlineUsersService.getOnlineUsers();
        },

        enabled: canFetchOnlineUsers,
        
        staleTime: 30 * 1000,
        
        refetchInterval: canFetchOnlineUsers ? 60 * 1000 : false,
        
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}