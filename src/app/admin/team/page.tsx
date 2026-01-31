"use client";

import { useState, useMemo, useEffect } from "react";
import { TeamMembers } from "@/components/shared/TeamMember";
import { Input } from "@/components/ui/input";
import { Search, Home, Users, Circle, Wifi, WifiOff, RefreshCw, Bug } from "lucide-react";
import { useDeleteUser, useUsers } from "@/hooks/api/useUsers";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { showErrorToast, showSuccessToast } from "@/lib/helpers/toast-helpers";
import { useOnlineUsers } from "@/context/OnlineUserContext";

export default function TeamPage() {
  const {
    data,
    isLoading,
    refetch,
  } = useUsers({
    type: "global",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    isUserOnline,
    canViewOnlineUsers,
    // isConnected,
    refreshOnlineUsers,
  } = useOnlineUsers();

  const users = data?.data.users ?? [];

  //  SIMPLIFIED: Hitung online count langsung dari users array
  // Karena users sudah di-update via cache oleh OnlineUserContext
  const onlineCount = useMemo(() => {
    if (!canViewOnlineUsers) return 0;
    
    // Filter users yang is_online === true
    const count = users.filter(u => u.is_online === true).length;
    
    console.log(" Online Count Calculation:", {
      total: users.length,
      onlineCount: count,
      onlineUsers: users.filter(u => u.is_online).map(u => ({
        id: u.id,
        name: u.name,
        is_online: u.is_online
      }))
    });
    
    return count;
  }, [users, canViewOnlineUsers]);

  // Filter members untuk search
  const filteredMembers = useMemo(() => {
    return users.filter(
      (member) =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const handleDelete = () => {
    if (!deleteId) return;

    deleteUser(deleteId, {
      onSuccess: () => {
        showSuccessToast("User berhasil dihapus");
        setDeleteId(null);
        refetch();
      },
      onError: (error) => {
        showErrorToast(error.message || "Gagal menghapus user");
      },
    });
  };

  const handleRefreshAll = async () => {
    console.log(" Manual refresh triggered");
    try {
      await Promise.all([
        refetch(),
        refreshOnlineUsers(),
      ]);
      showSuccessToast("Data berhasil diperbarui");
    } catch (error) {
      showErrorToast("Gagal memperbarui data");
    }
  };

  const handleDebugClick = () => {
    console.log(" ===== FULL DEBUG DUMP =====");
    console.log("1. Raw users from API:");
    users.forEach(u => {
      console.log(`   ${u.id}: ${u.name} - is_online: ${u.is_online}`);
    });
    console.log("\n2. Online count:", onlineCount);
    console.log("3. Can view online users:", canViewOnlineUsers);
    // console.log("4. WebSocket connected:", isConnected);
    console.log("5. Current user:", user?.id, user?.name);
    
    console.log("\n6. Testing isUserOnline for each user:");
    users.forEach(u => {
      const online = isUserOnline(u.id);
      console.log(`   User ${u.name} (${u.id}): isUserOnline() = ${online}, is_online = ${u.is_online}`);
    });
  };

  const dashboardPath = user?.role === "admin" ? "/admin/dashboard" : "/member/dashboard";

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="shrink-0">
          <div className="px-6 py-6">
            <Breadcrumb className="mb-4">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => router.push(dashboardPath)}
                  >
                    <Home className="w-4 h-4" />
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Team
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Team Members
                </h1>
                <p className="text-muted-foreground mt-1">
                  Kelola anggota tim, role, dan divisinya
                </p>
              </div>

              <div className="flex items-center gap-3">

                {/* Online Counter - Simplified */}
                {canViewOnlineUsers && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                    <Circle className="w-2.5 h-2.5 fill-green-500 text-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400 tabular-nums">
                      {onlineCount} Online
                    </span>
                  </div>
                )}

                {/* Total Members */}
                <span className="text-sm text-muted-foreground">
                  {isLoading ? "Loading..." : `${users.length} Members`}
                </span>
              </div>
            </div>

            {/* Search & Actions */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cari anggota tim..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Refresh & Debug Buttons */}
              {canViewOnlineUsers && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshAll}
                    disabled={isLoading}
                    className="shrink-0 flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDebugClick}
                    className="shrink-0 flex items-center gap-2"
                  >
                    <Bug className="w-4 h-4" />
                    Debug
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDebug(!showDebug)}
                    className="shrink-0"
                  >
                    {showDebug ? "Hide Panel" : "Show Panel"}
                  </Button>
                </div>
              )}
            </div>

            {/* Search Results Info */}
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-3">
                Showing {filteredMembers.length} of {users.length} members
              </p>
            )}

            {/* Debug Panel */}
            {canViewOnlineUsers && showDebug && (
              <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-900 rounded-lg border-2 border-blue-500">
                <div className="flex items-center gap-2 mb-3">
                  <Bug className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-sm">Debug Panel - Real-time Status</span>
                </div>

                <div className="space-y-4 text-xs font-mono">
                  <div>
                    <div className="font-bold text-blue-600 mb-2">Summary</div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>Total Users: <span className="font-bold">{users.length}</span></div>
                      <div>Online Count: <span className="font-bold text-green-600">{onlineCount}</span></div>
                      {/* <div>WebSocket: <span className={isConnected ? "text-green-600" : "text-red-600"}>
                        {isConnected ? " Connected" : " Disconnected"}
                      </span></div> */}
                    </div>
                  </div>

                  <div>
                    <div className="font-bold text-purple-600 mb-2">All Users (from /users API - after cache update)</div>
                    <div className="max-h-40 overflow-y-auto space-y-1 bg-white dark:bg-slate-950 p-2 rounded">
                      {users.map(u => (
                        <div key={u.id} className={`flex justify-between ${u.is_online ? 'text-green-600' : 'text-gray-400'}`}>
                          <span>{u.id}: {u.name}</span>
                          <span className="font-bold">{u.is_online ? "✅ ONLINE" : "❌ OFFLINE"}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-[10px] text-gray-500 dark:text-gray-400">
                    💡 Tip: Online count berasal dari users.filter(u =&gt; u.is_online === true).length
                    <br />
                    Cache diupdate otomatis oleh OnlineUserContext saat ada perubahan via WebSocket
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <TeamMembers
            members={filteredMembers}
            onDelete={(id) => setDeleteId(id)}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              and remove their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}