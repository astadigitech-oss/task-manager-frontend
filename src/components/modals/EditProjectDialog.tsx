"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { useWorkspace } from "@/context/WorkspaceContext";
import type { Project, TeamMember } from "@/types/index";
import { X, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { divisionConfig } from "@/types/index";
import { toast } from "sonner";

interface EditProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, project: Partial<Project>) => void;
  project: Project;
}

export function EditProjectDialog({
  isOpen,
  onClose,
  onUpdate,
  project,
}: EditProjectDialogProps) {
  const { workspaces, members } = useWorkspace();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(project.members);
  const [workspaceId, setWorkspaceId] = useState(project.workspaceId);

  // Update state when project changes
  useEffect(() => {
    setName(project.name);
    setDescription(project.description);
    setSelectedMembers(project.members);
    setWorkspaceId(project.workspaceId);
  }, [project]);

  // Filter members yang ada di project ini
  const projectMembers = members.filter(m => selectedMembers.includes(m.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi
    if (!name.trim()) {
      toast.error("Nama project wajib diisi!", {
        description: "Silakan masukkan nama project.",
      });
      return;
    }

    if (name.trim().length < 3) {
      toast.error("Nama project terlalu pendek!", {
        description: "Nama project minimal 3 karakter.",
      });
      return;
    }

    if (!workspaceId) {
      toast.error("Workspace wajib dipilih!", {
        description: "Silakan pilih workspace untuk project ini.",
      });
      return;
    }

    onUpdate(project.id, {
      name: name.trim(),
      description: description.trim(),
      members: selectedMembers,
      workspaceId,
    });

    onClose();
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const removeMember = (memberId: string) => {
    setSelectedMembers(prev => prev.filter(id => id !== memberId));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update informasi project dan kelola anggota tim
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="space-y-6 py-4 px-6 overflow-y-auto flex-1">
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nama Project</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama project"
                required
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
                required
              />
            </div>

            {/* Workspace Selection */}
            <div className="space-y-2">
              <Label htmlFor="workspace">Workspace</Label>
              <Select value={workspaceId} onValueChange={setWorkspaceId}>
                <SelectTrigger id="workspace">
                  <SelectValue placeholder="Pilih workspace" />
                </SelectTrigger>
                <SelectContent>
                  {workspaces.map((workspace) => (
                    <SelectItem key={workspace.id} value={workspace.id}>
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

            {/* Current Team Members */}
            <div className="space-y-3">
              <Label>Anggota Tim Saat Ini</Label>
              {projectMembers.length > 0 ? (
                <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                  {projectMembers.map((member) => {
                    const division = divisionConfig[member.division as keyof typeof divisionConfig];
                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-2 hover:surface-hover rounded-lg group"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {member.name}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted">
                              <span>{member.role}</span>
                              {division && (
                                <>
                                  <span className="text-muted">•</span>
                                  <span>
                                    {division.emoji} {division.label}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMember(member.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">
                  Belum ada anggota tim
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                {selectedMembers.length} anggota dipilih
              </p>
            </div>

            {/* Add Team Members */}
            <div className="space-y-3">
              <Label>Tambah Anggota Tim</Label>
              <div className="border rounded-lg p-4 space-y-3 max-h-64 overflow-y-auto">
                {members
                  .filter(m => !selectedMembers.includes(m.id))
                  .map((member) => {
                    const division = divisionConfig[member.division as keyof typeof divisionConfig];
                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-2 hover:surface-hover rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={`member-${member.id}`}
                            checked={selectedMembers.includes(member.id)}
                            onCheckedChange={() => toggleMember(member.id)}
                          />
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm text-foreground">{member.name}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <span>{member.role}</span>
                              {division && (
                                <>
                                  <span>•</span>
                                  <span>
                                    {division.emoji} {division.label}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                {members.filter(m => !selectedMembers.includes(m.id)).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    Semua anggota sudah ditambahkan
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t mt-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit">Simpan Perubahan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
