"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MoreVertical, Calendar, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ProjectDetailDialog } from "@/components/modals/ProjectDetailModal";
import type { Project } from "@/types/index";
import type { TeamMember } from "@/types/index";

interface ProjectListProps {
  projects: Project[];
  members: TeamMember[];
  onDelete: (id: string) => void;
  onViewDetail?: (projectId: string) => void;
}

const statusConfig = {
  active: { label: "Aktif", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  "on-hold": { label: "Tertunda", color: "bg-amber-100 text-amber-700 border-amber-200" },
  completed: { label: "Selesai", color: "bg-blue-100 text-blue-700 border-blue-200" },
  planning: { label: "Perencanaan", color: "bg-purple-100 text-purple-700 border-purple-200" }
};

export function ProjectList({ projects, members, onDelete, onViewDetail }: ProjectListProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleViewDetail = (project: Project) => {
    if (onViewDetail) {
      onViewDetail(project.id);
    } else {
      setSelectedProject(project);
      setIsDetailOpen(true);
    }
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Tidak ada project ditemukan</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const projectMembers = members.filter(m => project.members.includes(m.id));
          // const status = statusConfig[project.status];

          return (
            <Card key={project.id} className="p-6 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-slate-900 mb-1 truncate">{project.name}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2">{project.description}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="inline-flex items-center justify-center h-8 w-8 -mt-1 -mr-2 rounded-md hover:bg-slate-100 transition-colors">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewDetail(project)}>
                      Lihat Detail
                    </DropdownMenuItem>
                    <DropdownMenuItem>Edit Project</DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => onDelete(project.id)}
                    >
                      Hapus Project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Status Badge */}
              {/* <div className="mb-4">
                <Badge variant="outline" className={status.color}>
                  {status.label}
                </Badge>
              </div> */}

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Progress</span>
                  <span className="text-sm text-slate-900">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              {/* Stats */}
              <div className="space-y-3 pt-4 border-t">
                {/* <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>Due Date</span>
                  </div>
                  <span className="text-slate-900">
                    {new Date(project.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div> */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="h-4 w-4" />
                    <span>Team</span>
                  </div>
                  <div className="flex -space-x-2">
                    {projectMembers.slice(0, 3).map((member) => (
                      <Avatar key={member.id} className="h-6 w-6 border-2 border-white">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {projectMembers.length > 3 && (
                      <div className="h-6 w-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center">
                        <span className="text-xs text-slate-600">+{projectMembers.length - 3}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <ProjectDetailDialog
        project={selectedProject}
        members={members}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </>
  );
}
