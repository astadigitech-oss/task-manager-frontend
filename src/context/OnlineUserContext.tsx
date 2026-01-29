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

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const [state, dispatch] = useReducer(onlineReducer, {
        onlineUsers: new Map(),
        offlineUsers: new Map(),
        lastUpdated: {},
    });

    // Check if current user is admin
    const isAdmin = user?.role === "admin";
    const canViewOnlineUsers = isAdmin;

    // Fetch online users dari API (hanya untuk admin)
    const fetchOnlineUsers = useCallback(async () => {
        if (!canViewOnlineUsers) {
            console.warn("⚠️ Non-admin users cannot fetch online users list");
            return;
        }

        try {
            const users = await onlineUsersService.getOnlineUsers();
            
            dispatch({
                type: "BATCH_SYNC",
                users: users,
                timestamp: Date.now(),
            });
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
            console.warn("⚠️ Cannot connect WebSocket: missing auth data");
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
                    reconnectAttemptsRef.current = 0;

                    // Mark current user as online immediately
                    if (user) {
                        dispatch({
                            type: "USER_ONLINE",
                            user: user as UserApi,
                            timestamp: Date.now(),
                        });
                    }

                    if (canViewOnlineUsers) {
                        fetchOnlineUsers();
                    }
                    pingIntervalRef.current = setInterval(() => {
                        const currentWs = wsRef.current;
                        if (currentWs && currentWs.readyState === WebSocket.OPEN) {
                            currentWs.send(JSON.stringify({ type: "ping" }));
                            console.log("🏓 Ping sent to keep connection alive");
                        }
                    }, 25000); //25 seconds 
                },

                onMessage: (message: UserWsEvent) => {

                    if (!canViewOnlineUsers) {
                        return;
                    }

                    const timestamp = Date.now();

                    if (message.type === "USER_ONLINE") {
                        dispatch({
                            type: "USER_ONLINE",
                            user: message.user,
                            timestamp,
                        });
                    } else if (message.type === "USER_OFFLINE") {
                        dispatch({
                            type: "USER_OFFLINE",
                            userId: message.user_id,
                            lastSeen: message.last_seen || new Date().toISOString(),
                            timestamp,
                        });
                    }
                },

                onError: (error) => {
                    console.error("WebSocket error:", error);
                },

                onClose: () => {
                    wsRef.current = null;

                    // Clear ping interval
                    if (pingIntervalRef.current) {
                        clearInterval(pingIntervalRef.current);
                        pingIntervalRef.current = null;
                    }

                    // Auto-reconnect
                    if (reconnectAttemptsRef.current < WS_CONFIG.MAX_RECONNECT_ATTEMPTS) {
                        reconnectAttemptsRef.current++;
                        const delay = WS_CONFIG.RECONNECT_DELAY_MS * reconnectAttemptsRef.current;

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
    }, [isAuthenticated, token, user, workspaceId, fetchOnlineUsers, canViewOnlineUsers]);

    // Disconnect WebSocket
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

        onlineUsersService.closeConnection(wsRef.current);
        wsRef.current = null;

        dispatch({ type: "CLEAR" });
    }, []);

    useEffect(() => {
        if (isAuthenticated && token && user && canViewOnlineUsers) {

            fetchOnlineUsers();

            pollingIntervalRef.current = setInterval(() => {
                console.log("Polling online users for sync...");
                fetchOnlineUsers();
            }, 60000);
        }

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [isAuthenticated, token, user, canViewOnlineUsers, fetchOnlineUsers]);

    useEffect(() => {
        if (!isAuthenticated || !token || !user) {
            disconnectWebSocket();
            return;
        }

        connectWebSocket();

        // Cleanup on unmount
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