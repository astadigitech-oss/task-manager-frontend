"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MoreVertical, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditProjectDialog } from "@/components/modals/EditProjectDialog";
import { ProjectDetailDialog } from "../modals/ProjectDetailDialog";
import { ProjectApi, ProjectRequest } from "@/types/api/project.api";
import { useAuthStore } from "@/store/useAuthStore";
import { UserAvatar } from "./UserAvatar";

interface ProjectListProps {
  projects: ProjectApi[];
  onDelete: (id: number) => void;
  onUpdate: (id: number, data: Partial<ProjectRequest>) => Promise<void>;
  isReadOnly?: boolean;
  onViewDetail?: (project_id: number) => void;
}

function ProjectCard({
  project,
  onEdit,
  onDelete,
  onViewDetail,
  isReadOnly,
}: {
  project: ProjectApi;
  onEdit: (project: ProjectApi) => void;
  onDelete: (id: number, name: string) => void;
  onViewDetail: (project: ProjectApi) => void;
  isReadOnly: boolean;
}) {
  const rawProgress = Number(project.progress) || 0;
  const progressValue = Math.round(rawProgress);
  const { task_count, members = [] } = project;

  return (
    <Card
      className="p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onViewDetail(project)}
    >
      {/* Header dengan responsive spacing */}
      <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 truncate">
            {project.name}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        </div>

        {!isReadOnly && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center justify-center h-8 w-8 shrink-0 rounded-md hover:bg-muted transition-colors"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(project);
                }}
              >
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(project.id, project.name);
                }}
              >
                Hapus Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Progress dengan responsive text */}
      <div className="mb-3 sm:mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm text-foreground">Progress</span>
          <span className="text-xs sm:text-sm font-medium text-muted-foreground">
            {progressValue}%
          </span>
        </div>

        <Progress value={progressValue} className="h-2" />

        {task_count > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {task_count} {task_count === 1 ? 'task' : 'tasks'}
          </p>
        )}
      </div>

      {/* Team Members dengan responsive layout */}
      <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Team</span>
          </div>
          
          <div className="flex -space-x-2">
            {members.length > 0 ? (
              <>
                {/* Tampilkan 2 avatar di mobile, 3 di desktop */}
                {members.slice(0, window.innerWidth < 640 ? 2 : 3).map((member) => (
                  <UserAvatar
                    key={member.id}
                    name={member.name}
                    avatar={member.profile_image}
                    size="sm"
                    className="h-7 w-7 sm:h-8 sm:w-8 border-2 border-background"
                  />
                ))}
                {members.length > (window.innerWidth < 640 ? 2 : 3) && (
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-muted text-muted-foreground border-2 border-background flex items-center justify-center">
                    <span className="text-[10px] sm:text-xs font-medium">
                      +{members.length - (window.innerWidth < 640 ? 2 : 3)}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <span className="text-xs text-muted-foreground">
                No members
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function ProjectList({
  projects,
  onDelete,
  onUpdate,
  isReadOnly: isReadOnlyProp = false,
  onViewDetail,
}: ProjectListProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectApi | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { user, isHydrated } = useAuthStore();

  if (!isHydrated) return null;

  const isMember = user?.role === "member";
  const isReadOnly = isReadOnlyProp || isMember;

  const handleEditProject = (project: ProjectApi) => {
    if (isReadOnly) return;
    setSelectedProject(project);
    setIsEditOpen(true);
  };

  const handleDetailProject = (project: ProjectApi) => {
    setSelectedProject(project);
    setIsDetailOpen(true);
  };

  const handleUpdateProject = async (
    id: number,
    updated: Partial<ProjectRequest>
  ) => {
    await onUpdate(id, updated);
    setIsEditOpen(false);
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Tidak ada project ditemukan</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={handleEditProject}
            onDelete={onDelete}
            onViewDetail={
              onViewDetail
                ? () => onViewDetail(project.id)
                : handleDetailProject
            }
            isReadOnly={isReadOnly}
          />
        ))}
      </div>

      {selectedProject && (
        <EditProjectDialog
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          project={selectedProject}
          onUpdate={handleUpdateProject}
        />
      )}

      {selectedProject && (
        <ProjectDetailDialog
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          project={selectedProject}
        />
      )}
    </>
  );
}