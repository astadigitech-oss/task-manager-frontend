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
import { FolderSearch, Loader2, User } from "lucide-react";
import { showInfoToast, showSuccessToast } from "@/lib/helpers/toast-helpers";
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

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [workspaceId, setWorkspaceId] = useState<number | null>(null);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMemberApi[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const toggleSelectAll = () => {
    if (selectedUserIds.length === workspaceMembers.length && workspaceMembers.length > 0) {
      setSelectedUserIds([]);
    } else {
      const allUserIds = workspaceMembers
        .map(m => Number(m.user_id || m.user?.id || m.id))
        .filter(id => id && !isNaN(id));

      setSelectedUserIds(allUserIds);
    }
  };

  const toggleMember = (member: WorkspaceMemberApi) => {
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

      if (selectedUserIds.length > 0) {
        await projectMembersService.addBulk(projectId, selectedUserIds);
      }


      showSuccessToast(
        selectedUserIds.length > 0
          ? `Project berhasil dibuat dengan ${selectedUserIds.length} anggota!`
          : "Project berhasil dibuat!"
      );

      setName("");
      setDescription("");
      setSelectedUserIds([]);

      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });

      onClose();
    } catch (err) {
      console.error("Create project error:", err);

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden max-h-screen flex flex-col"
        aria-describedby={undefined}>
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Buat Project Baru</DialogTitle>
          <DialogDescription>
            Isi form berikut untuk membuat project baru dan assign anggota tim
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="space-y-6 py-4 px-6 overflow-y-auto flex-1">
            {/* Project Name Section */}
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

            {/* Description Section */}
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

            {/* Workspace Selection Section */}
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

            {/* Team Members Section */}
            <div className="flex items-center justify-between border-b pb-2 mb-2">
              <Label>Tambah Anggota dari Workspace</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Pilih Semua</span>
                <input
                  type="checkbox"
                  checked={selectedUserIds.length === workspaceMembers.length && workspaceMembers.length > 0}
                  onChange={toggleSelectAll}
                  disabled={isSubmitting || isLoadingMembers || workspaceMembers.length === 0}
                  className="cursor-pointer w-4 h-4 mt-0.5"
                />
              </div>
            </div>

            {isLoadingMembers ? (
              <div className="border rounded-lg p-4 mt-2 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : workspaceMembers.length === 0 ? (
              <div className="border rounded-lg p-4 mt-2">
                <p className="text-sm text-muted-foreground text-center">
                  Tidak ada anggota di workspace ini
                </p>
              </div>
            ) : (
              <>
                <ScrollArea className="h-48 border rounded-md mt-2 p-2">
                  {workspaceMembers.map((m) => {
                    const userId = m.user_id || m.user?.id || m.id;
                    const numericUserId = Number(userId);

                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <UserAvatar
                            name={m.name}
                            avatar={m.avatar || m.profile_img || ""}
                            size="sm"
                            className="w-6 h-6"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{m.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {m.user_email || m.role}
                            </p>
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(numericUserId)}
                          onChange={() => toggleMember(m)}
                          disabled={isSubmitting}
                          className="cursor-pointer shrink-0"
                        />
                      </div>
                    );
                  })}
                </ScrollArea>

                <p className="text-sm text-muted-foreground mt-1">
                  {selectedUserIds.length} anggota dipilih
                </p>
              </>
            )}
          </div>

          <DialogFooter className="px-6 py-4 border-t mt-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoadingMembers}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Membuat...
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