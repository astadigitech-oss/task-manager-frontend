import { useQuery } from "@tanstack/react-query";
import { onlineUsersService } from "@/services/onlineUsers.service";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Hook untuk query ALL online users (ADMIN ONLY)
 * Endpoint: GET /api/online-users
 */
export function useOnlineUsersQuery() {
    const { isAuthenticated, user } = useAuthStore();

    const isAdmin = user?.role === "admin";
    const canFetchOnlineUsers = isAuthenticated && isAdmin;

    return useQuery({
        queryKey: ["online-users", "admin"],
        queryFn: async () => {
            if (!isAdmin) {
                console.warn(" Non-admin users cannot fetch all online users");
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

/**
 * Hook untuk query workspace online users (MEMBER & ADMIN)
 * Endpoint: GET /api/workspaces/{workspace_id}/online-members
 */
export function useWorkspaceOnlineUsersQuery(workspace_id: number | null) {
    const { isAuthenticated } = useAuthStore();

    return useQuery({
        queryKey: ["online-users", "workspace", workspace_id],
        queryFn: async () => {
            if (!workspace_id) {
                console.warn(" No workspace_id provided");
                return [];
            }
            return onlineUsersService.getWorkspaceOnlineUsers(workspace_id);
        },

        enabled: isAuthenticated && !!workspace_id,

        staleTime: 30 * 1000,

        refetchInterval: isAuthenticated && !!workspace_id ? 60 * 1000 : false,

        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}