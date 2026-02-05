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
    workspaceId,
}: {
    children: ReactNode;
    workspaceId: number | null; //optional
}) {
    const { isAuthenticated, user, token } = useAuthStore();
    const queryClient = useQueryClient();

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = useRef<number>(0);
    const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const currentWorkspaceRef = useRef<number | null>(null);

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
        (isAdmin || workspaceId !== null);

    // Debounced cache invalidation
    const invalidateUsersCache = useCallback(() => {
        const now = Date.now();
        const timeSinceLastInvalidate = now - lastInvalidateRef.current;

        if (timeSinceLastInvalidate < 2000) {
            return;
        }

        if (invalidateTimeoutRef.current) {
            clearTimeout(invalidateTimeoutRef.current);
        }

        invalidateTimeoutRef.current = setTimeout(() => {
            console.log(" Invalidating users cache");
            lastInvalidateRef.current = Date.now();

            queryClient.invalidateQueries({
                queryKey: ["users"],
                refetchType: 'none'
            });
        }, 1000);
    }, [queryClient]);

    // Update user in cache WITHOUT invalidating entire cache
    const updateUserInCache = useCallback(
        (userId: number, isOnline: boolean, lastSeen?: string) => {
            console.log(` Updating cache for user ${userId}: ${isOnline ? "ONLINE" : "OFFLINE"}`);

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

            // TAMBAHAN: Invalidate queries untuk force re-render
            queryClient.invalidateQueries({
                queryKey: ["users"],
                refetchType: 'none' // Jangan fetch ulang, cukup re-render dengan data baru
            });
        },
        [queryClient]
    );

    const fetchOnlineUsers = useCallback(async () => {
        if (!canViewOnlineUsers) {
            return;
        }

        try {
            let users: UserApi[];

            if (isAdmin) {
                // Admin can fetch all online users globally
                console.log(`Fetching ALL online users (ADMIN)...`);
                users = await onlineUsersService.getOnlineUsers();
            } else {
                // Members need workspace
                if (!workspaceId) {
                    console.warn("Member cannot fetch online users without workspace");
                    return;
                }
                console.log(`Fetching online users for workspace ${workspaceId}...`);
                users = await onlineUsersService.getWorkspaceOnlineUsers(workspaceId);
            }

            dispatch({
                type: "BATCH_SYNC",
                users: users,
                timestamp: Date.now(),
            });

            console.log(`Fetched ${users.length} online users`);
            invalidateUsersCache();
        } catch (error) {
            console.error("Failed to fetch online users:", error);
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
            console.warn("Cannot connect WebSocket - missing requirements", {
                isAuthenticated,
                hasToken: !!token,
                hasUser: !!user,
                isAdmin,
                workspaceId,
            });
            return;
        }

        // For members, workspace is required
        if (!isAdmin && !workspaceId) {
            console.warn("Member cannot connect without workspace");
            return;
        }

        // Check if already connected to same workspace (or global for admin)
        const targetWorkspace = isAdmin ? (workspaceId || null) : workspaceId;
        if (
            currentWorkspaceRef.current === targetWorkspace &&
            isWebSocketOpen(wsRef.current)
        ) {
            console.log(
                targetWorkspace
                    ? ` Already connected to workspace ${targetWorkspace}`
                    : `Already connected (GLOBAL/ADMIN)`
            );
            return;
        }

        try {
            const connectionMode = isAdmin && !workspaceId ? "GLOBAL/ADMIN" : `workspace ${workspaceId}`;
            console.log(`🔌 Connecting WebSocket to ${connectionMode}...`);

            const wsUrl = onlineUsersService.buildWebSocketUrl({
                token: token!,
                workspace_id: workspaceId || undefined, // undefined for admin global
            });

            if (!wsUrl) {
                console.error(" Failed to build WebSocket URL");
                return;
            }

            const ws = onlineUsersService.createConnection(wsUrl, {
                onOpen: () => {
                    console.log(`WebSocket connected to ${connectionMode}`);
                    reconnectAttemptsRef.current = 0;
                    currentWorkspaceRef.current = targetWorkspace;

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
                    fetchOnlineUsers();

                    // Setup ping (every 3 minutes)
                    pingIntervalRef.current = setInterval(() => {
                        if (isWebSocketOpen(wsRef.current)) {
                            onlineUsersService.sendWebSocketPing(wsRef.current);
                        }
                    }, 3 * 60 * 1000);
                },

                onMessage: (message: UserWsEvent) => {
                    console.log(` WebSocket message:`, message.type);

                    if (!canViewOnlineUsers) return;

                    const timestamp = Date.now();

                    if (message.type === "USER_ONLINE") {
                        console.log(`User ${message.user.name} is ONLINE`);

                        // Update state
                        dispatch({
                            type: "USER_ONLINE",
                            user: message.user,
                            timestamp,
                        });

                        updateUserInCache(message.user.id, true);

                        queryClient.invalidateQueries({
                            queryKey: ["users"],
                            refetchType: 'none'
                        });

                    } else if (message.type === "USER_OFFLINE") {
                        console.log(`User ${message.user_id} is OFFLINE`);

                        const lastSeen = message.last_seen || new Date().toISOString();

                        dispatch({
                            type: "USER_OFFLINE",
                            userId: message.user_id,
                            lastSeen,
                            timestamp,
                        });

                        updateUserInCache(message.user_id, false, lastSeen);

                        queryClient.invalidateQueries({
                            queryKey: ["users"],
                            refetchType: 'none'
                        });
                    }
                },

                onError: (error) => {
                    console.error(`WebSocket error (${connectionMode}):`, error);
                },

                onClose: () => {
                    console.log(`🔌 WebSocket disconnected (${connectionMode})`);
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
                            console.error(" Max reconnection attempts reached");
                        }
                    }
                },
            });

            wsRef.current = ws;
        } catch (err) {
            console.error(" Failed to create WebSocket:", err);
        }
    }, [
        shouldConnect,
        token,
        user,
        workspaceId,
        fetchOnlineUsers,
        canViewOnlineUsers,
        updateUserInCache,
        isAuthenticated,
        isAdmin,
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

        // For admin: workspaceId can be null (global mode)
        // For members: workspaceId must not be null
        const targetWorkspace = isAdmin ? (workspaceId || null) : workspaceId;

        // Workspace changed - reconnect
        if (currentWorkspaceRef.current !== targetWorkspace) {
            console.log(
                `Workspace changed: ${currentWorkspaceRef.current || 'GLOBAL'} → ${targetWorkspace || 'GLOBAL'}`
            );
            disconnectWebSocket();

            const timer = setTimeout(() => {
                connectWebSocket();
            }, 100);

            return () => clearTimeout(timer);
        }

        // Connect if not connected
        if (!isWebSocketOpen(wsRef.current)) {
            connectWebSocket();
        }

        return () => {
            disconnectWebSocket();
        };
    }, [shouldConnect, workspaceId, isAdmin, connectWebSocket, disconnectWebSocket]);

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