"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Loader2, UserCheck } from "lucide-react"; 

import { useWorkspace } from "@/context/WorkspaceContext";
import { useAuthStore } from "@/store/useAuthStore";
import { usersService } from "@/services/user.service";
import { showInfoToast, showSuccessToast, showErrorToast } from "@/lib/helpers/toast-helpers";
import { UserApi } from "@/types/api/user.api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (data: { name: string; color: string }) => void;
}

export function CreateWorkspaceDialog({ isOpen, onClose, onCreate }: Props) {
  const { createWorkspace, addBulkMembersToWorkspace } = useWorkspace();
  const { user } = useAuthStore(); 

  const [name, setName] = useState("");
  const [color, setColor] = useState("#4f46e5");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dapatkan current user ID
  const currentUserId = user?.id;

  const {
    data: usersData,
    isLoading: isLoadingUsers,
  } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: async () => {
      const res = await usersService.getAllUsers({ limit: 1000 });
      if (!res.success || !res.data) {
        throw new Error("Gagal memuat users");
      }
      return res.data.users;
    },
    enabled: isOpen,
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setColor("#4f46e5");
      setSelectedUsers([]);
    }
  }, [isOpen]);

  // FUNGSI HELPER: Cek apakah user adalah current user (admin yang login)
  const isCurrentUser = (userItem: UserApi): boolean => {
    if (!currentUserId) return false;
    return Number(userItem.id) === Number(currentUserId);
  };

  // FUNGSI HELPER: Cek apakah user bisa dipilih
  const isUserSelectable = (userItem: UserApi): boolean => {
    return !isCurrentUser(userItem);
  };

  const toggleUser = (userId: number, userItem: UserApi) => {
    // Cegah toggle jika user adalah current user
    if (!isUserSelectable(userItem)) {
      showInfoToast("Anda sebagai pembuat workspace akan otomatis ditambahkan");
      return;
    }

    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (!usersData) return;

    // Filter hanya user yang bisa dipilih (exclude current user)
    const selectableUsers = usersData.filter(isUserSelectable);

    if (selectedUsers.length === selectableUsers.length && selectableUsers.length > 0) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(selectableUsers.map((u) => u.id));
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      showInfoToast("Nama workspace wajib diisi");
      return;
    }

    if (name.trim().length < 3) {
      showInfoToast("Nama workspace minimal 3 karakter");
      return;
    }

    setIsSubmitting(true);

    try {
      const workspace = await createWorkspace({
        name: name.trim(),
        color,
      });

      if (!workspace?.id) {
        throw new Error("Workspace berhasil dibuat, tapi ID tidak ditemukan");
      }

      // Tambahkan members HANYA yang dipilih (exclude current user karena sudah otomatis)
      if (selectedUsers.length > 0) {
        try {
          await addBulkMembersToWorkspace(workspace.id, selectedUsers);
          showSuccessToast(
            `Workspace berhasil dibuat! Anda dan ${selectedUsers.length} anggota lainnya telah ditambahkan.`
          );
        } catch (memberError) {
          console.error("Error adding members:", memberError);
          showSuccessToast("Workspace berhasil dibuat, tapi ada masalah menambahkan beberapa anggota");
        }
      } else {
        showSuccessToast("Workspace berhasil dibuat! Anda telah ditambahkan sebagai anggota.");
      }

      setName("");
      setColor("#4f46e5");
      setSelectedUsers([]);

      onCreate?.({ name: name.trim(), color });
      onClose();
    } catch (err: any) {
      console.error("Create workspace failed:", err);
      showErrorToast("Gagal membuat workspace. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hitung jumlah user yang bisa dipilih
  const selectableUsers = usersData?.filter(isUserSelectable) || [];
  const selectableUsersCount = selectableUsers.length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!isSubmitting) {
        onClose();
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Buat Workspace</DialogTitle>
        </DialogHeader>

        {/* Workspace Name Section */}
        <div className="space-y-6 overflow-y-auto pr-1">
          <div className="space-y-2">
            <Label>Nama Workspace</Label>
            <Input
              placeholder="Marketing, Development..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Color Field Section */}
          <div className="space-y-2">
            <Label>Warna</Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={isSubmitting}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#4f46e5"
                disabled={isSubmitting}
                className="flex-1"
              />
            </div>
          </div>

          {/* Add Members Section */}
          <div>
            <div className="flex items-center justify-between border-b pb-2 mb-2">
              <Label>Tambah Anggota (Opsional)</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Pilih Semua</span>
                <input
                  type="checkbox"
                  checked={selectedUsers.length === selectableUsersCount && selectableUsersCount > 0}
                  onChange={toggleSelectAll}
                  disabled={!usersData || selectableUsersCount === 0 || isSubmitting}
                  className="cursor-pointer w-4 h-4"
                />
              </div>
            </div>

            {isLoadingUsers ? (
              <div className="border rounded-lg p-4 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : !usersData || usersData.length === 0 ? (
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground text-center">
                  Tidak ada user yang tersedia
                </p>
              </div>
            ) : (
              <>
                <ScrollArea className="h-48 border rounded-md p-2">
                  {usersData.map((user) => {
                    const userAvatar = (user as any).profile_image || user.avatar || "";
                    const isCurrentUserItem = isCurrentUser(user);
                    const selectable = isUserSelectable(user);

                    return (
                      <div
                        key={user.id}
                        className={`flex items-center justify-between p-2 rounded-md ${
                          selectable ? 'hover:bg-muted' : 'bg-muted/50 opacity-75'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <UserAvatar
                            name={user.name}
                            avatar={userAvatar}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">
                                {user.name}
                              </p>
                              {isCurrentUserItem && (
                                <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                  <UserCheck className="w-3 h-3" />
                                  Anda
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isCurrentUserItem && (
                            <span className="text-xs text-muted-foreground mr-2">
                              Auto added
                            </span>
                          )}
                          <input
                            type="checkbox"
                            checked={isCurrentUserItem || selectedUsers.includes(user.id)}
                            onChange={() => toggleUser(user.id, user)}
                            disabled={isSubmitting || !selectable || isCurrentUserItem}
                            className={`shrink-0 ${
                              selectable && !isCurrentUserItem ? 'cursor-pointer' : 'cursor-not-allowed'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </ScrollArea>

                <p className="text-sm text-muted-foreground mt-1">
                  {selectedUsers.length} user dipilih + Anda (otomatis)
                </p>
              </>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isLoadingUsers}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Membuat Workspace...
              </>
            ) : (
              "Buat Workspace"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}