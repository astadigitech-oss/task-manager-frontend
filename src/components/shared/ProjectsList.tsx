"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MoreVertical, CheckCircle2, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectDetailDialog } from "@/components/modals/ProjectDetailModal";
import type { Project, TeamMember } from "@/components/shared/TeamManagement";

interface ProjectListProps {
  projects: Project[];
  members: TeamMember[];
  onDelete: (id: string) => void;
}

const statusConfig = {
  active: { label: "Aktif", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  "on-hold": { label: "Tertunda", color: "bg-amber-100 text-amber-700 border-amber-200" },
  completed: { label: "Selesai", color: "bg-blue-100 text-blue-700 border-blue-200" },
  planning: { label: "Perencanaan", color: "bg-purple-100 text-purple-700 border-purple-200" }
};

export function ProjectList({ projects, members, onDelete }: ProjectListProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const getProjectMembers = (memberIds: string[]) => {
    return members.filter(m => memberIds.includes(m.id));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleViewDetail = (project: Project) => {
    setSelectedProject(project);
    setIsDetailOpen(true);
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Tidak ada project ditemukan</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      {projects.map((project) => {
        const projectMembers = getProjectMembers(project.members);

        return (
          <Card key={project.id} className="p-6 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-slate-900">{project.name}</h3>
                </div>
                <p className="text-slate-600 text-sm line-clamp-2">
                  {project.description}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit Project</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleViewDetail(project)}>
                    Lihat Detail
                  </DropdownMenuItem>
                  <DropdownMenuItem>Arsipkan</DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => onDelete(project.id)}
                  >
                    Hapus Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Progress</span>
                <span className="text-sm text-slate-900">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">
                  {project.tasksCompleted}/{project.tasksTotal} Tasks
                </span>
              </div>
            </div>

            {/* Members */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                <div className="flex -space-x-2">
                  {projectMembers.slice(0, 3).map((member) => (
                    <Avatar key={member.id} className="h-8 w-8 border-2 border-white">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  ))}
                  {projectMembers.length > 3 && (
                    <div className="h-8 w-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center">
                      <span className="text-xs text-slate-600">
                        +{projectMembers.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleViewDetail(project)}
              >
                Lihat Detail
              </Button>
            </div>
          </Card>
        );
      })}
      <ProjectDetailDialog
        project={selectedProject}
        members={members}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
}
