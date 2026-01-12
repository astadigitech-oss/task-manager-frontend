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
import { useOnlineUsersQuery } from "@/hooks/api/useOnlineUsers";
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
                console.warn(` Ignoring stale online update for user ${action.user.id}`);
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
                console.warn(` Ignoring stale offline update for user ${action.userId}`);
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
                if (user.is_online) {
                    newOnlineUsers.set(user.id, user);
                    newLastUpdated[user.id] = action.timestamp;
                }
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
}

const OnlineUserContext = createContext<OnlineUserContextType | undefined>(undefined);

export function OnlineUserProvider({
    children,
    workspaceId,
}: {
    children: ReactNode;
    workspaceId?: number;
}) {
    const { isAuthenticated, isHydrated, token } = useAuthStore();
    const queryClient = useQueryClient();

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const MAX_RECONNECT_ATTEMPTS = 5;
    const RECONNECT_DELAY_MS = 3000;

    const [state, dispatch] = useReducer(onlineReducer, {
        onlineUsers: new Map(),
        offlineUsers: new Map(),
        lastUpdated: {},
    });

    // Fetch initial data via React Query
    const { data: initialUsers } = useOnlineUsersQuery();

    // Sync initial data ke state saat pertama kali load
    useEffect(() => {
        if (initialUsers && initialUsers.length > 0) {
            dispatch({
                type: "BATCH_SYNC",
                users: initialUsers,
                timestamp: Date.now(),
            });
        }
    }, [initialUsers]);

    // WebSocket connection
    const connectWebSocket = useCallback(() => {
        if (!isAuthenticated || !isHydrated || !token || !workspaceId) {
            console.warn("Cannot connect WebSocket: missing auth data");
            return;
        }

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            console.log(" WebSocket already connected");
            return;
        }

        try {
            const wsUrl = onlineUsersService.buildWebSocketUrl({
                token,
                workspace_id: workspaceId,
            });

            if (!wsUrl) {
                console.error(" Failed to build WebSocket URL");
                return;
            }

            console.log(` Connecting to WebSocket (workspace_id=${workspaceId})`);

            const ws = onlineUsersService.createConnection(wsUrl, {
                onOpen: () => {
                    console.log(" WebSocket connected");
                    reconnectAttemptsRef.current = 0;

                    queryClient.invalidateQueries({ queryKey: ["online-users"] });
                },
                onMessage: (message: UserWsEvent) => {
                    const timestamp = Date.now();

                    if (message.type === "USER_ONLINE") {
                        console.log(` User ${message.user.id} is online`);
                        dispatch({
                            type: "USER_ONLINE",
                            user: message.user,
                            timestamp,
                        });
                    } else if (message.type === "USER_OFFLINE") {
                        console.log(` User ${message.user_id} is offline`);
                        dispatch({
                            type: "USER_OFFLINE",
                            userId: message.user_id,
                            lastSeen: message.last_seen || new Date().toISOString(),
                            timestamp,
                        });
                    }
                },
                onError: (error) => {
                    console.error(" WebSocket error:", error);
                },
                onClose: () => {
                    console.log(" WebSocket disconnected");
                    wsRef.current = null;

                    if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
                        reconnectAttemptsRef.current++;
                        console.log(
                            ` Reconnecting in ${RECONNECT_DELAY_MS}ms (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`
                        );

                        reconnectTimeoutRef.current = setTimeout(() => {
                            connectWebSocket();
                        }, RECONNECT_DELAY_MS);
                    }
                },
            });

            wsRef.current = ws;
        } catch (err) {
            console.error(" Failed to create WebSocket:", err);
        }
    }, [isAuthenticated, isHydrated, token, workspaceId, queryClient]);

    // Disconnect WebSocket
    const disconnectWebSocket = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        onlineUsersService.closeConnection(wsRef.current);
        wsRef.current = null;

        dispatch({ type: "CLEAR" });
    }, []);

    //  Connect/disconnect based on auth state
    useEffect(() => {
        if (!isAuthenticated || !isHydrated || !token || !workspaceId) {
            disconnectWebSocket();
            return;
        }

        connectWebSocket();
    }, [isAuthenticated, isHydrated, token, workspaceId, connectWebSocket, disconnectWebSocket]);

    //  Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnectWebSocket();
        };
    }, [disconnectWebSocket]);

    const contextValue: OnlineUserContextType = {
        onlineUsers: Array.from(state.onlineUsers.values()),
        isUserOnline: (userId: number) => state.onlineUsers.has(userId),
        getLastSeen: (userId: number) => {
            const offline = state.offlineUsers.get(userId);
            return offline?.lastSeen || null;
        },
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