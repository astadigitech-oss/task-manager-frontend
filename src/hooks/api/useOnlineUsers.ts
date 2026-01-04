import { useQuery } from "@tanstack/react-query";
import { onlineUsersService } from "@/services/onlineUsers.service";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * WebSocket updates akan di-handle di context/provider terpisah
 */
export function useOnlineUsersQuery() {
    const { isAuthenticated } = useAuthStore();

    return useQuery({
        queryKey: ["online-users"],
        queryFn: () => onlineUsersService.getOnlineUsers(),
        enabled: false,

        staleTime: 30 * 1000,

        refetchInterval: 60 * 1000,
    });
}