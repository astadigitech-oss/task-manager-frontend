"use client";

import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useAuthStore } from "@/store/useAuthStore";
import { projectKeys } from "@/context/ProjectContext";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { workspaceMembersService } from "@/services/workspaces/workspaceMember.service";
import { projectMembersService } from "@/services/projects/projectMember.service";
import { projectsService } from "@/services/projects/project.service";
import { WorkspaceMemberApi } from "@/types/api/workspace.api";
import { ScrollArea } from "../ui/scroll-area";
import { FolderSearch, Loader2, UserCheck } from "lucide-react";
import { showInfoToast, showSuccessToast, showErrorToast } from "@/lib/helpers/toast-helpers";
import { UserAvatar } from "../shared/UserAvatar";

interface CreateProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectDialog({
  isOpen,
  onClose,
}: CreateProjectDialogProps) {
  const queryClient = useQueryClient();
  const { workspaces, selectedWorkspaceId } = useWorkspace();
  const { user } = useAuthStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [workspaceId, setWorkspaceId] = useState<number | null>(null);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMemberApi[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUserId = user?.id;

  useEffect(() => {
    if (!isOpen) return;

    if (selectedWorkspaceId) {
      setWorkspaceId(selectedWorkspaceId);
    } else if (workspaces.length > 0) {
      setWorkspaceId(workspaces[0].id);
    }
  }, [isOpen, selectedWorkspaceId, workspaces]);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!workspaceId) {
        setWorkspaceMembers([]);
        return;
      }

      setIsLoadingMembers(true);

      try {
        const response = await workspaceMembersService.getAll(workspaceId);

        if (response.success && response.data) {
          setWorkspaceMembers(response.data);
        } else {
          setWorkspaceMembers([]);
        }
      } catch (error) {
        console.error("Failed to fetch workspace members:", error);
        setWorkspaceMembers([]);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [workspaceId]);

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setDescription("");
      setSelectedUserIds([]);
    }
  }, [isOpen]);

  const isCurrentUser = (member: WorkspaceMemberApi): boolean => {
    if (!currentUserId) return false;

    const memberId = member.user_id || member.user?.id || member.id;
    return Number(memberId) === Number(currentUserId);
  };

  const isMemberSelectable = (member: WorkspaceMemberApi): boolean => {
    return !isCurrentUser(member);
  };

  const toggleSelectAll = () => {
    const selectableMembers = workspaceMembers.filter(isMemberSelectable);

    if (selectedUserIds.length === selectableMembers.length && selectableMembers.length > 0) {
      setSelectedUserIds([]);
    } else {
      const allUserIds = selectableMembers
        .map(m => Number(m.user_id || m.user?.id || m.id))
        .filter(id => id && !isNaN(id));

      setSelectedUserIds(allUserIds);
    }
  };

  const toggleMember = (member: WorkspaceMemberApi) => {
    if (!isMemberSelectable(member)) {
      showInfoToast("Anda sebagai pembuat project akan otomatis ditambahkan");
      return;
    }

    const userId = member.user_id || member.user?.id || member.id;
    const numericUserId = Number(userId);

    setSelectedUserIds((prev) =>
      prev.includes(numericUserId)
        ? prev.filter((id) => id !== numericUserId)
        : [...prev, numericUserId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showInfoToast("Nama project wajib diisi!");
      return;
    }

    if (name.trim().length < 3) {
      showInfoToast("Nama project minimal 3 karakter.");
      return;
    }

    if (!workspaceId) {
      showInfoToast("Pilih workspace terlebih dahulu!");
      return;
    }

    setIsSubmitting(true);

    try {
      const createPayload = {
        name: name.trim(),
        description: description.trim() || null,
        workspace_id: Number(workspaceId),
      };

      const createdProject = await projectsService.create(createPayload);

      if (!createdProject.success || !createdProject.data) {
        throw new Error("Gagal membuat project");
      }

      const projectId = createdProject.data.id;

      // Tambahkan members HANYA yang dipilih
      if (selectedUserIds.length > 0) {
        try {
          await projectMembersService.addBulk(projectId, selectedUserIds);
          showSuccessToast(
            `Project berhasil dibuat! Anda dan ${selectedUserIds.length} anggota lainnya telah ditambahkan.`
          );
        } catch (memberError) {
          console.error("Error adding members:", memberError);
          showSuccessToast("Project berhasil dibuat, tapi ada masalah menambahkan beberapa anggota");
        }
      } else {
        showSuccessToast("Project berhasil dibuat!");
      }

      setName("");
      setDescription("");
      setSelectedUserIds([]);

      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });

      onClose();
    } catch (err) {
      console.error("Create project error:", err);
      showErrorToast("Gagal membuat project. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hitung jumlah member yang bisa dipilih
  const selectableMembers = workspaceMembers.filter(isMemberSelectable);
  const selectableMembersCount = selectableMembers.length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!isSubmitting) {
        onClose();
      }
    }}>
      <DialogContent
        className="max-w-2xl p-0 gap-0 flex flex-col"
        style={{ maxHeight: "90vh", height: "90vh" }}
        aria-describedby={undefined}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle>Buat Project Baru</DialogTitle>
          <DialogDescription>
            Isi form berikut untuk membuat project baru dan assign anggota tim
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">

          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-4 px-6 py-4">

                {/* Nama Project */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Project</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama project"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Deskripsikan project Anda"
                    rows={3}
                    disabled={isSubmitting}
                    className="min-h-30 resize-none"
                  />
                </div>

                {/* Workspace Selection */}
                <div className="space-y-2">
                  <Label htmlFor="workspace">Workspace</Label>
                  <Select
                    value={workspaceId ? String(workspaceId) : undefined}
                    onValueChange={(value) => {
                      setWorkspaceId(Number(value));
                      setSelectedUserIds([]);
                    }}
                  >
                    <SelectTrigger id="workspace" className="w-full border bg-white dark:bg-neutral-800">
                      <FolderSearch className="w-4 h-4 mr-2 text-gray-500" />
                      <SelectValue placeholder="Pilih workspace" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-neutral-900">
                      {workspaces.map((workspace) => (
                        <SelectItem key={workspace.id} value={String(workspace.id)}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: workspace.color }}
                            />
                            {workspace.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Team Members */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b pb-2">
                    <Label>Tambah Anggota dari Workspace</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Pilih Semua</span>
                      <input
                        type="checkbox"
                        checked={selectedUserIds.length === selectableMembersCount && selectableMembersCount > 0}
                        onChange={toggleSelectAll}
                        disabled={isSubmitting || isLoadingMembers || selectableMembersCount === 0}
                        className="cursor-pointer w-4 h-4 mt-0.5"
                      />
                    </div>
                  </div>

                  {isLoadingMembers ? (
                    <div className="border rounded-lg p-4 flex justify-center">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  ) : workspaceMembers.length === 0 ? (
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground text-center">
                        Tidak ada anggota di workspace ini
                      </p>
                    </div>
                  ) : (
                    <>
                      <ScrollArea className="h-48 border rounded-md p-2">
                        {workspaceMembers.map((m) => {
                          const userId = m.user_id || m.user?.id || m.id;
                          const numericUserId = Number(userId);
                          const isCurrentUserMember = isCurrentUser(m);
                          const selectable = isMemberSelectable(m);

                          return (
                            <div
                              key={m.id}
                              className={`flex items-center justify-between p-2 rounded-md ${selectable ? "hover:bg-muted" : "bg-muted/50 opacity-75"
                                }`}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <UserAvatar
                                  name={m.name}
                                  avatar={m.avatar || m.profile_img || ""}
                                  size="sm"
                                  className="w-6 h-6"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium truncate">{m.name}</p>
                                    {isCurrentUserMember && (
                                      <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                        <UserCheck className="w-3 h-3" />
                                        Anda
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {m.user_email || m.role}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {isCurrentUserMember && (
                                  <span className="text-xs text-muted-foreground mr-2">
                                    Auto added
                                  </span>
                                )}
                                <input
                                  type="checkbox"
                                  checked={isCurrentUserMember || selectedUserIds.includes(numericUserId)}
                                  onChange={() => toggleMember(m)}
                                  disabled={isSubmitting || !selectable || isCurrentUserMember}
                                  className={`shrink-0 ${selectable && !isCurrentUserMember
                                      ? "cursor-pointer"
                                      : "cursor-not-allowed"
                                    }`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </ScrollArea>

                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedUserIds.length} anggota dipilih + Anda (otomatis)
                      </p>
                    </>
                  )}
                </div>

              </div>
            </ScrollArea>
          </div>

          <DialogFooter className="px-6 py-4 border-t shrink-0">
            <Button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-white bg-gray-500 hover:bg-gray-600"
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoadingMembers} className="text-white bg-sky-500 hover:bg-sky-600">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Membuat Project...
                </>
              ) : (
                "Buat Project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}