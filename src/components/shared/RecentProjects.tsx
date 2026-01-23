"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, FolderKanban } from "lucide-react";
import { useProject } from "@/context/ProjectContext";
import { ProjectApi } from "@/types/api/project.api";
import { UserAvatar } from "./UserAvatar";

interface RecentProjectCardProps {
  project: ProjectApi;
  onClick?: (project: ProjectApi) => void;
}

function RecentProjectCard({ project, onClick }: RecentProjectCardProps) {
  // const { members = [] } = project;
  const rawProgress = Number(project.progress) || 0;
  const progressValue = Math.round(rawProgress);
  const { task_count, members = [] } = project;

  const completedTasks = useMemo(() => {
    if (task_count === 0) return 0;
    return Math.round((progressValue / 100) * task_count);
  }, [progressValue, task_count]);

  return (
    <div
      className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => onClick?.(project)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-foreground mb-1 truncate">
            {project.name}
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {project.description}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Progress Section */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted">Progress</span>
            <span className="text-xs text-foreground">
              {progressValue}%
            </span>
          </div>
          <Progress value={progressValue} className="h-2" />

          {/* Task Breakdown */}
          {task_count > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {completedTasks} / {task_count} tasks completed
            </p>
          )}
        </div>

        {/* Team Members Section */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>Team</span>
          </div>
          <div className="flex items-center gap-1">
            {members.length > 0 ? (
              <div className="flex -space-x-2">
                {members.slice(0, 3).map((member) => (
                  <UserAvatar
                    key={member.id}
                    name={member.name}
                    avatar={member.profile_image}
                    size="sm"
                    className="h-8 w-8 border-2 border-background"
                  />
                ))}
                {members.length > 3 && (
                  <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground border-2 border-background flex items-center justify-center">
                    <span className="text-xs">
                      +{members.length - 3}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">No members</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface RecentProjectsProps {
  onViewDetail?: (project: ProjectApi) => void;
}

export function RecentProjects({ onViewDetail }: RecentProjectsProps) {
  const { projects, isLoading } = useProject();

  const handleProjectClick = (project: ProjectApi) => {
    onViewDetail?.(project);
  };

  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);
  }, [projects]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-foreground mb-4">Recent Projects</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="p-4 border border-border rounded-lg animate-pulse"
            >
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (recentProjects.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-foreground mb-4">Recent Projects</h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FolderKanban className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Belum ada project</p>
          <p className="text-xs text-muted-foreground mt-1">
            Buat project pertama Anda untuk memulai
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-foreground mb-4">Recent Projects</h3>
      <div className="space-y-4">
        {recentProjects.map((project) => (
          <RecentProjectCard
            key={project.id}
            project={project}
            onClick={handleProjectClick}
          />
        ))}
      </div>
    </Card>
  );
}