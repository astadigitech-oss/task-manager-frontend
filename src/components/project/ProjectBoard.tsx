"use client"

import { AddTaskModal } from "@/components/modals/AddTaskModal"
import { TaskCard } from "@/components/task/TaskCard"
import { TaskList } from "@/components/task/TaskList"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { divisionConfig, TaskStatus } from "@/types"
import { Plus, LayoutGrid, List, ChevronLeft } from "lucide-react"
import { useState } from "react"
import { useWorkspace } from "@/context/WorkspaceContext"
import { useTask } from "@/hooks/useTask"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ProjectBoardLayoutProps {
  projectId: string;
  onNavigate: (page: string) => void;
}

export default function ProjectBoardLayout({ projectId, onNavigate }: ProjectBoardLayoutProps) {
  const { projects, members } = useWorkspace();
  const { getTasksByProject } = useTask();
  const [view, setView] = useState<"kanban" | "list">("kanban");

  // Find project dengan toString untuk handle berbagai tipe
  const project = projects.find(p => p.id.toString() === projectId.toString());

  const tasks = project ? getTasksByProject(projectId) : [];
  const projectMembers = project ? members.filter(m => project.members.includes(m.id)) : [];

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
          <Button variant="outline" size="sm" className="gap-1">
            <Plus className="w-4 h-4" /> Image
          </Button>

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

          <AddTaskModal projectId={projectId} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <section className="flex-1 overflow-x-auto overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300">
          {view === "kanban" ? (
            <div className="flex gap-4 min-w-max h-full items-start">
              {columns.map((col) => {
                const columnTasks = tasks.filter((t) => t.status === col.status);

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
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <TaskList tasks={tasks} projectId={projectId} />
            </div>
          )}
        </section>

        <aside className="hidden md:flex flex-col w-72 bg-gray-100 border-l border-gray-200 p-4">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold text-gray-700">Team Members</h2>
              {/* <Button size="sm" variant="ghost" className="text-xs text-blue-600 hover:bg-blue-50">
                + Add
              </Button> */}
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
            <h3 className="text-sm font-semibold mb-3 text-gray-700">Project Images</h3>
            <div className="relative">
              <div className="w-full h-36 bg-gray-300 rounded-lg flex items-center justify-center">
                <p className="text-gray-600 text-sm">No Image</p>
              </div>
              <div className="flex justify-between mt-2">
                <Button variant="ghost" size="sm" className="text-xs px-2 hover:bg-gray-200">
                  ← Prev
                </Button>
                <Button variant="ghost" size="sm" className="text-xs px-2 hover:bg-gray-200">
                  Next →
                </Button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}