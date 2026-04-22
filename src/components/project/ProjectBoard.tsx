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
import {
  LayoutGrid,
  List,
  Info,
  Home,
  FolderKanban,
  Loader2,
  Users,
  Image as ImageIcon,
  X
} from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { resolveImageUrl } from "@/lib/helpers/imageUrlHelper";
import { useProjectImages } from "@/hooks/project/useProjectImages";
import { useDeleteProjectImage } from "@/hooks/project/useDeleteProjectImages";
import { ImageGallerySection } from "@/components/shared/ImageGallerySection";
import { ExportTasksModal } from "../modals/ExportDataModal";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TaskSortOption } from "@/types/shared/filter";
import { TaskSortDropdown } from "../task/TaskSortDropdown";
import { sortTasks } from "@/lib/utils/taskSorting";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

interface ProjectBoardLayoutProps {
  project_id: number;
  workspace_id: number;
  onNavigate: (page: string) => void;
  mode?: "admin" | "member";
}

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "on_board", label: "On Board" },
  { status: "on_progress", label: "On Progress" },
  { status: "pending", label: "Pending" },
  { status: "canceled", label: "Canceled" },
  { status: "done", label: "Done" },
];

const STATUS_COLOR_MAP: Record<TaskStatus, string> = {
  "on_board": "status-on-board",
  "on_progress": "status-on-progress",
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
    <Breadcrumb className="mb-2 sm:mb-3">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            className="flex items-center gap-1 sm:gap-2 cursor-pointer text-xs sm:text-sm"
            onClick={() => onNavigate("dashboard")}
          >
            <Home className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink
            className="flex items-center gap-1 sm:gap-2 cursor-pointer text-xs sm:text-sm"
            onClick={() => onNavigate("projects")}
          >
            <FolderKanban className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Projects</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="text-xs sm:text-sm truncate max-w-37.5 sm:max-w-none">
            {project.name}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    {/* Header: judul, deskripsi, progress bar, fix height */}
    <div className="flex flex-col min-h-20 max-h-27.5 justify-between w-full mb-2">
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate mb-1">
        {project.name}
      </h1>
      <p
        className="text-xs sm:text-sm text-muted-foreground mb-2 overflow-hidden text-ellipsis whitespace-nowrap max-w-full"
        style={{ maxHeight: '1.5em' }}
        title={project.description}
      >
        {project.description || <span className="text-muted-foreground">No description</span>}
      </p>
      <div className="flex flex-col w-full sm:max-w-md">
        <div className="flex items-center justify-between mb-1 text-xs font-medium text-muted-foreground">
          <span>Progress</span>
          <span>{progress}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
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
  <div className="flex-1 p-3 sm:p-4 pb-0 overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-ring">
    <div className="flex justify-between items-center mb-2 sm:mb-3">
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
            <div
              key={member.id}
              className="flex items-center justify-between p-2 hover:bg-muted rounded-lg group"
            >
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <UserAvatar
                  name={member.name}
                  avatar={member.profile_img || member.avatar}
                  size="sm"
                  className="h-7 w-7 sm:h-8 sm:w-8 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate">
                    {member.name}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    {member.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs sm:text-sm text-muted-foreground text-center py-4 border rounded-lg">
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // ADD: Sort state
  const [globalSortOption, setGlobalSortOption] =
    useState<TaskSortOption>('manual');

  // Load sort preference on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('task-sort-preference');
      if (saved) {
        setGlobalSortOption(saved as TaskSortOption);
      }
    } catch (err) {
      console.warn('Failed to load sort preference:', err);
    }
  }, []);

  // Save preference when changed
  const handleGlobalSortChange = useCallback((newSort: TaskSortOption) => {
    setGlobalSortOption(newSort);
    try {
      localStorage.setItem('task-sort-preference', newSort);
    } catch (err) {
      console.warn('Failed to save sort preference:', err);
    }
  }, []);

  if (!validWorkspaceId) {
    return (
      <div className="flex items-center justify-center h-screen px-4">
        <div className="text-center">
          <p className="text-destructive font-semibold mb-2 text-sm sm:text-base">
            Invalid workspace_id
          </p>
          <p className="text-muted-foreground text-xs sm:text-sm">
            workspace_id = {workspace_id}, project.workspace_id = {project.workspace_id || 'undefined'}
          </p>
        </div>
      </div>
    );
  }

  const canCreateTask = mode === "admin";
  const getStatusColor = (status: TaskStatus): string =>
    STATUS_COLOR_MAP[status] || "status-on-board";

  // Sidebar Content Component
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar">
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
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* HEADER SECTION - Responsive */}
      <header className="shrink-0 flex flex-col border-b p-3 sm:p-4 shadow-sm">
        {/* Row 1: Breadcrumb */}
        <Breadcrumb className="mb-2 sm:mb-3">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                className="flex items-center gap-1 sm:gap-2 cursor-pointer text-xs sm:text-sm"
                onClick={() => onNavigate("dashboard")}
              >
                <Home className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                className="flex items-center gap-1 sm:gap-2 cursor-pointer text-xs sm:text-sm"
                onClick={() => onNavigate("projects")}
              >
                <FolderKanban className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Projects</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-xs sm:text-sm truncate max-w-37.5 sm:max-w-none">
                {project.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {/* Row 2: Info kiri + Actions kanan — sejajar dalam 1 baris */}
        <div className="flex items-start justify-between gap-4">
          {/* Kiri: Judul, Deskripsi, Progress */}
          <div className="flex flex-col min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate mb-1">
              {project.name}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2 truncate">
              {project.description || "No description"}
            </p>
            <div className="flex flex-col w-full sm:max-w-md">
              <div className="flex items-center justify-between mb-1 text-xs font-medium text-muted-foreground">
                <span>Progress</span>
                <span>{progress}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {/* Kanan: Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
            {mode === "admin" && <UploadImageDialog project_id={project_id} />}

            <TaskSortDropdown
              value={globalSortOption}
              onChange={handleGlobalSortChange}
            />

            {/* View Toggle */}
            <div className="flex">
              <Button
                variant={view === "kanban" ? "default" : "outline"}
                size="sm"
                className={cn("gap-2 px-3 rounded-r-none", view === "kanban" ? "bg-sky-500 hover:bg-sky-600 text-white" : "text-foreground")}
                onClick={() => setView("kanban")}
              >
                <LayoutGrid className="w-4 h-4" />
                {/* <span className="hidden sm:inline">Kanban</span> */}
              </Button>
              <Button
                variant={view === "list" ? "default" : "outline"}
                size="sm"
                className={cn("gap-2 px-3 rounded-l-none", view === "list" ? "bg-sky-500 hover:bg-sky-600 text-white" : "text-foreground")}
                onClick={() => setView("list")}
              >
                <List className="w-4 h-4" />
                {/* <span className="hidden sm:inline">List</span> */}
              </Button>
            </div>

            {/* Mobile sheet trigger */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden gap-2 px-3">
                  <Users className="w-4 h-4" />
                  <span className="text-xs">Team</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-70 sm:w-[320px] p-0 flex flex-col"
              >
                <SheetHeader className="px-4 py-3 border-b shrink-0">
                  <SheetTitle className="text-base font-semibold text-left">
                    {project.name}
                  </SheetTitle>
                  <SheetDescription className="text-xs text-left">
                    Team members and project gallery
                  </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-hidden">
                  <SidebarContent />
                </div>
              </SheetContent>
            </Sheet>

            {mode === "admin" && <ExportTasksModal
              projectId={project_id}
              projectName={project?.name || "Project"}
              tasks={displayedTasks}
            />}
            {mode === "admin" && <CreateTaskModal project_id={project_id} />}

            {/* Task count badge */}
            {mode === "member" && (
              <div className="flex items-center gap-2 px-3 py-2 badge-low">
                <span className="text-sm font-medium">My Tasks: {myTasksCount}</span>
              </div>
            )}
            {mode === "admin" && (
              <div className="flex items-center gap-2 px-3 py-2 badge-normal">
                <span className="text-sm font-medium">All Tasks: {allTasksCount}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Member Alert */}
      {mode === "member" && (
        <div className="shrink-0 p-3 sm:p-4">
          <Alert className="surface-elevated border-border">
            <Info className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            <AlertDescription className="text-foreground text-xs sm:text-sm">
              You're viewing only tasks assigned to you. Total project tasks: {allTasksCount}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Project Board */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        <section
          className={cn(
            "flex-1 p-3 sm:p-4",
            view === "kanban" ? "overflow-x-auto overflow-y-hidden" : "overflow-y-auto",
            "scrollbar-thin scrollbar-thumb-sidebar-ring"
          )}
        >
          {tasksLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : view === "kanban" ? (
            <ScrollArea className="flex-1 w-full h-full">
              <div className="flex gap-3 sm:gap-4 min-w-max h-full items-start pb-4">
                {COLUMNS.map((col) => {
                  const columnTasks = displayedTasks.filter(
                    (t) => t.status === col.status
                  );

                  const sortedColumnTasks = sortTasks(columnTasks, globalSortOption);


                  return (
                    <Card
                      key={col.status}
                      className={cn(
                        "w-64 sm:w-72 shrink-0 p-3 sm:p-4 grid grid-rows-[auto_1fr] gap-3 sm:gap-4",
                        mode === "member"
                          ? "max-h-[calc(100vh-16rem)] sm:max-h-[calc(100vh-14rem)] md:max-h-[calc(100vh-17rem)] lg:max-h-[calc(100vh-20rem)] xl:max-h-[calc(100vh-23rem)]"
                          : "max-h-[calc(100vh-12rem)] sm:max-h-[calc(100vh-10rem)] md:max-h-[calc(100vh-13rem)] lg:max-h-[calc(100vh-16rem)] xl:max-h-[calc(100vh-19rem)]",
                        hoveredStatus === col.status ? "ring-2 ring-dashed ring-primary/40" : ""
                      )}
                      onDragOver={(e) => e.preventDefault()}
                      onDragEnter={() => setHoveredStatus(col.status)}
                      onDragLeave={() => setHoveredStatus(null)}
                      onDrop={(e) => handleDrop(e, col.status)}
                    >
                      <div className="flex justify-between items-center">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "font-semibold text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1",
                            getStatusColor(col.status)
                          )}
                        >
                          <span className="hidden sm:inline">{col.label}</span>
                          <span className="sm:hidden">{col.label.split(' ')[0]}</span>
                          {" "}({columnTasks.length})
                        </Badge>
                      </div>

                      <ScrollArea className="flex-1 min-h-0 pr-3">
                        <div className="space-y-2">
                          <TaskCard
                            tasks={sortedColumnTasks}
                            status={col.status}
                            projectId={project_id}
                            workspaceId={validWorkspaceId}
                            readOnly={!canCreateTask}
                          />
                        </div>
                      </ScrollArea>
                    </Card>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          ) : (
            <ScrollArea className="flex-1 h-full">
              <div className="p-3 sm:p-4">
              <TaskList
                tasks={sortTasks(displayedTasks, globalSortOption)}
                project_id={Number(project_id)}
                workspace_id={validWorkspaceId}
                readOnly={!canCreateTask}
              />
              </div>
            </ScrollArea>
          )}
        </section>

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 lg:w-72 border-l overflow-hidden">
          <SidebarContent />
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