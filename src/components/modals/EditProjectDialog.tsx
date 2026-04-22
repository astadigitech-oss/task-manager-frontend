"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { FolderSearch, X, Loader2 } from "lucide-react";

import { ProjectApi, ProjectMemberApi, ProjectRequest } from "@/types/api/project.api";
import { WorkspaceMemberApi } from "@/types/api/workspace.api";
import { projectMembersService } from "@/services/projects/projectMember.service";
import { workspaceMembersService } from "@/services/workspaces/workspaceMember.service";
import { useWorkspace } from "@/context/WorkspaceContext";
import { showErrorToast, showSuccessToast } from "@/lib/helpers/toast-helpers";

interface EditProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectApi;
  onUpdate: (id: number, data: Partial<ProjectRequest>) => Promise<void>;
}

export function EditProjectDialog({
  isOpen,
  onClose,
  project,
  onUpdate,
}: EditProjectDialogProps) {
  const { workspaces } = useWorkspace();

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | undefined>(undefined);

  const [currentProjectMembers, setCurrentProjectMembers] = useState<ProjectMemberApi[]>([]);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMemberApi[]>([]);
  const [availableMembers, setAvailableMembers] = useState<WorkspaceMemberApi[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  const [isLoadingProjectMembers, setIsLoadingProjectMembers] = useState(false);
  const [isLoadingWorkspaceMembers, setIsLoadingWorkspaceMembers] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isOpen && project) {
      setName(project.name);
      setDesc(project.description || "");
      setSelectedWorkspace(String(project.workspace_id));
      setSelectedUsers([]);
    }
  }, [isOpen, project]);

  useEffect(() => {
    if (!isOpen || !project?.id) {
      setCurrentProjectMembers([]);
      return;
    }

    const fetchProjectMembers = async () => {
      setIsLoadingProjectMembers(true);
      try {
        const res = await projectMembersService.getAll(project.id);

        if (res.success && Array.isArray(res.data)) {
          setCurrentProjectMembers(res.data);
        } else {
          setCurrentProjectMembers([]);
        }
      } catch (err) {
        console.error("Failed to fetch project members:", err);
        setCurrentProjectMembers([]);
      } finally {
        setIsLoadingProjectMembers(false);
      }
    };

    fetchProjectMembers();
  }, [isOpen, project?.id]);

  useEffect(() => {
    if (!isOpen || !selectedWorkspace) {
      setWorkspaceMembers([]);
      setAvailableMembers([]);
      return;
    }

    const fetchWorkspaceMembers = async () => {
      const wsId = Number(selectedWorkspace);
      setIsLoadingWorkspaceMembers(true);

      try {
        const response = await workspaceMembersService.getAll(wsId);

        if (response.success && response.data) {
          setWorkspaceMembers(response.data);
        } else {
          setWorkspaceMembers([]);
        }
      } catch (error) {
        console.error("Failed to fetch workspace members:", error);
        setWorkspaceMembers([]);
      } finally {
        setIsLoadingWorkspaceMembers(false);
      }
    };

    fetchWorkspaceMembers();
  }, [isOpen, selectedWorkspace]);

  useEffect(() => {
    if (workspaceMembers.length === 0) {
      setAvailableMembers([]);
      return;
    }

    const currentMemberUserIds = new Set(
      currentProjectMembers
        .map(m => {
          const userId = m.user_id || m.user?.id || m.id;
          return Number(userId);
        })
        .filter(id => id && !isNaN(id))
    );

    const available = workspaceMembers.filter(m => {
      const workspaceUserId = m.user_id || m.user?.id || m.id;
      const numericUserId = Number(workspaceUserId);
      return !currentMemberUserIds.has(numericUserId);
    });

    setAvailableMembers(available);
  }, [workspaceMembers, currentProjectMembers]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedUsers([]);
      setAvailableMembers([]);
      setWorkspaceMembers([]);
    }
  }, [isOpen]);

  if (!project) return null;

  const toggleUser = (member: WorkspaceMemberApi) => {
    const userId = member.user_id || member.user?.id || member.id;
    const numericUserId = Number(userId);

    setSelectedUsers((prev) =>
      prev.includes(numericUserId)
        ? prev.filter((id) => id !== numericUserId)
        : [...prev, numericUserId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === availableMembers.length && availableMembers.length > 0) {
      setSelectedUsers([]);
    } else {
      const allUserIds = availableMembers.map(m => {
        const userId = m.user_id || m.user?.id || m.id;
        return Number(userId);
      }).filter(id => id && !isNaN(id));

      setSelectedUsers(allUserIds);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    try {
      await projectMembersService.remove(project.id, memberId);
      setCurrentProjectMembers((prev) => prev.filter((m) => m.id !== memberId));
      showSuccessToast("Member berhasil dihapus");
    } catch (err) {
      console.error("Failed to remove member:", err);
      showErrorToast("Gagal menghapus member");
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      showErrorToast("Nama project wajib diisi");
      return;
    }

    if (!selectedWorkspace) {
      showErrorToast("Workspace belum dipilih");
      return;
    }

    setIsUpdating(true);

    try {
      const basicPayload: Partial<ProjectRequest> = {
        name: name.trim(),
        description: desc.trim() || null,
        workspace_id: Number(selectedWorkspace),
      };

      await onUpdate(project.id, basicPayload);

      if (selectedUsers.length > 0) {
        try {
          await projectMembersService.addBulk(project.id, selectedUsers);
          showSuccessToast(`Project berhasil diperbarui! ${selectedUsers.length} anggota ditambahkan.`);
        } catch (memberError) {
          showSuccessToast("Project berhasil diperbarui, tapi ada masalah menambahkan beberapa anggota");
        }
      } else {
        showSuccessToast("Project berhasil diperbarui");
      }

      onClose();
    } catch (err) {
      console.error("Failed to update project:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden max-h-screen h-[80vh] flex flex-col"
        aria-describedby={undefined}>
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Perbarui detail project dan anggota yang terlibat.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col flex-1 h-full overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="flex-1 h-full">
              <div className="space-y-6 py-4 px-6">
                {/* Name Project Section */}
                <div className="space-y-2">
                  <Label>Nama Project</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama project"
                    className="text-gray-900 dark:text-gray-100 bg-white dark:bg-neutral-800"
                  />
                </div>

                {/* Description Section */}
                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <Textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Deskripsikan project Anda"
                    rows={3}
                    className="text-gray-900 dark:text-gray-100 bg-white dark:bg-neutral-800 min-h-30 resize-none"
                  />
                </div>

                {/* Workspace Section */}
                <div className="space-y-2">
                  <Label htmlFor="workspace">Workspace</Label>
                  <Select
                    value={selectedWorkspace || ""}
                    onValueChange={(value) => {
                      setSelectedWorkspace(value);
                      setSelectedUsers([]);
                    }}
                  >
                    <SelectTrigger id="workspace" className="w-full border bg-white dark:bg-neutral-800">
                      <FolderSearch className="w-4 h-4 mr-2 text-gray-500" />
                      <SelectValue placeholder="Pilih workspace" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-neutral-900">
                      {workspaces.map((workspace) => (
                        <SelectItem
                          key={workspace.id}
                          value={String(workspace.id)}
                        >
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
                <div className="mt-4">
                  <Label>Anggota Tim Saat Ini ({currentProjectMembers.length})</Label>
                  {isLoadingProjectMembers ? (
                    <div className="border rounded-lg p-4 mt-2">
                      <p className="text-sm text-muted-foreground text-center">
                        Memuat anggota project...
                      </p>
                    </div>
                  ) : currentProjectMembers.length > 0 ? (
                    <ScrollArea className="h-48 border rounded-md mt-2 p-2">
                      <div className="p-2">
                        {currentProjectMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-2 hover:bg-muted rounded-lg group"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <UserAvatar
                                name={member.name}
                                avatar={member.profile_img}
                                size="sm"
                                className="h-8 w-8"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {member.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {member.role}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(member.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg mt-2">
                      Belum ada anggota tim
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between border-b pb-2 mb-2">
                  <Label>Tambah Anggota Baru dari Workspace</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Pilih Semua</span>
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === availableMembers.length && availableMembers.length > 0}
                      onChange={toggleSelectAll}
                      disabled={availableMembers.length === 0}
                      className="cursor-pointer w-4 h-4"
                    />
                  </div>
                </div>

                {isLoadingWorkspaceMembers ? (
                  <div className="border rounded-lg p-4 mt-2">
                    <p className="text-sm text-muted-foreground text-center">
                      Memuat anggota workspace...
                    </p>
                  </div>
                ) : !selectedWorkspace ? (
                  <div className="border rounded-lg p-4 mt-2">
                    <p className="text-sm text-muted-foreground text-center">
                      Pilih workspace terlebih dahulu
                    </p>
                  </div>
                ) : availableMembers.length === 0 ? (
                  <div className="border rounded-lg p-4 mt-2">
                    <p className="text-sm text-muted-foreground text-center">
                      {workspaceMembers.length === 0
                        ? "Workspace ini belum memiliki anggota"
                        : "Semua anggota workspace sudah ditambahkan ke project"}
                    </p>
                  </div>
                ) : (
                  <>
                    <ScrollArea className="h-48 border rounded-md mt-2 p-2">
                      {availableMembers.map((m) => {
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
                                avatar={m.avatar || null}
                                size="sm"
                                className="h-8 w-8"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{m.name}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {m.role}
                                </p>
                              </div>
                            </div>

                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(numericUserId)}
                              onChange={() => toggleUser(m)}
                              className="cursor-pointer shrink-0"
                            />
                          </div>
                        );
                      })}
                    </ScrollArea>

                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedUsers.length} anggota dipilih untuk ditambahkan
                    </p>
                  </>
                )}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter className="px-6 py-4 border-t">
            <DialogClose asChild>
              <Button className="bg-gray-600 hover:bg-gray-700 text-white" disabled={isUpdating}>
                Batal
              </Button>
            </DialogClose>
            <Button className="bg-sky-600 hover:bg-sky-700 text-white" onClick={handleSubmit} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}