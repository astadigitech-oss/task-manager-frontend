// "use client";

// import { useOnlineUsers } from "@/context/OnlineUserContext";
// import { useAuthStore } from "@/store/useAuthStore";
// import { useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Wifi, WifiOff, RefreshCw, Activity } from "lucide-react";

// /**
//  * Component untuk debugging WebSocket connection
//  * Hanya tampil untuk admin dalam development mode
//  */
// export function WebSocketDebugger() {
//     const { user } = useAuthStore();
//     const { isConnected, onlineUsers, refreshOnlineUsers, canViewOnlineUsers } = useOnlineUsers();
//     const [logs, setLogs] = useState<Array<{ time: string; message: string; type: string }>>([]);

//     // Hanya tampilkan untuk admin
//     if (!canViewOnlineUsers) {
//         return null;
//     }

//     // Override console untuk capture logs
//     useEffect(() => {
//         const originalLog = console.log;
//         const originalWarn = console.warn;
//         const originalError = console.error;

//         console.log = (...args) => {
//             const message = args.join(" ");
//             if (message.includes("WebSocket") || message.includes("online") || message.includes("User")) {
//                 setLogs((prev) => [
//                     ...prev.slice(-9),
//                     {
//                         time: new Date().toLocaleTimeString(),
//                         message,
//                         type: "log",
//                     },
//                 ]);
//             }
//             originalLog(...args);
//         };

//         console.warn = (...args) => {
//             const message = args.join(" ");
//             if (message.includes("WebSocket") || message.includes("online")) {
//                 setLogs((prev) => [
//                     ...prev.slice(-9),
//                     {
//                         time: new Date().toLocaleTimeString(),
//                         message,
//                         type: "warn",
//                     },
//                 ]);
//             }
//             originalWarn(...args);
//         };

//         console.error = (...args) => {
//             const message = args.join(" ");
//             if (message.includes("WebSocket") || message.includes("online")) {
//                 setLogs((prev) => [
//                     ...prev.slice(-9),
//                     {
//                         time: new Date().toLocaleTimeString(),
//                         message,
//                         type: "error",
//                     },
//                 ]);
//             }
//             originalError(...args);
//         };

//         return () => {
//             console.log = originalLog;
//             console.warn = originalWarn;
//             console.error = originalError;
//         };
//     }, []);

//     return (
//         <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-hidden shadow-lg z-50 border-2">
//             <CardHeader className="pb-3">
//                 <div className="flex items-center justify-between">
//                     <CardTitle className="text-sm flex items-center gap-2">
//                         <Activity className="w-4 h-4" />
//                         WebSocket Monitor
//                     </CardTitle>
//                     <div className="flex items-center gap-2">
//                         <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
//                             {isConnected ? (
//                                 <>
//                                     <Wifi className="w-3 h-3 mr-1" />
//                                     Connected
//                                 </>
//                             ) : (
//                                 <>
//                                     <WifiOff className="w-3 h-3 mr-1" />
//                                     Disconnected
//                                 </>
//                             )}
//                         </Badge>
//                         <Button
//                             size="sm"
//                             variant="outline"
//                             onClick={refreshOnlineUsers}
//                             className="h-6 px-2"
//                         >
//                             <RefreshCw className="w-3 h-3" />
//                         </Button>
//                     </div>
//                 </div>
//             </CardHeader>
//             <CardContent className="pt-0">
//                 <div className="space-y-2 text-xs">
//                     <div className="flex justify-between items-center p-2 bg-muted rounded">
//                         <span className="font-medium">Current User:</span>
//                         <span>{user?.name}</span>
//                     </div>
//                     <div className="flex justify-between items-center p-2 bg-muted rounded">
//                         <span className="font-medium">Online Users:</span>
//                         <Badge variant="secondary">{onlineUsers.length}</Badge>
//                     </div>

//                     <div className="mt-3">
//                         <div className="font-medium mb-2">Online Users List:</div>
//                         <div className="max-h-32 overflow-y-auto space-y-1">
//                             {onlineUsers.map((u) => (
//                                 <div
//                                     key={u.id}
//                                     className="flex items-center gap-2 p-1.5 bg-muted rounded text-xs"
//                                 >
//                                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
//                                     <span className="flex-1">{u.name}</span>
//                                     <Badge variant="outline" className="text-[10px]">
//                                         {u.role}
//                                     </Badge>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     <div className="mt-3">
//                         <div className="font-medium mb-2">Recent Logs:</div>
//                         <div className="max-h-32 overflow-y-auto space-y-1 bg-slate-950 text-slate-100 p-2 rounded font-mono text-[10px]">
//                             {logs.map((log, i) => (
//                                 <div
//                                     key={i}
//                                     className={`${
//                                         log.type === "error"
//                                             ? "text-red-400"
//                                             : log.type === "warn"
//                                             ? "text-yellow-400"
//                                             : "text-green-400"
//                                     }`}
//                                 >
//                                     <span className="text-slate-500">[{log.time}]</span> {log.message}
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             </CardContent>
//         </Card>
//     );
// }