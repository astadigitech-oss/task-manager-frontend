import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { usersService } from "@/services/user.service";
import { UserListResponse } from "@/types/api/user.api";
import { useAuthStore } from "@/store/useAuthStore";
import { ApiError } from "@/lib/api/interceptors";

interface UseUsersParams {
    type?: "global" | "workspace";
    workspaceId?: number;
    page?: number;
    limit?: number;
}

export function useUsers(
    params: UseUsersParams = { type: "global" },
    options?: Omit<UseQueryOptions<UserListResponse>, "queryKey" | "queryFn">
) {
    const { isAuthenticated, user } = useAuthStore();
    const isMember = user?.role === "member";
    const isAdmin = user?.role === "admin";

    const {
        type = "global",
        workspaceId,
        page = 1,
        limit = 20,
    } = params;

    const isWorkspaceMode = type === "workspace";

    return useQuery<UserListResponse>({
        queryKey: [
            "users",
            type,
            isWorkspaceMode ? workspaceId : "global",
            page,
            limit,
        ],

        queryFn: async () => {
            const response = await usersService.getAllUsers(
                isWorkspaceMode
                    ? {
                        workspace_id: workspaceId,
                        page,
                        limit,
                    }
                    : {
                        page,
                        limit,
                    }
            );

            if (response.success && response.data.users) {
                response.data.users = response.data.users.map((user: any) => ({
                    ...user,
                    avatar: user.profile_image || null,
                    is_online: user.is_online ?? false,
                    last_seen: user.last_seen || null,
                }));
            }

            return response;
        },

        enabled:
            isAuthenticated &&
            !isMember &&
            (isWorkspaceMode ? !!workspaceId : true),

        staleTime: isAdmin ? 10 * 1000 : 5 * 60 * 1000,

        refetchInterval: isAdmin ? 30 * 1000 : false,

        refetchOnWindowFocus: isAdmin,

        ...options,
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, number>({
        mutationFn: (userId: number) => usersService.deleteUser(userId),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["users"],
            });
        },
    });
}