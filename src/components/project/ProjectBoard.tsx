"use client";

import { useEffect, useMemo, useState, useCallback, memo } from "react";
import { useProject } from "@/context/ProjectContext";
import { useTask, useUpdateTask } from "@/context/TaskContext";
import { useProjectProgress, ProgressBreakdown } from "@/hooks/project/useProjectProgress";
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
  Image,
  X,
  ChevronDown,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const TeamMembersSection = memo(({
  members,
  isLoading,
  mode,

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
                  <p className="text-xs sm:text-sm font-medium truncate">{member.name}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{member.role}</p>
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

// Extracted outside ProjectBoardLayout so it's never recreated on parent re-render.
// Previously defined as an inline function inside render → caused unmount/remount
// every time hoveredStatus, sidebarOpen, or any other state changed.
const SidebarContent = memo(({
  members,
  isLoadingMembers,
  mode,
  imageUrls,
  currentImageIndex,
  onPrevious,
  onNext,
  onOpenLightbox,
}: {
  members: any[];
  isLoadingMembers: boolean;
  mode: "admin" | "member";
  imageUrls: string[];
  currentImageIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  onOpenLightbox: (index: number) => void;
}) => (
  <div className="flex flex-col h-full bg-sidebar">
    <TeamMembersSection members={members} isLoading={isLoadingMembers} mode={mode} />
    <ImageGallerySection
      imageUrls={imageUrls}
      currentIndex={currentImageIndex}
      mode={mode}
      onPrevious={onPrevious}
      onNext={onNext}
      onOpenLightbox={onOpenLightbox}
    />
  </div>
));
SidebarContent.displayName = "SidebarContent";

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
    if (workspace_id && workspace_id > 0) return workspace_id;
    if (project?.workspace_id) return project.workspace_id;
    return null;
  }, [workspace_id, project?.workspace_id]);

  const { tasks, isLoading: tasksLoading } = useTask();
  const { members: projectMembers, isLoading: isLoadingMembers } = useProjectMembers(project_id);

  const currentProjectMembers = useMemo(() => {
    if (projectMembers.length > 0) return projectMembers;
    return project?.members ?? [];
  }, [projectMembers, project?.members]);

  const { progress, breakdown } = useProjectProgress(project_id);
  const updateTaskMutation = useUpdateTask();

  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalSortOption, setGlobalSortOption] = useState<TaskSortOption>("manual");

  const { data: projectImages = [] } = useProjectImages(project_id);
  const deleteMutation = useDeleteProjectImage(project_id);

  const displayedTasks = useMemo(() => {
    return mode === "member" && user
      ? tasks.filter((task) => task.members?.some((m) => m.user_id === Number(user.id)))
      : tasks;
  }, [tasks, mode, user]);

  const imageUrls = useMemo(
    () => projectImages.map((img) => resolveImageUrl(img.url)),
    [projectImages]
  );

  const myTasksCount = useMemo(
    () => (user ? tasks.filter((task) => task.members?.some((m) => m.user_id === Number(user.id))).length : 0),
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
            payload: { status },
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
    if (!validWorkspaceId || !project_id) return;
    setSelectedWorkspaceId(validWorkspaceId);
    setSelectedProjectId(project_id);
  }, [validWorkspaceId, project_id, setSelectedWorkspaceId, setSelectedProjectId]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("task-sort-preference");
      if (saved) setGlobalSortOption(saved as TaskSortOption);
    } catch (err) {
      console.warn("Failed to load sort preference:", err);
    }
  }, []);

  const handleGlobalSortChange = useCallback((newSort: TaskSortOption) => {
    setGlobalSortOption(newSort);
    try {
      localStorage.setItem("task-sort-preference", newSort);
    } catch (err) {
      console.warn("Failed to save sort preference:", err);
    }
  }, []);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  if (!validWorkspaceId) {
    return (
      <div className="flex items-center justify-center h-screen px-4">
        <div className="text-center">
          <p className="text-destructive font-semibold mb-2 text-sm sm:text-base">
            Invalid workspace_id
          </p>
          <p className="text-muted-foreground text-xs sm:text-sm">
            workspace_id = {workspace_id}, project.workspace_id = {project.workspace_id || "undefined"}
          </p>
        </div>
      </div>
    );
  }

  const canCreateTask = mode === "admin";
  const getStatusColor = (status: TaskStatus): string => STATUS_COLOR_MAP[status] || "status-on-board";

  // Memoize per-column sorted tasks to avoid recomputing on every render
  // (e.g. when hoveredStatus changes during drag-and-drop).
  const sortedTasksByColumn = useMemo(() => {
    const map: Record<TaskStatus, ReturnType<typeof sortTasks>> = {} as any;
    for (const col of COLUMNS) {
      const columnTasks = displayedTasks.filter((t) => t.status === col.status);
      map[col.status] = sortTasks(columnTasks, globalSortOption);
    }
    return map;
  }, [displayedTasks, globalSortOption]);

  const sortedListTasks = useMemo(
    () => sortTasks(displayedTasks, globalSortOption),
    [displayedTasks, globalSortOption]
  );

  // Guard: only update hoveredStatus when value actually changes to prevent
  // cascading re-renders across all kanban columns during drag.
  const handleDragEnter = useCallback((status: TaskStatus) => {
    setHoveredStatus((prev) => (prev === status ? prev : status));
  }, []);
  const handleDragLeave = useCallback(() => {
    setHoveredStatus(null);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* ───────────────────────── HEADER ───────────────────────── */}
      <header className="shrink-0 flex flex-col border-b shadow-sm">

        {/* ── Shared Sheet component (used by both mobile & sm trigger) ── */}
        {/* Defined once to avoid duplicate Sheet instances */}

        {/* ════════════════ MOBILE LAYOUT (< sm) ════════════════ */}
        <div className="flex flex-col gap-2.5 px-3 pt-2.5 pb-2 sm:hidden">

          {/* Row 1: Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink className="flex items-center gap-1 cursor-pointer text-xs" onClick={() => onNavigate("dashboard")}>
                  <Home className="w-3 h-3" />
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink className="flex items-center gap-1 cursor-pointer text-xs" onClick={() => onNavigate("projects")}>
                  <FolderKanban className="w-3 h-3" />
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-xs truncate max-w-[180px]">{project.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Row 2: Title + "+ New Task" button side by side */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-bold truncate leading-tight">{project.name}</h1>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                {project.description || "No description"}
              </p>
            </div>
            {/* Primary CTA always visible */}
            {mode === "admin" && <CreateTaskModal project_id={project_id} />}
            {mode === "member" && (
              <div className="flex items-center px-2 py-1 badge-low rounded-md shrink-0">
                <span className="text-[11px] font-medium whitespace-nowrap">My Tasks: {myTasksCount}</span>
              </div>
            )}
          </div>

          {/* Row 3: Progress bar */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
              <span>Progress</span>
              <span>{progress}% Complete</span>
            </div>
            <div className="flex h-2 w-full rounded-full overflow-hidden bg-muted gap-px">
              {breakdown.done > 0 && <div className="bg-green-500 transition-all" style={{ width: `${breakdown.done}%` }} />}
              {breakdown.on_progress > 0 && <div className="bg-blue-500 transition-all" style={{ width: `${breakdown.on_progress}%` }} />}
              {breakdown.on_board > 0 && <div className="bg-gray-500 transition-all" style={{ width: `${breakdown.on_board}%` }} />}
              {breakdown.pending > 0 && <div className="bg-yellow-500 transition-all" style={{ width: `${breakdown.pending}%` }} />}
              {breakdown.canceled > 0 && <div className="bg-red-500 transition-all" style={{ width: `${breakdown.canceled}%` }} />}
            </div>
            {/* Compact legend in a single scrollable row */}
            <div className="flex gap-x-3 overflow-x-auto scrollbar-none">
              {breakdown.done > 0 && <span className="flex items-center gap-1 text-[10px] text-muted-foreground whitespace-nowrap"><span className="inline-block h-1.5 w-1.5 rounded-sm bg-green-500 shrink-0" />Done {breakdown.done}%</span>}
              {breakdown.on_progress > 0 && <span className="flex items-center gap-1 text-[10px] text-muted-foreground whitespace-nowrap"><span className="inline-block h-1.5 w-1.5 rounded-sm bg-blue-500 shrink-0" />Progress {breakdown.on_progress}%</span>}
              {breakdown.on_board > 0 && <span className="flex items-center gap-1 text-[10px] text-muted-foreground whitespace-nowrap"><span className="inline-block h-1.5 w-1.5 rounded-sm bg-gray-500 shrink-0" />Board {breakdown.on_board}%</span>}
              {breakdown.pending > 0 && <span className="flex items-center gap-1 text-[10px] text-muted-foreground whitespace-nowrap"><span className="inline-block h-1.5 w-1.5 rounded-sm bg-yellow-500 shrink-0" />Pending {breakdown.pending}%</span>}
              {breakdown.canceled > 0 && <span className="flex items-center gap-1 text-[10px] text-muted-foreground whitespace-nowrap"><span className="inline-block h-1.5 w-1.5 rounded-sm bg-red-500 shrink-0" />Canceled {breakdown.canceled}%</span>}
            </div>
          </div>

          {/* Row 4: Toolbar — view toggle | sort | team | more */}
          <div className="flex items-center gap-1.5 pt-0.5">
            {/* View toggle */}
            <div className="flex">
              <Button
                variant={view === "kanban" ? "default" : "outline"}
                size="sm"
                className={cn("px-2.5 h-8 rounded-r-none text-xs", view === "kanban" ? "bg-sky-500 hover:bg-sky-600 text-white" : "")}
                onClick={() => setView("kanban")}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant={view === "list" ? "default" : "outline"}
                size="sm"
                className={cn("px-2.5 h-8 rounded-l-none text-xs", view === "list" ? "bg-sky-500 hover:bg-sky-600 text-white" : "")}
                onClick={() => setView("list")}
              >
                <List className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Sort */}
            <TaskSortDropdown value={globalSortOption} onChange={handleGlobalSortChange} />

            {/* Spacer */}
            <div className="flex-1" />

            {/* Task count for admin */}
            {mode === "admin" && (
              <div className="flex items-center px-2 py-1 badge-normal rounded-md">
                <span className="text-[11px] font-medium whitespace-nowrap">Tasks: {allTasksCount}</span>
              </div>
            )}

            {/* Team sheet */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="px-2.5 h-8">
                  <Users className="w-3.5 h-3.5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-0 flex flex-col">
                <SheetHeader className="px-4 py-3 border-b shrink-0">
                  <SheetTitle className="text-base font-semibold text-left">{project.name}</SheetTitle>
                  <SheetDescription className="text-xs text-left">Team members and project gallery</SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-hidden">
                  <SidebarContent
                    members={currentProjectMembers}
                    isLoadingMembers={isLoadingMembers}
                    mode={mode}
                    imageUrls={imageUrls}
                    currentImageIndex={currentImageIndex}
                    onPrevious={handlePreviousImage}
                    onNext={handleNextImage}
                    onOpenLightbox={handleOpenLightbox}
                  />
                </div>
              </SheetContent>
            </Sheet>
            {mode === "admin" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="px-2.5 h-8">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem asChild>
                    <div className="w-full"><UploadImageDialog project_id={project_id} /></div>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <div className="w-full">
                      <ExportTasksModal
                        projectId={project_id}
                        projectName={project?.name || "Project"}
                        tasks={displayedTasks}
                      />
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* ════════════════ DESKTOP LAYOUT (≥ sm) ════════════════ */}
        <div className="hidden sm:flex flex-col gap-2 px-4 py-3">

          {/* Row 1: Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink className="flex items-center gap-2 cursor-pointer text-sm" onClick={() => onNavigate("dashboard")}>
                  <Home className="w-4 h-4" />
                  <span>Dashboard</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink className="flex items-center gap-2 cursor-pointer text-sm" onClick={() => onNavigate("projects")}>
                  <FolderKanban className="w-4 h-4" />
                  <span>Projects</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm">{project.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Row 2: Info left | Actions right */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col min-w-0 flex-1">
              <h1 className="text-xl md:text-2xl font-bold truncate leading-tight mb-0.5">{project.name}</h1>
              <p className="text-sm text-muted-foreground truncate mb-2">{project.description || "No description"}</p>
              <div className="flex flex-col w-full sm:max-w-md">
                <div className="flex items-center justify-between mb-1 text-xs font-medium text-muted-foreground">
                  <span>Progress</span>
                  <span>{progress}% Complete</span>
                </div>
                <div className="flex h-2 w-full rounded-full overflow-hidden bg-muted gap-px">
                  {breakdown.done > 0 && <div className="bg-green-500 transition-all" style={{ width: `${breakdown.done}%` }} title={`Done: ${breakdown.done}%`} />}
                  {breakdown.on_progress > 0 && <div className="bg-blue-500 transition-all" style={{ width: `${breakdown.on_progress}%` }} title={`On Progress: ${breakdown.on_progress}%`} />}
                  {breakdown.on_board > 0 && <div className="bg-gray-500 transition-all" style={{ width: `${breakdown.on_board}%` }} title={`On Board: ${breakdown.on_board}%`} />}
                  {breakdown.pending > 0 && <div className="bg-yellow-500 transition-all" style={{ width: `${breakdown.pending}%` }} title={`Pending: ${breakdown.pending}%`} />}
                  {breakdown.canceled > 0 && <div className="bg-red-500 transition-all" style={{ width: `${breakdown.canceled}%` }} title={`Canceled: ${breakdown.canceled}%`} />}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                  {breakdown.done > 0 && <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="inline-block h-2 w-2 rounded-sm bg-green-500" />Done {breakdown.done}%</span>}
                  {breakdown.on_progress > 0 && <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="inline-block h-2 w-2 rounded-sm bg-blue-500" />On Progress {breakdown.on_progress}%</span>}
                  {breakdown.on_board > 0 && <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="inline-block h-2 w-2 rounded-sm bg-gray-500" />On Board {breakdown.on_board}%</span>}
                  {breakdown.pending > 0 && <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="inline-block h-2 w-2 rounded-sm bg-yellow-500" />Pending {breakdown.pending}%</span>}
                  {breakdown.canceled > 0 && <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="inline-block h-2 w-2 rounded-sm bg-red-500" />Canceled {breakdown.canceled}%</span>}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
              {mode === "admin" && <UploadImageDialog project_id={project_id} />}
              <TaskSortDropdown value={globalSortOption} onChange={handleGlobalSortChange} />
              <div className="flex">
                <Button
                  variant={view === "kanban" ? "default" : "outline"}
                  size="sm"
                  className={cn("gap-2 px-3 rounded-r-none", view === "kanban" ? "bg-sky-500 hover:bg-sky-600 text-white" : "text-foreground")}
                  onClick={() => setView("kanban")}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={view === "list" ? "default" : "outline"}
                  size="sm"
                  className={cn("gap-2 px-3 rounded-l-none", view === "list" ? "bg-sky-500 hover:bg-sky-600 text-white" : "text-foreground")}
                  onClick={() => setView("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="md:hidden gap-2 px-3">
                    <Users className="w-4 h-4" />
                    <span className="text-xs">Team</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[320px] p-0 flex flex-col">
                  <SheetHeader className="px-4 py-3 border-b shrink-0">
                    <SheetTitle className="text-base font-semibold text-left">{project.name}</SheetTitle>
                    <SheetDescription className="text-xs text-left">Team members and project gallery</SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-hidden">
                    <SidebarContent
                      members={currentProjectMembers}
                      isLoadingMembers={isLoadingMembers}
                      mode={mode}
                      imageUrls={imageUrls}
                      currentImageIndex={currentImageIndex}
                      onPrevious={handlePreviousImage}
                      onNext={handleNextImage}
                      onOpenLightbox={handleOpenLightbox}
                    />
                  </div>
                </SheetContent>
              </Sheet>
              {mode === "admin" && (
                <ExportTasksModal projectId={project_id} projectName={project?.name || "Project"} tasks={displayedTasks} />
              )}
              {mode === "admin" && <CreateTaskModal project_id={project_id} />}
              {mode === "member" && (
                <div className="flex items-center gap-2 px-3 py-2 badge-low rounded-md">
                  <span className="text-sm font-medium">My Tasks: {myTasksCount}</span>
                </div>
              )}
              {mode === "admin" && (
                <div className="flex items-center gap-2 px-3 py-2 badge-normal rounded-md">
                  <span className="text-sm font-medium">All Tasks: {allTasksCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </header>

      {/* Member Alert */}
      {mode === "member" && (
        <div className="shrink-0 px-3 py-2 sm:px-4 sm:py-3">
          <Alert className="surface-elevated border-border py-2">
            <Info className="h-3 w-3 sm:h-4 sm:w-4 text-primary mt-0.5" />
            <AlertDescription className="text-foreground text-[11px] sm:text-sm leading-snug">
              Menampilkan task yang ditugaskan ke Anda. Total project: {allTasksCount} task.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* ───────────────────────── BOARD BODY ───────────────────────── */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        <section
          className={cn(
            "flex-1",
            view === "kanban"
              ? "overflow-x-auto overflow-y-hidden p-2 sm:p-3 md:p-4"
              : "overflow-y-auto p-2 sm:p-3 md:p-4",
            "scrollbar-thin scrollbar-thumb-sidebar-ring"
          )}
        >
          {tasksLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : view === "kanban" ? (
            <ScrollArea className="flex-1 w-full h-full">
              <div className="flex gap-2 sm:gap-3 md:gap-4 min-w-max h-full items-start pb-4">
                {COLUMNS.map((col) => {
                  const sortedColumnTasks = sortedTasksByColumn[col.status];

                  return (
                    <Card
                      key={col.status}
                      className={cn(
                        "w-56 xs:w-60 sm:w-64 md:w-68 lg:w-72 shrink-0 p-2.5 sm:p-3 md:p-4 grid grid-rows-[auto_1fr] gap-2 sm:gap-3 md:gap-4",
                        mode === "member"
                          ? "max-h-[calc(100dvh-18rem)] sm:max-h-[calc(100dvh-16rem)] md:max-h-[calc(100dvh-17rem)] lg:max-h-[calc(100dvh-20rem)]"
                          : "max-h-[calc(100dvh-14rem)] sm:max-h-[calc(100dvh-12rem)] md:max-h-[calc(100dvh-13rem)] lg:max-h-[calc(100dvh-16rem)]",
                        hoveredStatus === col.status ? "ring-2 ring-dashed ring-primary/40" : ""
                      )}
                      onDragOver={(e) => e.preventDefault()}
                      onDragEnter={() => handleDragEnter(col.status)}
                      onDragLeave={handleDragLeave}
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
                          {col.label} ({sortedColumnTasks.length})
                        </Badge>
                      </div>

                      <ScrollArea className="flex-1 min-h-0 pr-2 sm:pr-3">
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
              <div className="p-0 sm:p-2">
                <TaskList
                  tasks={sortedListTasks}
                  project_id={Number(project_id)}
                  workspace_id={validWorkspaceId}
                  readOnly={!canCreateTask}
                />
              </div>
            </ScrollArea>
          )}
        </section>

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-60 lg:w-72 border-l overflow-hidden">
          <SidebarContent
            members={currentProjectMembers}
            isLoadingMembers={isLoadingMembers}
            mode={mode}
            imageUrls={imageUrls}
            currentImageIndex={currentImageIndex}
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