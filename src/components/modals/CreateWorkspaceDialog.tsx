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
import { Loader2 } from "lucide-react";

import { useWorkspace } from "@/context/WorkspaceContext";
import { usersService } from "@/services/user.service";
import { showInfoToast } from "@/lib/helpers/toast-helpers";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (data: { name: string; color: string }) => void;
}

export function CreateWorkspaceDialog({ isOpen, onClose, onCreate }: Props) {
  const { createWorkspace, addBulkMembersToWorkspace } = useWorkspace();

  const [name, setName] = useState("");
  const [color, setColor] = useState("#4f46e5");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const toggleUser = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (!usersData) return;

    if (selectedUsers.length === usersData.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(usersData.map((u) => u.id));
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      showInfoToast("Nama workspace wajib diisi");
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

      if (selectedUsers.length > 0) {
        await addBulkMembersToWorkspace(workspace.id, selectedUsers);
      }

      onCreate?.({ name, color });
      onClose();
    } catch (err: any) {
      console.error("Create workspace failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                  checked={
                    !!usersData &&
                    selectedUsers.length === usersData.length &&
                    usersData.length > 0
                  }
                  onChange={toggleSelectAll}
                  disabled={!usersData || usersData.length === 0 || isSubmitting}
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
                    return (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <UserAvatar
                            name={user.name}
                            avatar={userAvatar}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUser(user.id)}
                          disabled={isSubmitting}
                          className="cursor-pointer shrink-0"
                        />
                      </div>
                    );
                  })}
                </ScrollArea>

                <p className="text-sm text-muted-foreground mt-1">
                  {selectedUsers.length} user dipilih
                </p>
              </>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isLoadingUsers}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Membuat...
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
