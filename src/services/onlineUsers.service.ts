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
     * Fetch initial list of online users dari API
     */
    getOnlineUsers: async (): Promise<UserApi[]> => {
        try {
            const response = await apiClient.get<OnlineUsersResponse>(
                API_ENDPOINTS.ONLINE_USERS.LIST
            );

            if (response.data.success && response.data.data) {
                console.log(

                );
                return response.data.data;
            }

            return [];
        } catch (err) {

            return [];
        }
    },

    /**
     * Build WebSocket URL dengan token dan workspace_id
     */
    buildWebSocketUrl: (config: WebSocketConfig): string | null => {
        if (!WS_BASE_URL) {
            return null;
        }

        if (!config.token || !config.workspace_id) {
            console.error(
                " Missing required WebSocket config",
                { token: !!config.token, workspace_id: !!config.workspace_id }
            );
            return null;
        }

        const wsUrl = `${WS_BASE_URL}${API_ENDPOINTS.ONLINE_USERS.WS(
            config.token,
            config.workspace_id
        )}`;

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
            console.log(
                ` Creating WebSocket connection to: ${url.substring(
                    0,
                    url.indexOf("?")
                )}...`
            );

            const ws = new WebSocket(url);

            ws.onopen = () => {
                handlers.onOpen?.();
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    handlers.onMessage?.(message);
                } catch (err) {
                }
            };

            ws.onerror = (error) => {
                handlers.onError?.(error);
            };

            ws.onclose = () => {
                handlers.onClose?.();
            };

            return ws;
        } catch (err) {
            return null;
        }
    },

    /**
     * Close WebSocket connection
     */
    closeConnection: (ws: WebSocket | null): void => {
        if (ws && ws.readyState === WebSocket.OPEN) {
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
