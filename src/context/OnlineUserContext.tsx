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
    isConnected: boolean;
    currentWorkspaceId: number | null;
}

const OnlineUserContext = createContext<OnlineUserContextType | undefined>(
    undefined
);

function isWebSocketOpen(ws: WebSocket | null): boolean {
    if (!ws) return false;
    return ws.readyState === WebSocket.OPEN;
}

export function OnlineUserProvider({
    children,
    workspaceId = null,
}: {
    children: ReactNode;
    workspaceId?: number | null;
}) {
    const { isAuthenticated, user, token } = useAuthStore();
    const queryClient = useQueryClient();

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = useRef<number>(0);
    const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const currentWorkspaceRef = useRef<number | null>(null);

    // Debounce cache invalidation
    const invalidateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastInvalidateRef = useRef<number>(0);

    const [state, dispatch] = useReducer(onlineReducer, {
        onlineUsers: new Map(),
        offlineUsers: new Map(),
        lastUpdated: {},
    });

    const isAdmin = user?.role === "admin";
    const canViewOnlineUsers = isAuthenticated;
    const shouldConnect =
        isAuthenticated &&
        token &&
        user &&
        workspaceId !== null &&
        workspaceId !== undefined;

    // OPTIMIZED: Debounced cache invalidation
    const invalidateUsersCache = useCallback(() => {
        const now = Date.now();
        const timeSinceLastInvalidate = now - lastInvalidateRef.current;

        // Minimal 5 detik antara invalidate
        if (timeSinceLastInvalidate < 5000) {
            console.log(`Skipping cache invalidate (too soon: ${timeSinceLastInvalidate}ms)`);
            return;
        }

        if (invalidateTimeoutRef.current) {
            clearTimeout(invalidateTimeoutRef.current);
        }

        // Debounce 1 detik
        invalidateTimeoutRef.current = setTimeout(() => {
            console.log("Invalidating users cache");
            lastInvalidateRef.current = Date.now();

            queryClient.invalidateQueries({
                queryKey: ["users"],
            });
        }, 1000);
    }, [queryClient]);

    // OPTIMIZED: Update user in cache WITHOUT invalidating entire cache
    const updateUserInCache = useCallback(
        (userId: number, isOnline: boolean, lastSeen?: string) => {
            console.log(`Updating cache for user ${userId}: ${isOnline ? "ONLINE" : "OFFLINE"}`);

            queryClient.setQueriesData({ queryKey: ["users"] }, (oldData: any) => {
                if (!oldData?.data?.users) return oldData;

                const updatedUsers = oldData.data.users.map((u: UserApi) =>
                    u.id === userId
                        ? {
                            ...u,
                            is_online: isOnline,
                            last_seen: lastSeen || u.last_seen,
                        }
                        : u
                );

                return {
                    ...oldData,
                    data: {
                        ...oldData.data,
                        users: updatedUsers,
                    },
                };
            });
        },
        [queryClient]
    );

    const fetchOnlineUsers = useCallback(async () => {
        if (!canViewOnlineUsers) {
            return;
        }

        if (workspaceId === null || workspaceId === undefined) {
            console.warn("⚠️ Cannot fetch online users: No active workspace");
            return;
        }

        try {
            console.log(`📡 Fetching online users for workspace ${workspaceId}...`);

            let users: UserApi[];

            if (isAdmin) {
                users = await onlineUsersService.getOnlineUsers();
            } else {
                users = await onlineUsersService.getWorkspaceOnlineUsers(workspaceId);
            }

            dispatch({
                type: "BATCH_SYNC",
                users: users,
                timestamp: Date.now(),
            });

            console.log(`✅ Fetched ${users.length} online users`);

            // Invalidate cache setelah batch sync
            invalidateUsersCache();
        } catch (error) {
            console.error("❌ Failed to fetch online users:", error);
        }
    }, [canViewOnlineUsers, workspaceId, isAdmin, invalidateUsersCache]);

    const connectWebSocket = useCallback(() => {
        // Cleanup existing connection
        const existingWs = wsRef.current;
        if (existingWs) {
            onlineUsersService.closeConnection(existingWs);
            wsRef.current = null;
        }

        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
        }

        if (!shouldConnect) {
            console.warn("⚠️ Cannot connect WebSocket:", {
                isAuthenticated,
                hasToken: !!token,
                hasUser: !!user,
                hasWorkspace: workspaceId !== null && workspaceId !== undefined,
            });
            return;
        }

        // Check if already connected to same workspace
        const currentWs = wsRef.current;
        if (
            currentWorkspaceRef.current === workspaceId &&
            isWebSocketOpen(currentWs)
        ) {
            console.log(`✅ Already connected to workspace ${workspaceId}`);
            return;
        }

        try {
            console.log(`🔌 Connecting WebSocket to workspace ${workspaceId}...`);

            const wsUrl = onlineUsersService.buildWebSocketUrl({
                token: token!,
                workspace_id: workspaceId!,
            });

            if (!wsUrl) {
                console.error("❌ Failed to build WebSocket URL");
                return;
            }

            const ws = onlineUsersService.createConnection(wsUrl, {
                onOpen: () => {
                    console.log(`✅ WebSocket connected to workspace ${workspaceId}`);
                    reconnectAttemptsRef.current = 0;
                    currentWorkspaceRef.current = workspaceId;

                    // Mark current user as online
                    if (user) {
                        dispatch({
                            type: "USER_ONLINE",
                            user: user as UserApi,
                            timestamp: Date.now(),
                        });

                        updateUserInCache(user.id, true);
                    }

                    // Fetch initial online users
                    if (canViewOnlineUsers) {
                        fetchOnlineUsers();
                    }

                    // Setup WebSocket ping (every 3 minutes)
                    pingIntervalRef.current = setInterval(() => {
                        const pingWs = wsRef.current;
                        if (isWebSocketOpen(pingWs)) {
                            onlineUsersService.sendWebSocketPing(pingWs);
                        }
                    }, 3 * 60 * 1000); // 3 menit
                },

                onMessage: (message: UserWsEvent) => {
                    console.log(`📨 WebSocket message:`, message.type, message);

                    if (!canViewOnlineUsers) {
                        return;
                    }

                    const timestamp = Date.now();

                    if (message.type === "USER_ONLINE") {
                        console.log(
                            `✅ User ${message.user.id} (${message.user.name}) is now ONLINE`
                        );

                        dispatch({
                            type: "USER_ONLINE",
                            user: message.user,
                            timestamp,
                        });

                        // Update cache immediately
                        updateUserInCache(message.user.id, true);
                    } else if (message.type === "USER_OFFLINE") {
                        console.log(
                            `❌ User ${message.user_id} is now OFFLINE`
                        );

                        dispatch({
                            type: "USER_OFFLINE",
                            userId: message.user_id,
                            lastSeen: message.last_seen || new Date().toISOString(),
                            timestamp,
                        });

                        // Update cache immediately
                        updateUserInCache(
                            message.user_id,
                            false,
                            message.last_seen || new Date().toISOString()
                        );
                    } else if (message === "pong") {
                        console.log("Pong received from server");
                    }
                },

                onError: (error) => {
                    console.error(`WebSocket error (workspace ${workspaceId}):`, error);
                },

                onClose: () => {
                    console.log(`🔌 WebSocket disconnected (workspace ${workspaceId})`);
                    wsRef.current = null;
                    currentWorkspaceRef.current = null;

                    if (pingIntervalRef.current) {
                        clearInterval(pingIntervalRef.current);
                        pingIntervalRef.current = null;
                    }

                    // Auto-reconnect logic
                    if (shouldConnect) {
                        if (reconnectAttemptsRef.current < WS_CONFIG.MAX_RECONNECT_ATTEMPTS) {
                            reconnectAttemptsRef.current++;
                            const delay =
                                WS_CONFIG.RECONNECT_DELAY_MS * reconnectAttemptsRef.current;

                            console.log(
                                `Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${WS_CONFIG.MAX_RECONNECT_ATTEMPTS})`
                            );

                            reconnectTimeoutRef.current = setTimeout(() => {
                                connectWebSocket();
                            }, delay);
                        } else {
                            console.error(
                                " Max reconnection attempts reached. Please refresh the page."
                            );
                        }
                    }
                },
            });

            wsRef.current = ws;
        } catch (err) {
            console.error("Failed to create WebSocket:", err);
        }
    }, [
        shouldConnect,
        isAuthenticated,
        token,
        user,
        workspaceId,
        fetchOnlineUsers,
        canViewOnlineUsers,
        updateUserInCache,
    ]);

    const disconnectWebSocket = useCallback(() => {
        console.log("🔌 Disconnecting WebSocket...");

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
        }

        if (invalidateTimeoutRef.current) {
            clearTimeout(invalidateTimeoutRef.current);
        }

        const ws = wsRef.current;
        if (ws) {
            onlineUsersService.closeConnection(ws);
        }
        wsRef.current = null;
        currentWorkspaceRef.current = null;

        dispatch({ type: "CLEAR" });
    }, []);

    // Main WebSocket connection effect
    useEffect(() => {
        if (!shouldConnect) {
            console.log("WebSocket requirements not met, disconnecting...");
            disconnectWebSocket();
            return;
        }

        // Workspace changed - reconnect
        if (currentWorkspaceRef.current !== workspaceId) {
            console.log(
                ` Workspace changed: ${currentWorkspaceRef.current} -> ${workspaceId}`
            );
            disconnectWebSocket();

            const timer = setTimeout(() => {
                connectWebSocket();
            }, 100);

            return () => clearTimeout(timer);
        }

        // Connect if not connected
        const ws = wsRef.current;
        if (!isWebSocketOpen(ws)) {
            connectWebSocket();
        }

        return () => {
            disconnectWebSocket();
        };
    }, [shouldConnect, workspaceId, connectWebSocket, disconnectWebSocket]);

    const contextValue: OnlineUserContextType = {
        onlineUsers: canViewOnlineUsers
            ? Array.from(state.onlineUsers.values())
            : [],

        isUserOnline: (userId: number) => {
            // Current user is always online if authenticated
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
        isConnected: isWebSocketOpen(wsRef.current),
        currentWorkspaceId: currentWorkspaceRef.current,
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