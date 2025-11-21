"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { MoreVertical, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { Project } from "@/types/index";
import type { TeamMember } from "@/types/index";
import { EditProjectDialog } from "@/components/modals/EditProjectDialog";
import { toast } from "sonner";

interface ProjectListProps {
  projects: Project[];
  members: TeamMember[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, project: Partial<Project>) => void;
  onViewDetail?: (projectId: string) => void;
  isReadOnly?: boolean; // Member mode - view only
}

const statusConfig = {
  active: { label: "Aktif", color: "status-done" },
  "on-hold": { label: "Tertunda", color: "status-pending" },
  completed: { label: "Selesai", color: "badge-normal" },
  planning: { label: "Perencanaan", color: "status-pending" }
};

export function ProjectList({ projects, members, onDelete, onUpdate, onViewDetail, isReadOnly = false }: ProjectListProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleEditProject = (project: Project) => {
    if (isReadOnly) return; // Member tidak bisa edit
    setSelectedProject(project);
    setIsEditOpen(true);
  };

  const handleUpdateProject = (id: string, updatedProject: Partial<Project>) => {
    if (isReadOnly) return; // Member tidak bisa update
    onUpdate(id, updatedProject);
    setIsEditOpen(false);
  };

  const handleDeleteProject = (id: string, projectName: string) => {
    if (isReadOnly) return; // Member tidak bisa delete

    toast.custom(
      (t) => (
        <div className="bg-card border border-border rounded-lg shadow-lg p-4 min-w-[320px] max-w-md">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                Hapus project "{projectName}"?
              </h3>
              <p className="text-sm text-muted-foreground">
                Project yang dihapus tidak dapat dikembalikan. Semua task di dalamnya akan ikut terhapus.
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                toast.dismiss(t);
              }}
              className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors"
            >
              Batal
            </button>
            <button
              onClick={() => {
                onDelete(id);
                toast.dismiss(t);
                toast.success("Project berhasil dihapus!", {
                  description: `Project "${projectName}" telah dihapus.`,
                });
              }}
              className="px-4 py-2 text-sm font-medium text-destructive-foreground bg-destructive hover:bg-destructive/90 rounded-md transition-colors"
            >
              Hapus
            </button>
          </div>
        </div>
      ),
      {
        duration: 10000,
      }
    );
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">Tidak ada project ditemukan</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const projectMembers = members.filter(m => project.members.includes(m.id));
          

          return (
            <Card key={project.id} className="p-6 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-foreground mb-1 truncate">{project.name}</h3>
                  <p className="text-sm text-muted line-clamp-2">{project.description}</p>
                </div>
                {/* Dropdown Menu - Hidden for Members */}
                {!isReadOnly && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="inline-flex items-center justify-center h-8 w-8 -mt-1 -mr-2 rounded-md hover:surface-hover transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditProject(project)}>
                        Edit Project
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteProject(project.id, project.name)}
                      >
                        Hapus Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">Progress</span>
                  <span className="text-sm text-foreground">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              {/* Stats */}
              <div className="space-y-3 pt-4 border-t divider">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Users className="h-4 w-4" />
                    <span>Team</span>
                  </div>
                  <div className="flex -space-x-2">
                    {projectMembers.slice(0, 3).map((member) => (
                      <Avatar key={member.id} className="h-6 w-6 border-2 border-border">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {projectMembers.length > 3 && (
                      <div className="h-6 w-6 rounded-full surface text-muted-foreground border-2 border-border flex items-center justify-center">
                        <span className="text-xs">+{projectMembers.length - 3}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Edit Project Dialog */}
      {selectedProject && (
        <EditProjectDialog
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onUpdate={handleUpdateProject}
          project={selectedProject}
        />
      )}
    </>
  );
}
