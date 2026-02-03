"use client";

import {
    createContext,
    useContext,
    useEffect,
    ReactNode,
    useRef,
    useCallback,
    useReducer,
} from "react";
import { UserApi, UserWsEvent } from "@/types/api/user.api";
import { useAuthStore } from "@/store/useAuthStore";
import { onlineUsersService } from "@/services/onlineUsers.service";
import { WS_CONFIG } from "@/constants/api";
import { useQueryClient } from "@tanstack/react-query";

interface OnlineState {
    onlineUsers: Map<number, UserApi>;
    offlineUsers: Map<number, { userId: number; lastSeen: string }>;
    lastUpdated: Record<number, number>;
}

type OnlineAction =
    | { type: "USER_ONLINE"; user: UserApi; timestamp: number }
    | { type: "USER_OFFLINE"; userId: number; lastSeen: string; timestamp: number }
    | { type: "BATCH_SYNC"; users: UserApi[]; timestamp: number }
    | { type: "CLEAR" };

function onlineReducer(state: OnlineState, action: OnlineAction): OnlineState {
    switch (action.type) {
        case "USER_ONLINE": {
            const lastUpdate = state.lastUpdated[action.user.id] || 0;
            if (action.timestamp < lastUpdate) {
                console.warn(`Ignoring stale online update for user ${action.user.id}`);
                return state;
            }

            const newOnlineUsers = new Map(state.onlineUsers);
            const newOfflineUsers = new Map(state.offlineUsers);
            const newLastUpdated = { ...state.lastUpdated };

            newOnlineUsers.set(action.user.id, action.user);
            newOfflineUsers.delete(action.user.id);
            newLastUpdated[action.user.id] = action.timestamp;

            return {
                onlineUsers: newOnlineUsers,
                offlineUsers: newOfflineUsers,
                lastUpdated: newLastUpdated,
            };
        }

        case "USER_OFFLINE": {
            const lastUpdate = state.lastUpdated[action.userId] || 0;
            if (action.timestamp < lastUpdate) {
                console.warn(`Ignoring stale offline update for user ${action.userId}`);
                return state;
            }

            const newOnlineUsers = new Map(state.onlineUsers);
            const newOfflineUsers = new Map(state.offlineUsers);
            const newLastUpdated = { ...state.lastUpdated };

            newOnlineUsers.delete(action.userId);
            newOfflineUsers.set(action.userId, {
                userId: action.userId,
                lastSeen: action.lastSeen,
            });
            newLastUpdated[action.userId] = action.timestamp;

            return {
                onlineUsers: newOnlineUsers,
                offlineUsers: newOfflineUsers,
                lastUpdated: newLastUpdated,
            };
        }

        case "BATCH_SYNC": {
            const newOnlineUsers = new Map<number, UserApi>();
            const newLastUpdated = { ...state.lastUpdated };

            action.users.forEach((user) => {
                newOnlineUsers.set(user.id, user);
                newLastUpdated[user.id] = action.timestamp;
            });

            return {
                onlineUsers: newOnlineUsers,
                offlineUsers: state.offlineUsers,
                lastUpdated: newLastUpdated,
            };
        }

        case "CLEAR":
            return {
                onlineUsers: new Map(),
                offlineUsers: new Map(),
                lastUpdated: {},
            };

        default:
            return state;
    }
}

interface OnlineUserContextType {
    onlineUsers: UserApi[];
    isUserOnline: (userId: number) => boolean;
    getLastSeen: (userId: number) => string | null;
    refreshOnlineUsers: () => Promise<void>;
    canViewOnlineUsers: boolean;
}

const OnlineUserContext = createContext<OnlineUserContextType | undefined>(undefined);

export function OnlineUserProvider({
    children,
    workspaceId = 1,
}: {
    children: ReactNode;
    workspaceId?: number;
}) {
    const { isAuthenticated, user, token } = useAuthStore();
    const queryClient = useQueryClient();

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    
    // DEBOUNCE untuk invalidate cache - menghindari multiple refetch
    const invalidateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastInvalidateRef = useRef<number>(0);

    const [state, dispatch] = useReducer(onlineReducer, {
        onlineUsers: new Map(),
        offlineUsers: new Map(),
        lastUpdated: {},
    });

    const isAdmin = user?.role === "admin";
    const canViewOnlineUsers = isAdmin;

    // OPTIMIZED: Debounced invalidate dengan minimum interval 3 detik
    const invalidateUsersCache = useCallback(() => {
        const now = Date.now();
        const timeSinceLastInvalidate = now - lastInvalidateRef.current;
        
        // Jangan invalidate jika baru saja di-invalidate (< 3 detik)
        if (timeSinceLastInvalidate < 3000) {
            console.log(`⏳ Skipping invalidate (too soon: ${timeSinceLastInvalidate}ms)`);
            return;
        }

        if (invalidateTimeoutRef.current) {
            clearTimeout(invalidateTimeoutRef.current);
        }

        // Debounce 500ms untuk menggabungkan multiple invalidate
        invalidateTimeoutRef.current = setTimeout(() => {
            console.log("Invalidating users cache");
            lastInvalidateRef.current = Date.now();
            
            queryClient.invalidateQueries({
                queryKey: ["users"],
            });
            queryClient.invalidateQueries({
                queryKey: ["online-users"],
            });
        }, 500);
    }, [queryClient]);

    //  OPTIMIZED: Update cache tanpa invalidate untuk perubahan kecil
    const updateUserInCache = useCallback((userId: number, isOnline: boolean, lastSeen?: string) => {
        queryClient.setQueriesData(
            { queryKey: ["users"] },
            (oldData: any) => {
                if (!oldData?.data?.users) return oldData;

                return {
                    ...oldData,
                    data: {
                        ...oldData.data,
                        users: oldData.data.users.map((u: UserApi) =>
                            u.id === userId
                                ? {
                                    ...u,
                                    is_online: isOnline,
                                    last_seen: lastSeen || u.last_seen
                                }
                                : u
                        ),
                    },
                };
            }
        );
    }, [queryClient]);

    const fetchOnlineUsers = useCallback(async () => {
        if (!canViewOnlineUsers) {
            console.warn("Non-admin users cannot fetch online users list");
            return;
        }

        try {
            console.log("Fetching online users...");
            const users = await onlineUsersService.getOnlineUsers();

            dispatch({
                type: "BATCH_SYNC",
                users: users,
                timestamp: Date.now(),
            });

            // CHANGED: Hanya invalidate jika ada perubahan signifikan
            // Tidak perlu invalidate di sini karena data sudah di-sync via dispatch
        } catch (error) {
            console.error("Failed to fetch online users:", error);
        }
    }, [canViewOnlineUsers]);

    const connectWebSocket = useCallback(() => {
        if (wsRef.current) {
            onlineUsersService.closeConnection(wsRef.current);
            wsRef.current = null;
        }

        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
        }

        if (!isAuthenticated || !token || !user) {
            console.warn("Cannot connect WebSocket: missing auth data");
            return;
        }

        try {
            const wsUrl = onlineUsersService.buildWebSocketUrl({
                token,
                workspace_id: workspaceId,
            });

            if (!wsUrl) {
                console.error("Failed to build WebSocket URL");
                return;
            }

            const ws = onlineUsersService.createConnection(wsUrl, {
                onOpen: () => {
                    console.log("WebSocket connected");
                    reconnectAttemptsRef.current = 0;

                    if (user) {
                        dispatch({
                            type: "USER_ONLINE",
                            user: user as UserApi,
                            timestamp: Date.now(),
                        });

                        // Update cache untuk current user (no invalidate)
                        updateUserInCache(user.id, true);
                    }

                    if (canViewOnlineUsers) {
                        fetchOnlineUsers();
                    }

                    //CHANGED: Ping setiap 5 menit (lebih hemat bandwidth)
                    pingIntervalRef.current = setInterval(() => {
                        const currentWs = wsRef.current;
                        if (currentWs && currentWs.readyState === WebSocket.OPEN) {
                            currentWs.send(JSON.stringify({ type: "ping" }));
                            console.log("Ping sent");
                        }
                    }, 5 * 60 * 1000); // 5 menit
                },

                onMessage: (message: UserWsEvent) => {
                    console.log("WebSocket message:", message.type);

                    if (!canViewOnlineUsers) {
                        return;
                    }

                    const timestamp = Date.now();

                    if (message.type === "USER_ONLINE") {
                        console.log(`User ${message.user.id} is now ONLINE`);

                        dispatch({
                            type: "USER_ONLINE",
                            user: message.user,
                            timestamp,
                        });

                        // OPTIMIZED: Update cache saja, tidak perlu invalidate
                        updateUserInCache(message.user.id, true);

                    } else if (message.type === "USER_OFFLINE") {
                        console.log(`User ${message.user_id} is now OFFLINE`);

                        dispatch({
                            type: "USER_OFFLINE",
                            userId: message.user_id,
                            lastSeen: message.last_seen || new Date().toISOString(),
                            timestamp,
                        });

                        // OPTIMIZED: Update cache saja, tidak perlu invalidate
                        updateUserInCache(
                            message.user_id,
                            false,
                            message.last_seen || new Date().toISOString()
                        );
                    }
                },

                onError: (error) => {
                    console.error("WebSocket error:", error);
                },

                onClose: () => {
                    console.log("🔌 WebSocket disconnected");
                    wsRef.current = null;

                    if (pingIntervalRef.current) {
                        clearInterval(pingIntervalRef.current);
                        pingIntervalRef.current = null;
                    }

                    if (reconnectAttemptsRef.current < WS_CONFIG.MAX_RECONNECT_ATTEMPTS) {
                        reconnectAttemptsRef.current++;
                        const delay = WS_CONFIG.RECONNECT_DELAY_MS * reconnectAttemptsRef.current;

                        console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);

                        reconnectTimeoutRef.current = setTimeout(() => {
                            connectWebSocket();
                        }, delay);
                    } else {
                        console.error("Max reconnection attempts reached");
                    }
                },
            });

            wsRef.current = ws;
        } catch (err) {
            console.error("Failed to create WebSocket:", err);
        }
    }, [
        isAuthenticated,
        token,
        user,
        workspaceId,
        fetchOnlineUsers,
        canViewOnlineUsers,
        updateUserInCache,
    ]);

    const disconnectWebSocket = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
        }

        if (invalidateTimeoutRef.current) {
            clearTimeout(invalidateTimeoutRef.current);
        }

        onlineUsersService.closeConnection(wsRef.current);
        wsRef.current = null;

        dispatch({ type: "CLEAR" });
    }, []);

    // OPTIMIZED: Polling dikurangi menjadi 5 menit (dari 1 menit)
    useEffect(() => {
        if (isAuthenticated && token && user && canViewOnlineUsers) {
            fetchOnlineUsers();

            pollingIntervalRef.current = setInterval(() => {
                console.log("🔄 Polling online users for sync...");
                fetchOnlineUsers();
            }, 5 * 60 * 1000); // 5 menit
        }

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [isAuthenticated, token, user, canViewOnlineUsers, fetchOnlineUsers]);

    // WebSocket connection management
    useEffect(() => {
        if (!isAuthenticated || !token || !user) {
            disconnectWebSocket();
            return;
        }

        connectWebSocket();

        return () => {
            disconnectWebSocket();
        };
    }, [isAuthenticated, token, user, connectWebSocket, disconnectWebSocket]);

    const contextValue: OnlineUserContextType = {
        onlineUsers: canViewOnlineUsers ? Array.from(state.onlineUsers.values()) : [],

        isUserOnline: (userId: number) => {
            if (userId === user?.id && isAuthenticated) {
                return true;
            }
            return canViewOnlineUsers ? state.onlineUsers.has(userId) : false;
        },

        getLastSeen: (userId: number) => {
            if (!canViewOnlineUsers) return null;
            const offline = state.offlineUsers.get(userId);
            return offline?.lastSeen || null;
        },

        refreshOnlineUsers: fetchOnlineUsers,
        canViewOnlineUsers,
    };

    return (
        <OnlineUserContext.Provider value={contextValue}>
            {children}
        </OnlineUserContext.Provider>
    );
}

export function useOnlineUsers() {
    const context = useContext(OnlineUserContext);
    if (!context) {
        throw new Error("useOnlineUsers must be used within OnlineUserProvider");
    }
    return context;
}