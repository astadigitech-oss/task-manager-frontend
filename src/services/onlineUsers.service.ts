// services/onlineUsers.service.ts
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { UserApi } from "@/types/api/user.api";
import { WS_BASE_URL } from "@/constants/api";

interface OnlineUsersResponse {
    success: boolean;
    data: UserApi[];
}

interface WorkspaceOnlineUsersResponse {
    success: boolean;
    data: UserApi[];
}

interface WebSocketConfig {
    token: string;
    workspace_id?: number;
}

export const onlineUsersService = {
    /**
     * Fetch list of ALL online users (ADMIN ONLY)
     * API: GET /api/online-users
     */
    getOnlineUsers: async (): Promise<UserApi[]> => {
        try {
            const response = await apiClient.get<OnlineUsersResponse>(
                API_ENDPOINTS.ONLINE_USERS.ADMIN
            );

            if (response.data.success && response.data.data) {
                console.log("All online users fetched:", response.data.data.length);
                return response.data.data;
            }

            return [];
        } catch (err) {
            console.error("Failed to fetch all online users:", err);
            return [];
        }
    },

    /**
     * Fetch online users in specific workspace (MEMBER & ADMIN)
     * API: GET /api/workspaces/{workspace_id}/online-members
     */
    getWorkspaceOnlineUsers: async (
        workspace_id: number
    ): Promise<UserApi[]> => {
        try {
            const response = await apiClient.get<WorkspaceOnlineUsersResponse>(
                API_ENDPOINTS.ONLINE_USERS.USER(workspace_id)
            );

            if (response.data.success && response.data.data) {
                console.log(
                    `Workspace ${workspace_id} online users:`,
                    response.data.data.length
                );
                return response.data.data;
            }

            return [];
        } catch (err) {
            console.error(
                `Failed to fetch workspace ${workspace_id} online users:`,
                err
            );
            return [];
        }
    },

    /**
     * Build WebSocket URL
     */
    buildWebSocketUrl: (config: WebSocketConfig): string | null => {
        if (!WS_BASE_URL) {
            console.error("WS_BASE_URL not configured");
            return null;
        }

        if (!config.token) {
            console.error("Missing WebSocket token");
            return null;
        }

        const wsPath = API_ENDPOINTS.ONLINE_USERS.WS(
            config.token,
            config.workspace_id
        );

        const wsUrl = `${WS_BASE_URL}${wsPath}`;

        console.log(
            "WebSocket URL built",
            config.workspace_id
                ? `for workspace ${config.workspace_id}`
                : "(GLOBAL / ADMIN)"
        );

        return wsUrl;
    },


    /**
     * Create WebSocket connection
     */
    createConnection: (
        url: string,
        handlers: {
            onOpen?: () => void;
            onMessage?: (data: any) => void;
            onError?: (error: Event) => void;
            onClose?: () => void;
        }
    ): WebSocket | null => {
        try {
            console.log("🔌 Creating WebSocket connection...");

            const ws = new WebSocket(url);

            ws.onopen = () => {
                console.log("WebSocket connected");
                handlers.onOpen?.();
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    handlers.onMessage?.(message);
                } catch (err) {
                    console.error("Failed to parse WebSocket message:", err);
                }
            };

            ws.onerror = (error) => {
                console.error(" WebSocket error:", error);
                handlers.onError?.(error);
            };

            ws.onclose = () => {
                console.log(" WebSocket disconnected");
                handlers.onClose?.();
            };

            return ws;
        } catch (err) {
            console.error("Failed to create WebSocket:", err);
            return null;
        }
    },

    /**
     * Send ping through WebSocket
     */
    sendWebSocketPing: (ws: WebSocket | null): boolean => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.warn("Cannot send ping: WebSocket not connected");
            return false;
        }

        try {
            ws.send(JSON.stringify({ type: "ping" }));
            console.log(" WebSocket ping sent");
            return true;
        } catch (err) {
            console.error("Failed to send WebSocket ping:", err);
            return false;
        }
    },

    /**
     * Close WebSocket connection
     */
    closeConnection: (ws: WebSocket | null): void => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            console.log("🔌 Closing WebSocket connection...");
            ws.close();
        }
    },

    /**
     * Check if connection is open
     */
    isConnected: (ws: WebSocket | null): boolean => {
        return ws?.readyState === WebSocket.OPEN;
    },
};