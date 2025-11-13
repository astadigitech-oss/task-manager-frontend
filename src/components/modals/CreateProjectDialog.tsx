"use client";

import { useState } from "react";
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
// import type { ProjectStatus } from "@/types/index";
import type { TeamMember } from "@/types/index";

interface CreateProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (project: any) => void;
  members: TeamMember[];
}

export function CreateProjectDialog({
  isOpen,
  onClose,
  onCreate,
  members,
}: CreateProjectDialogProps) {
  const { workspaces, selectedWorkspaceId } = useWorkspace();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  // const [status, setStatus] = useState<ProjectStatus>("planning");
  const [dueDate, setDueDate] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [workspaceId, setWorkspaceId] = useState(selectedWorkspaceId || workspaces[0]?.id || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onCreate({
      name,
      description,
      status,
      progress: 0,
      members: selectedMembers,
      dueDate,
      tasksCompleted: 0,
      tasksTotal: 0,
      workspaceId,
    });

    // Reset form
    setName("");
    setDescription("");
    // setStatus("planning");
    setDueDate("");
    setSelectedMembers([]);
    setWorkspaceId(selectedWorkspaceId || workspaces[0]?.id || "");
    onClose();
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buat Project Baru</DialogTitle>
          <DialogDescription>
            Isi form berikut untuk membuat project baru dan assign anggota tim
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
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

            {/* Team Members */}
            <div className="space-y-3">
              <Label>Anggota Tim</Label>
              <div className="border rounded-lg p-4 space-y-3 max-h-64 overflow-y-auto">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg"
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
                        <p className="text-sm text-slate-900">{member.name}</p>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {selectedMembers.length > 0 && (
                <p className="text-sm text-slate-600">
                  {selectedMembers.length} anggota dipilih
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit">Buat Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
