"use client";

import { AddTaskModal } from "@/components/modals/AddTaskModal"
import { UploadImageDialog } from "@/components/modals/UploadImageDialog"
import { ImageLightBoxModal } from "@/components/modals/ImageLightBoxModal"
import { TaskCard } from "@/components/task/TaskCard"
import { TaskList } from "@/components/task/TaskList"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { divisionConfig, TaskStatus } from "@/types"
import { LayoutGrid, List, Info, Home, FolderKanban } from "lucide-react"
import { useState } from "react"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useWorkspace } from "@/context/WorkspaceContext"
import { useTask } from "@/hooks/useTask"
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/store/useAuthStore"
import { Alert, AlertDescription } from "../ui/alert"
import { Badge } from "../ui/badge"


interface ProjectBoardLayoutProps {
  projectId: string;
  onNavigate: (page: string) => void;
  mode?: "admin" | "member";
}

export default function ProjectBoardLayout({ projectId, onNavigate, mode = "admin" }: ProjectBoardLayoutProps) {
  const { projects, members } = useWorkspace();
  const { user } = useAuthStore();
  const { getTasksByProject, updateTask } = useTask();

  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [projectImages, setProjectImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const project = projects.find(p => p.id.toString() === projectId.toString());

  const tasks = project ? getTasksByProject(projectId) : [];
  const projectMembers = project ? members.filter(m => project.members.includes(m.id)) : [];

  const myTasksCount = user ? tasks.filter(task => task.assignTo?.includes(user.id)).length : 0;
  const allTasksCount = tasks.length;

  const columns: { status: TaskStatus; label: string }[] = [
    { status: "on-board", label: "On Board" },
    { status: "on-progress", label: "On Progress" },
    { status: "pending", label: "Pending" },
    { status: "canceled", label: "Canceled" },
    { status: "done", label: "Done" },
  ];

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-slate-500">Project not found</p>
      </div>
    );
  }

  const getStatusColor = (status: TaskStatus): string => {
    const statusMap: Record<TaskStatus, string> = {
      "on-board": "status-on-board",
      "on-progress": "status-on-progress",
      "pending": "status-pending",
      "canceled": "status-canceled",
      "done": "status-done",
    };
    return statusMap[status] || "status-on-board";
  };

  const canCreateTask = mode === "admin";
  const showAllTasks = mode === "admin";

  // Filter tasks based on user role
  const displayedTasks = mode === "member" && user
    ? tasks.filter(task => task.assignTo?.includes(user.id))
    : tasks;

  // Handle image upload
  const handleImageUpload = (images: string[]) => {
    setProjectImages(prev => [...prev, ...images]);
    setCurrentImageIndex(0);
  };

  // Navigate images
  const handlePreviousImage = () => {
    setCurrentImageIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => Math.min(projectImages.length - 1, prev + 1));
  };

  // Open lightbox
  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Delete image from lightbox
  const handleDeleteImage = (index: number) => {
    setProjectImages(prev => prev.filter((_, i) => i !== index));
    if (currentImageIndex >= projectImages.length - 1) {
      setCurrentImageIndex(Math.max(0, projectImages.length - 2));
    }
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <header className="flex-shrink-0 flex flex-col md:flex-row md:justify-between md:items-center bg-card border-b border-border p-4 gap-3 shadow-sm">
        <div className="flex flex-col flex-1 min-w-0">
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
          <p className="text-sm text-muted-foreground mb-2">
            {project.description}
          </p>

          <div className="flex flex-col w-full max-w-md">
            <div className="flex items-center justify-between mb-1 text-xs font-medium text-muted-foreground">
              <span>Progress</span>
              <span>{project.progress}% Complete</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          {mode === "admin" && (
            <UploadImageDialog
              projectId={projectId}
              onUpload={handleImageUpload}
              existingImages={projectImages}
            />
          )}

          <div className="flex">
            <Button
              variant={view === "kanban" ? "default" : "outline"}
              size="sm"
              className={`gap-1 px-4 rounded-r-none ${view === "kanban" ? "button-primary" : "text-foreground"}`}
              onClick={() => setView("kanban")}
            >
              <LayoutGrid className="w-4 h-4" />
              Kanban
            </Button>
            <Button
              variant={view === "list" ? "default" : "outline"}
              size="sm"
              className={`gap-1 px-4 rounded-l-none ${view === "list" ? "button-primary" : "text-foreground"}`}
              onClick={() => setView("list")}
            >
              <List className="w-4 h-4" />
              List
            </Button>
          </div>

          {mode === "admin" && <AddTaskModal projectId={projectId} />}

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
        <div className="flex-shrink-0 p-4">
          <Alert className="surface-elevated border-border">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-foreground">
              You're viewing only tasks assigned to you. Total project tasks: {allTasksCount}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden min-h-0">
        <section className={cn(
          "flex-1 p-4",
          view === "kanban" ? "overflow-x-auto overflow-y-hidden" : "overflow-y-auto",
          "scrollbar-thin scrollbar-thumb-sidebar-ring"
        )}>
          {view === "kanban" ? (
            <div className="flex gap-4 min-w-max h-full items-start">

              {columns.map((col) => {
                const columnTasks = displayedTasks.filter((t) => t.status === col.status);

                return (
                  <Card
                    key={col.status}
                    className={cn(
                      "w-72 flex-shrink-0 bg-card p-3 border border-border shadow-sm flex flex-col",
                      hoveredStatus === col.status ? "ring-2 ring-dashed ring-primary/40 bg-primary/10" : ""
                    )}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={(e) => {
                      const dragging = document.body?.dataset?.dragging;
                      if (dragging) setHoveredStatus(col.status);
                    }}
                    onDragLeave={() => setHoveredStatus(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      const taskId = e.dataTransfer.getData("text/plain");
                      if (taskId) {
                        try {
                          updateTask(taskId, { status: col.status } as any);
                        } catch (err) {
                          console.error("Failed to update task status:", err);
                        }
                      }
                      setHoveredStatus(null);
                      try {
                        delete document.body.dataset.dragging;
                      } catch (err) { }
                    }}
                  >
                    <div className="flex justify-between items-center mb-3 flex-shrink-0">
                      <span className="font-semibold text-foreground text-sm">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "font-semibold text-xs px-2.5 py-1",
                            getStatusColor(col.status)
                          )}
                        >{col.label} ({columnTasks.length})</Badge>

                      </span>
                    </div>

                    <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-ring">
                      <TaskCard
                        tasks={columnTasks}
                        status={col.status}
                        projectId={projectId}
                        readOnly={!canCreateTask}
                      />
                    </div>
                  </Card>
                );
              })}
            </div>

          ) : (
            <div className="bg-card rounded-lg shadow-sm border border-border p-4" style={{ height: 'calc(100vh - 280px)', overflowY: 'auto' }}>
              <TaskList tasks={displayedTasks} projectId={projectId} readOnly={!canCreateTask} />
            </div>
          )}
        </section>

        <aside className="hidden md:flex flex-col w-72 bg-surface border-l border-border overflow-hidden" style={{ height: 'calc(100vh - 280px)' }}>
          {/* Team Members Section - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 pb-0 scrollbar-thin scrollbar-thumb-sidebar-ring">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold text-foreground">Team Members</h2>
              {mode === "admin" && (
                <Button size="sm" variant="ghost" className="text-xs button-primary/80 hover:button-primary/90">
                  + Add
                </Button>
              )}
            </div>

            <div className="space-y-3 pr-1">
              {projectMembers.length > 0 ? (
                projectMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 bg-card rounded-md p-2 shadow-sm border border-border hover:surface-hover transition-colors"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="text-sm font-semibold">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.role} • {divisionConfig[member.division as keyof typeof divisionConfig]?.emoji} {divisionConfig[member.division as keyof typeof divisionConfig]?.label}
                      </p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No team members</p>
              )}
            </div>
          </div>

          {/* Project Images Section - Fixed at Bottom */}
          <div className="flex-shrink-0 border-t border-border p-4 bg-surface">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-foreground">Project Images</h3>
              {projectImages.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {currentImageIndex + 1} / {projectImages.length}
                </span>
              )}
            </div>
            <div className="relative">
              {projectImages.length > 0 ? (
                <>
                  <div
                    className="w-full h-36 bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border border-border"
                    onClick={() => handleOpenLightbox(currentImageIndex)}
                  >
                    <img
                      src={projectImages[currentImageIndex]}
                      alt={`Project image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs px-2 hover:surface-hover"
                      onClick={handlePreviousImage}
                      disabled={currentImageIndex === 0}
                    >
                      ← Prev
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs px-2 hover:surface-hover"
                      onClick={handleNextImage}
                      disabled={currentImageIndex >= projectImages.length - 1}
                    >
                      Next →
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-full h-36 bg-muted rounded-lg flex items-center justify-center border border-border">
                    <p className="text-muted-foreground text-sm">No Image</p>
                  </div>
                  <div className="flex justify-between mt-2">
                    <Button variant="ghost" size="sm" className="text-xs px-2 hover:surface-hover" disabled>
                      ← Prev
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs px-2 hover:surface-hover" disabled>
                      Next →
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Image Lightbox Modal */}
      <ImageLightBoxModal
        images={projectImages}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        onDelete={handleDeleteImage}
        canDelete={mode === "admin"}
      />
    </div>
  );
}