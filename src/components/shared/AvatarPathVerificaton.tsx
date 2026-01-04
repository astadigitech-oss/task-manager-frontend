// import React, { useEffect, useState } from 'react';
// import { useAuthStore } from '@/store/useAuthStore';
// import { resolveImageUrl } from '@/lib/utils/media';
// import { Card } from '@/components/ui/card';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// /**
//  * ✅ Component untuk verify avatar path di berbagai tempat
//  * Paste di SettingsPage atau Dashboard untuk debug
//  */
// export function AvatarPathVerification() {
//     const { user } = useAuthStore();
//     const [verificationResults, setVerificationResults] = useState<any[]>([]);

//     useEffect(() => {
//         if (!user) return;

//         const verify = async () => {
//             const results = [];

//             // 1. Check raw avatar path
//             results.push({
//                 label: "Raw avatar dari store",
//                 value: user.avatar,
//                 status: user.avatar ? "info" : "warning"
//             });

//             // 2. Check resolved URL
//             const resolved = resolveImageUrl(user.avatar);
//             results.push({
//                 label: "Resolved URL",
//                 value: resolved,
//                 status: resolved ? "info" : "error"
//             });

//             // 3. Test if URL accessible
//             if (resolved) {
//                 try {
//                     const response = await fetch(resolved, { method: 'HEAD' });
//                     results.push({
//                         label: "URL Accessibility Test",
//                         value: `${response.status} ${response.statusText}`,
//                         status: response.ok ? "success" : "error"
//                     });
//                 } catch (error: any) {
//                     results.push({
//                         label: "URL Accessibility Test",
//                         value: `Error: ${error.message}`,
//                         status: "error"
//                     });
//                 }
//             }

//             // 4. Check if path contains absolute filesystem path
//             if (user.avatar?.includes("/home/") || user.avatar?.includes("/var/")) {
//                 results.push({
//                     label: "⚠️ Path Issue Detected",
//                     value: "Avatar contains absolute filesystem path. Should be normalized!",
//                     status: "error"
//                 });
//             }

//             // 5. Check if path is already normalized
//             if (user.avatar?.startsWith("/uploads/")) {
//                 results.push({
//                     label: "✅ Path Format",
//                     value: "Avatar path is correctly normalized",
//                     status: "success"
//                 });
//             }

//             setVerificationResults(results);
//         };

//         verify();
//     }, [user]);

//     if (!user) return null;

//     const getStatusIcon = (status: string) => {
//         switch (status) {
//             case "success": return <CheckCircle className="h-5 w-5 text-green-500" />;
//             case "error": return <XCircle className="h-5 w-5 text-red-500" />;
//             case "warning": return <AlertCircle className="h-5 w-5 text-yellow-500" />;
//             default: return <AlertCircle className="h-5 w-5 text-blue-500" />;
//         }
//     };

//     return (
//         <Card className="p-4 space-y-3">
//             <h3 className="font-semibold text-lg">🔍 Avatar Path Verification</h3>

//             <Alert>
//                 <AlertDescription>
//                     <div className="space-y-2">
//                         {verificationResults.map((result, idx) => (
//                             <div key={idx} className="flex items-start gap-2">
//                                 {getStatusIcon(result.status)}
//                                 <div className="flex-1">
//                                     <p className="text-sm font-medium">{result.label}</p>
//                                     <p className="text-xs text-muted-foreground break-all font-mono">
//                                         {result.value || "null"}
//                                     </p>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </AlertDescription>
//             </Alert>

//             {user.avatar && (
//                 <div className="pt-2 border-t">
//                     <p className="text-sm font-medium mb-2">Preview:</p>
//                     <img
//                         src={resolveImageUrl(user.avatar)}
//                         alt={user.name}
//                         className="w-16 h-16 rounded-full object-cover border-2"
//                         onError={(e) => {
//                             e.currentTarget.style.border = "2px solid red";
//                             e.currentTarget.alt = "Failed to load";
//                         }}
//                         onLoad={() => {
//                             console.log("✅ Avatar loaded successfully in verification");
//                         }}
//                     />
//                 </div>
//             )}

//             <details className="text-xs">
//                 <summary className="cursor-pointer font-medium">View Full User Object</summary>
//                 <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded overflow-auto">
//                     {JSON.stringify(user, null, 2)}
//                 </pre>
//             </details>
//         </Card>
//     );
// }
