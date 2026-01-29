import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { UserApi } from "@/types/api/user.api";
import { WS_BASE_URL } from "@/constants/api";

interface OnlineUsersResponse {
    success: boolean;
    data: UserApi[];
}

interface WebSocketConfig {
    token: string;
    workspace_id: number;
}

export const onlineUsersService = {
    /**
     * Fetch list of online users dari API
     * API: GET /users/online-status
     */
    getOnlineUsers: async (): Promise<UserApi[]> => {
        try {
            const response = await apiClient.get<OnlineUsersResponse>(
                API_ENDPOINTS.ONLINE_USERS.LIST
            );

            if (response.data.success && response.data.data) {
                console.log("📊 Online users fetched:", response.data.data.length);
                return response.data.data;
            }

            return [];
        } catch (err) {
            console.error("❌ Failed to fetch online users:", err);
            return [];
        }
    },

    /**
     * Build WebSocket URL untuk aktivasi status online
     * WebSocket: ws://base_url/ws?token=xxx&workspace_id=xxx
     */
    buildWebSocketUrl: (config: WebSocketConfig): string | null => {
        if (!WS_BASE_URL) {
            console.error("❌ WS_BASE_URL not configured");
            return null;
        }

        if (!config.token || !config.workspace_id) {
            console.error(
                "❌ Missing required WebSocket config",
                { token: !!config.token, workspace_id: !!config.workspace_id }
            );
            return null;
        }

        // Build: ws://base_url/ws?token=xxx&workspace_id=xxx
        const wsUrl = `${WS_BASE_URL}${API_ENDPOINTS.ONLINE_USERS.WS(
            config.token,
            config.workspace_id
        )}`;

        console.log("🔗 WebSocket URL built (token hidden)");
        return wsUrl;
    },

    /**
     * Create WebSocket connection untuk aktivasi status online
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
                console.log("✅ WebSocket connected - User is now ONLINE");
                handlers.onOpen?.();
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log("📨 WebSocket message:", message);
                    handlers.onMessage?.(message);
                } catch (err) {
                    console.error("❌ Failed to parse WebSocket message:", err);
                }
            };

            ws.onerror = (error) => {
                console.error("❌ WebSocket error:", error);
                handlers.onError?.(error);
            };

            ws.onclose = () => {
                console.log("🔌 WebSocket disconnected - User is now OFFLINE");
                handlers.onClose?.();
            };

            return ws;
        } catch (err) {
            console.error("❌ Failed to create WebSocket:", err);
            return null;
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