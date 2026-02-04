// "use client";

// import { useEffect } from "react";
// import { useQueryClient } from "@tanstack/react-query";
// import { useAuthStore } from "@/store/useAuthStore";
// import { socketService } from "@/lib/socket/SocketService";
// import { SOCKET_EVENTS } from "@/lib/socket/SocketEvent";

// export function OnlineUserProvider({ children }: { children: React.ReactNode }) {
//     const { token, isAuthenticated } = useAuthStore();
//     const queryClient = useQueryClient();

//     useEffect(() => {
//         if (!isAuthenticated || !token) {
//             socketService.disconnect();
//             return;
//         }

//         socketService.connect(token);

//         const refreshOnlineUsers = () => {
//             queryClient.invalidateQueries({ queryKey: ["online-users"] });
//         };

//         socketService.on(SOCKET_EVENTS.USER_ONLINE, refreshOnlineUsers);
//         socketService.on(SOCKET_EVENTS.USER_OFFLINE, refreshOnlineUsers);

//         return () => {
//             socketService.off(SOCKET_EVENTS.USER_ONLINE, refreshOnlineUsers);
//             socketService.off(SOCKET_EVENTS.USER_OFFLINE, refreshOnlineUsers);
//         };
//     }, [isAuthenticated, token, queryClient]);

//     return children;
// }
