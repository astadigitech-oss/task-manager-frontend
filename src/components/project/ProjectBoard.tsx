"use client"

import { AddTaskModal } from "@/components/modals/AddTaskModal"
import { UploadImageDialog } from "@/components/modals/UploadIMageDialog"
import { ImageLightboxModal } from "@/components/modals/ImageLightBoxModal"
import { TaskCard } from "@/components/task/TaskCard"
import { TaskList } from "@/components/task/TaskList"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { divisionConfig, TaskStatus } from "@/types"
import { LayoutGrid, List, ChevronLeft, Info } from "lucide-react"
import { useState } from "react"
import { useWorkspace } from "@/context/WorkspaceContext"
import { useTask } from "@/hooks/useTask"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/store/useAuthStore"
import { Alert, AlertDescription } from "../ui/alert"

interface ProjectBoardLayoutProps {
  projectId: string;
  onNavigate: (page: string) => void;
  mode?: "admin" | "member";
}

export default function ProjectBoardLayout({ projectId, onNavigate, mode = "admin" }: ProjectBoardLayoutProps) {
  const { projects, members } = useWorkspace();
  const { user } = useAuthStore();
  const { getTasksByProject } = useTask();
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [projectImages, setProjectImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const project = projects.find(p => p.id.toString() === projectId.toString());

  const tasks = project ? getTasksByProject(projectId) : [];
  const projectMembers = project ? members.filter(m => project.members.includes(m.id)) : [];

  // 🔥 FIX: Hitung tasks untuk member yang login
  const myTasksCount = user ? tasks.filter(task => task.assignTo?.includes(user.id)).length : 0;
  const allTasksCount = tasks.length;

  const columns: { status: TaskStatus; label: string }[] = [
    { status: "on-board", label: "On Board" },
    { status: "on-progress", label: "On Progress" },
    { status: "pending", label: "Pending" },
    { status: "canceled", label: "Canceled" },
    { status: "done", label: "Complete" },
  ];

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-slate-500">Project not found</p>
      </div>
    );
  }

  const canCreateTask = mode === "admin";
  const showAllTasks = mode === "admin";

  // 🔥 FIX: Filter tasks berdasarkan mode
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
    <div className="flex flex-col h-screen bg-gray-50 text-gray-800">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center bg-white border-b border-gray-200 p-4 gap-3 shadow-sm">
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Button
              variant="ghost"
              size="sm"
              className="p-0 text-gray-600 hover:text-gray-900"
              onClick={() => onNavigate("projects")}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl md:text-2xl font-bold">{project.name}</h1>
          </div>
          <p className="text-sm text-gray-500 mb-2">
            {project.description}
          </p>

          <div className="flex flex-col w-full max-w-md">
            <div className="flex items-center justify-between mb-1 text-xs font-medium text-gray-600">
              <span>Progress</span>
              <span>{project.progress}% Complete</span>
            </div>
            <Progress value={project.progress} className="h-2 bg-gray-200" />
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
              className={`gap-1 px-4 rounded-r-none ${view === "kanban" ? "bg-blue-500 text-white hover:bg-blue-600" : "text-gray-700"}`}
              onClick={() => setView("kanban")}
            >
              <LayoutGrid className="w-4 h-4" />
              Kanban
            </Button>
            <Button
              variant={view === "list" ? "default" : "outline"}
              size="sm"
              className={`gap-1 px-4 rounded-l-none ${view === "list" ? "bg-blue-500 text-white hover:bg-blue-600" : "text-gray-700"}`}
              onClick={() => setView("list")}
            >
              <List className="w-4 h-4" />
              List
            </Button>
          </div>

          {mode === "admin" && <AddTaskModal projectId={projectId} />}

          {mode === "member" && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-green-50 border-green-200">
              <span className="text-sm font-medium text-green-700">
                My Tasks: {myTasksCount}
              </span>
            </div>
          )}

          {mode === "admin" && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-blue-50 border-blue-200">
              <span className="text-sm font-medium text-blue-700">
                All Tasks: {allTasksCount}
              </span>
            </div>
          )}
        </div>
      </header>

      {mode === "member" && (
        <div className="p-4">
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              You're viewing only tasks assigned to you. Total project tasks: {allTasksCount}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <section className="flex-1 overflow-x-auto overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300">
          {view === "kanban" ? (
            <div className="flex gap-4 min-w-max h-full items-start">
              {columns.map((col) => {
                const columnTasks = displayedTasks.filter((t) => t.status === col.status);

                return (
                  <Card
                    key={col.status}
                    className="w-72 flex-shrink-0 bg-white p-3 border border-gray-200 shadow-sm flex flex-col"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-gray-700 text-sm">
                        {col.label} ({columnTasks.length})
                      </span>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <TaskList tasks={displayedTasks} projectId={projectId} />
            </div>
          )}
        </section>

        <aside className="hidden md:flex flex-col w-72 bg-gray-100 border-l border-gray-200 p-4">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold text-gray-700">Team Members</h2>
              {mode === "admin" && (
                <Button size="sm" variant="ghost" className="text-xs text-blue-600 hover:bg-blue-50">
                  + Add
                </Button>
              )}
            </div>

            <div className="space-y-3 overflow-y-auto max-h-64 pr-1 scrollbar-thin scrollbar-thumb-gray-300">
              {projectMembers.length > 0 ? (
                projectMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 bg-white rounded-md p-2 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="text-sm font-semibold">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{member.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {member.role} • {divisionConfig[member.division as keyof typeof divisionConfig]?.emoji} {divisionConfig[member.division as keyof typeof divisionConfig]?.label}
                      </p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No team members</p>
              )}
            </div>
          </div>

          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Project Images</h3>
              {projectImages.length > 0 && (
                <span className="text-xs text-gray-500">
                  {currentImageIndex + 1} / {projectImages.length}
                </span>
              )}
            </div>
            <div className="relative">
              {projectImages.length > 0 ? (
                <>
                  <div 
                    className="w-full h-36 bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
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
                      className="text-xs px-2 hover:bg-gray-200"
                      onClick={handlePreviousImage}
                      disabled={currentImageIndex === 0}
                    >
                      ← Prev
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs px-2 hover:bg-gray-200"
                      onClick={handleNextImage}
                      disabled={currentImageIndex >= projectImages.length - 1}
                    >
                      Next →
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-full h-36 bg-gray-300 rounded-lg flex items-center justify-center">
                    <p className="text-gray-600 text-sm">No Image</p>
                  </div>
                  <div className="flex justify-between mt-2">
                    <Button variant="ghost" size="sm" className="text-xs px-2 hover:bg-gray-200" disabled>
                      ← Prev
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs px-2 hover:bg-gray-200" disabled>
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
      <ImageLightboxModal
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