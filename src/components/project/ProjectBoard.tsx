"use client";

import { useEffect, useMemo, useState, useCallback, memo } from "react";
import { useProject } from "@/context/ProjectContext";
import { useTask, useUpdateTask } from "@/context/TaskContext";
import { useProjectProgress } from "@/hooks/project/useProjectProgress";
import { useAuthStore } from "@/store/useAuthStore";
import { useProjectMembers } from "@/hooks/project/useProjectMembers";
import { CreateTaskModal } from "@/components/modals/CreateTaskModal";
import { UploadImageDialog } from "@/components/modals/UploadImageDialog";
import { ImageLightBoxModal } from "@/components/modals/ImageLightBoxModal";
import { TaskCard } from "@/components/task/TaskCard";
import { TaskList } from "@/components/task/TaskList";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { TaskStatus } from "@/types/shared/status";
import { LayoutGrid, List, Info, Home, FolderKanban, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { resolveImageUrl } from "@/lib/helpers/imageUrlHelper";
import { useProjectImages } from "@/hooks/project/useProjectImages";
import { useDeleteProjectImage } from "@/hooks/project/useDeleteProjectImages";
import { ImageGallerySection } from "@/components/shared/ImageGallerySection";
import { ExportTasksModal } from "../modals/ExportDataModal";

interface ProjectBoardLayoutProps {
  project_id: number;
  workspace_id: number;
  onNavigate: (page: string) => void;
  mode?: "admin" | "member";
}

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "on-board", label: "On Board" },
  { status: "on-progress", label: "On Progress" },
  { status: "pending", label: "Pending" },
  { status: "canceled", label: "Canceled" },
  { status: "done", label: "Done" },
];

const STATUS_COLOR_MAP: Record<TaskStatus, string> = {
  "on-board": "status-on-board",
  "on-progress": "status-on-progress",
  "pending": "status-pending",
  "canceled": "status-canceled",
  "done": "status-done",
};

const ProjectHeader = memo(({
  project,
  progress,
  onNavigate
}: {
  project: any;
  progress: number;
  onNavigate: (page: string) => void;
}) => (
  <>
    <Breadcrumb className="mb-3">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onNavigate("dashboard")}
          >
            <Home className="w-4 h-4" />
            Dashboard
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onNavigate("projects")}
          >
            <FolderKanban className="w-4 h-4" />
            Projects
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{project.name}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <div className="flex items-center gap-2 mb-1">
      <h1 className="text-xl md:text-2xl font-bold">{project.name}</h1>
    </div>
    <p className="text-sm text-muted-foreground mb-2">{project.description}</p>

    <div className="flex flex-col w-full max-w-md">
      <div className="flex items-center justify-between mb-1 text-xs font-medium text-muted-foreground">
        <span>Progress</span>
        <span>{progress}% Complete</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  </>
));

ProjectHeader.displayName = "ProjectHeader";

const TeamMembersSection = memo(({
  members,
  isLoading,
  mode
}: {
  members: any[];
  isLoading: boolean;
  mode: "admin" | "member";
}) => (
  <div className="flex-1 p-4 pb-0 overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-ring">
    <div className="flex justify-between items-center mb-3">
      <h2 className="text-sm font-semibold">Team Members</h2>
    </div>

    <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-ring">
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : members.length > 0 ? (
        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-lg group">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={member.name}
                  avatar={member.profile_img || member.avatar}
                  size="sm"
                  className="h-8 w-8"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">
          Belum ada anggota tim
        </p>
      )}
    </div>
  </div>
));

TeamMembersSection.displayName = "TeamMembersSection";

function ProjectBoardLayout({
  project_id,
  workspace_id,
  onNavigate,
  mode = "admin",
}: ProjectBoardLayoutProps) {
  const { projects } = useProject();
  const { user } = useAuthStore();
  const { setSelectedWorkspaceId, setSelectedProjectId } = useTask();

  const project = useMemo(
    () => projects.find((p) => p.id === project_id),
    [projects, project_id]
  );

  const validWorkspaceId = useMemo(() => {
    if (workspace_id && workspace_id > 0) {
      return workspace_id;
    }

    if (project?.workspace_id) {

      return project.workspace_id;
    }

    return null;
  }, [workspace_id, project?.workspace_id]);

  const { tasks, isLoading: tasksLoading } = useTask();

  const { members: projectMembers, isLoading: isLoadingMembers } = useProjectMembers(project_id);

  const currentProjectMembers = useMemo(() => {
    if (projectMembers.length > 0) {
      return projectMembers;
    }
    return project?.members ?? [];
  }, [projectMembers, project?.members]);

  const { progress } = useProjectProgress(project_id);

  const updateTaskMutation = useUpdateTask();

  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { data: projectImages = [] } = useProjectImages(project_id);
  const deleteMutation = useDeleteProjectImage(project_id);

  const displayedTasks = useMemo(() => {
    return mode === "member" && user
      ? tasks.filter((task) =>
        task.members?.some(m => m.user_id === Number(user.id))
      )
      : tasks;
  }, [tasks, mode, user]);

  const imageUrls = useMemo(
    () => projectImages.map((img) => resolveImageUrl(img.url)),
    [projectImages]
  );

  const myTasksCount = useMemo(
    () => (user ? tasks.filter((task) =>
      task.members?.some(m => m.user_id === Number(user.id))
    ).length : 0),
    [tasks, user]
  );

  const allTasksCount = tasks.length;

  const handlePreviousImage = useCallback(() => {
    setCurrentImageIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex((prev) => Math.min(imageUrls.length - 1, prev + 1));
  }, [imageUrls.length]);

  const handleOpenLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const handleDeleteImage = async (index: number) => {
    const img = projectImages[index];
    if (!img) return;
    await deleteMutation.mutateAsync(img.id);
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent, status: TaskStatus) => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData("text/plain");

      if (taskId && validWorkspaceId) {
        try {
          await updateTaskMutation.mutateAsync({
            workspaceId: validWorkspaceId,
            projectId: project_id,
            taskId: Number(taskId),
            payload: { status }
          });
        } catch (err) {
          console.error("Failed to update task:", err);
        }
      }

      setHoveredStatus(null);
    },
    [project_id, validWorkspaceId, updateTaskMutation]
  );

  useEffect(() => {
    if (validWorkspaceId && project_id) {
      setSelectedWorkspaceId(validWorkspaceId);
      setSelectedProjectId(project_id);
    }
  }, [validWorkspaceId, project_id, setSelectedWorkspaceId, setSelectedProjectId]);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  if (!validWorkspaceId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-destructive font-semibold mb-2">Invalid workspace_id</p>
          <p className="text-muted-foreground text-sm">
            workspace_id = {workspace_id}, project.workspace_id = {project.workspace_id || 'undefined'}
          </p>
        </div>
      </div>
    );
  }

  const canCreateTask = mode === "admin";
  const getStatusColor = (status: TaskStatus): string =>
    STATUS_COLOR_MAP[status] || "status-on-board";

  return (
    <div className="flex flex-col h-full">
      {/* HEADER SECTION */}
      <header className="shrink-0 flex flex-col md:flex-row md:justify-between md:items-center border-b p-4 gap-3 shadow-sm">
        <div className="flex flex-col flex-1 min-w-0">
          <ProjectHeader
            project={project}
            progress={progress}
            onNavigate={onNavigate}
          />
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          {mode === "admin" && <UploadImageDialog project_id={project_id} />}

          <div className="flex">
            <Button
              variant={view === "kanban" ? "default" : "outline"}
              size="sm"
              className={`gap-2 px-4 rounded-r-none ${view === "list" ? "text-foreground" : "button-primary"}`}
              onClick={() => setView("kanban")}
            >
              <LayoutGrid className="w-4 h-4" />
              Kanban
            </Button>
            <Button
              variant={view === "list" ? "default" : "outline"}
              size="sm"
              className={`gap-2 px-4 rounded-l-none ${view === "list" ? "button-primary" : "text-foreground"}`}
              onClick={() => setView("list")}
            >
              <List className="w-4 h-4" />
              List
            </Button>
          </div>

          {mode === "admin" && (
            <ExportTasksModal
              projectId={project_id}
              projectName={project?.name || "Project"}
              tasks={displayedTasks}
            />
          )}

          {mode === "admin" && <CreateTaskModal project_id={project_id} />}

          {mode === "member" && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border badge-low">
              <span className="text-sm font-medium text-foreground">
                My Tasks: {myTasksCount}
              </span>
            </div>
          )}

          {mode === "admin" && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border badge-normal">
              <span className="text-sm font-medium text-foreground">
                All Tasks: {allTasksCount}
              </span>
            </div>
          )}
        </div>
      </header>

      {mode === "member" && (
        <div className="shrink-0 p-4">
          <Alert className="surface-elevated border-border">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-foreground">
              You're viewing only tasks assigned to you. Total project tasks: {allTasksCount}
            </AlertDescription>
          </Alert>
        </div>
      )}
      {/* Main Project Board For Task*/}
      <div className="flex flex-1 overflow-hidden min-h-0">
        <section
          className={cn(
            "flex-1 p-4",
            view === "kanban" ? "overflow-x-auto overflow-y-hidden" : "overflow-y-auto",
            "scrollbar-thin scrollbar-thumb-sidebar-ring"
          )}
        >
          {tasksLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : view === "kanban" ? (
            <div className="flex gap-4 min-w-max h-full items-start">
              {COLUMNS.map((col) => {
                const columnTasks = displayedTasks.filter((t) => t.status === col.status);

                return (
                  <Card
                    key={col.status}
                    className={cn(
                      "w-72 shrink-0 p-3 flex flex-col h-full",
                      hoveredStatus === col.status ? "ring-2 ring-dashed ring-primary/40" : ""
                    )}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={() => setHoveredStatus(col.status)}
                    onDragLeave={() => setHoveredStatus(null)}
                    onDrop={(e) => handleDrop(e, col.status)}
                  >
                    <div className="flex justify-between items-center mb-3 shrink-0">
                      <Badge
                        variant="secondary"
                        className={cn("font-semibold text-xs px-2.5 py-1", getStatusColor(col.status))}
                      >
                        {col.label} ({columnTasks.length})
                      </Badge>
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-ring">
                      <div className="space-y-3 p-2">
                        <TaskCard
                          tasks={columnTasks}
                          status={col.status}
                          projectId={project_id}
                          workspaceId={validWorkspaceId}
                          readOnly={!canCreateTask}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg shadow-sm border p-4">
              <TaskList
                tasks={displayedTasks}
                project_id={Number(project_id)}
                workspace_id={validWorkspaceId}
                readOnly={!canCreateTask}
              />
            </div>
          )}
        </section>

        <aside className="hidden md:flex flex-col w-72 border-l overflow-hidden">
          <TeamMembersSection
            members={currentProjectMembers}
            isLoading={isLoadingMembers}
            mode={mode}
          />

          <ImageGallerySection
            imageUrls={imageUrls}
            currentIndex={currentImageIndex}
            mode={mode}
            onPrevious={handlePreviousImage}
            onNext={handleNextImage}
            onOpenLightbox={handleOpenLightbox}
          />
        </aside>
      </div>

      <ImageLightBoxModal
        images={imageUrls}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        onDelete={handleDeleteImage}
        canDelete={mode === "admin"}
      />
    </div>
  );
}

export default memo(ProjectBoardLayout);