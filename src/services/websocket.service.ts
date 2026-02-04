
import { WS_BASE_URL, WS_CONFIG } from "@/constants/api";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { UserWsEvent } from "@/types/api/user.api";

export interface WebSocketConfig {
    token: string;
    workspaceId: number;
    onOpen?: () => void;
    onMessage?: (message: UserWsEvent | "pong") => void;
    onError?: (error: Event) => void;
    onClose?: () => void;
}

export class WebSocketManager {
    private ws: WebSocket | null = null;
    private config: WebSocketConfig;
    private pingInterval: NodeJS.Timeout | null = null;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private reconnectAttempts = 0;
    isConnecting: boolean | undefined;

    constructor(config: WebSocketConfig) {
        this.config = config;
    }

    connect() {
        // Prevent multiple simultaneous connections
        if (this.isConnecting) {
            console.log("⏭️ Already connecting, skipping...");
            return;
        }

        if (this.ws?.readyState === WebSocket.OPEN) {
            console.log("✅ WebSocket already connected");
            return;
        }

        this.isConnecting = true;

        const wsUrl = this.buildUrl();
        if (!wsUrl) {
            console.error("❌ Failed to build WebSocket URL");
            this.isConnecting = false;
            return;
        }

        try {
            console.log(`🔌 Connecting to workspace ${this.config.workspaceId}...`);
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log(`✅ Connected to workspace ${this.config.workspaceId}`);
                this.reconnectAttempts = 0;
                this.isConnecting = false;
                this.startPing();
                this.config.onOpen?.();
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.config.onMessage?.(message);
                } catch (error) {
                    console.error("❌ Failed to parse WebSocket message:", error);
                }
            };

            this.ws.onerror = (error) => {
                console.error("❌ WebSocket error:", error);
                this.isConnecting = false;
                this.config.onError?.(error);
            };

            this.ws.onclose = () => {
                console.log(`🔌 Disconnected from workspace ${this.config.workspaceId}`);
                this.isConnecting = false;
                this.stopPing();
                this.config.onClose?.();
                this.scheduleReconnect();
            };
        } catch (error) {
            console.error("❌ Failed to create WebSocket:", error);
            this.isConnecting = false;
        }
    }

    disconnect() {
        console.log("🔌 Disconnecting WebSocket...");

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        this.stopPing();

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        this.reconnectAttempts = 0;
    }

    sendPing() {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: "ping" }));
            console.log("💓 Ping sent");
        }
    }

    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    private buildUrl(): string | null {
        if (!WS_BASE_URL || !this.config.token || !this.config.workspaceId) {
            return null;
        }

        return `${WS_BASE_URL}${API_ENDPOINTS.ONLINE_USERS.WS(
            this.config.token,
            this.config.workspaceId
        )}`;
    }

    private startPing() {
        this.stopPing();
        this.pingInterval = setInterval(() => {
            this.sendPing();
        }, WS_CONFIG.PING_INTERVAL_MS);
    }

    private stopPing() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    private scheduleReconnect() {
        if (this.reconnectAttempts >= WS_CONFIG.MAX_RECONNECT_ATTEMPTS) {
            console.error("❌ Max reconnection attempts reached");
            return;
        }

        const delay = WS_CONFIG.RECONNECT_DELAY_MS * (this.reconnectAttempts + 1);
        this.reconnectAttempts++;

        console.log(
            `⏳ Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${WS_CONFIG.MAX_RECONNECT_ATTEMPTS})`
        );

        this.reconnectTimeout = setTimeout(() => {
            this.connect();
        }, delay);
    }
}
