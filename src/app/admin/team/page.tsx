"use client";

import { useState } from "react";
import { TeamMembers } from "@/components/shared/TeamMember";
import { Input } from "@/components/ui/input";
import { Search, Home, Users } from "lucide-react";
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
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const router = useRouter();
  const { user } = useAuthStore();
  const users = data?.data.users ?? [];

  const filteredMembers = users.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = () => {
    if (!deleteId) return;

    deleteUser(deleteId, {
      onSuccess: () => {
        showSuccessToast("User berhasil dihapus");
        setDeleteId(null);
      },
      onError: (error) => {
        showErrorToast(error.message || "Gagal menghapus user");
      },
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
                <span className="text-sm text-muted-foreground">
                  {isLoading ? "Loading..." : `${users.length} Members`}
                </span>
              </div>
            </div>

            {/* Search & Action */}
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
            </div>

            {/* Results info */}
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-3">
                Showing {filteredMembers.length} of {users.length} members
              </p>
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
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}