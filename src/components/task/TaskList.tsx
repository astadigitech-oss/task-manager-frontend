"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Calendar, Tag, MoreHorizontal, GripVertical } from "lucide-react";
import { TaskDetailModal } from "../modals/TaskDetailModal";
import { QuickAddTask } from "./QuickAddTask";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Task, TaskStatus } from "@/types/index";
import { useTask } from "@/hooks/useTask";
import { useWorkspace } from "@/context/WorkspaceContext";
import { cn } from "@/lib/utils";

interface TaskListProps {
  tasks: Task[];
  projectId: string;
  readOnly?: boolean;
}

// Status configuration
const statusGroups: { status: TaskStatus; label: string }[] = [
  { status: "on-board", label: "On Board" },
  { status: "on-progress", label: "On Progress" },
  { status: "pending", label: "Pending" },
  { status: "canceled", label: "Canceled" },
  { status: "done", label: "Complete" },
];

// Helper functions
const getStatusLabel = (status: TaskStatus): string => {
  const config = statusGroups.find((s) => s.status === status);
  return config?.label || status;
};

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

const getPriorityColor = (priority: string): string => {
  const priorityMap: Record<string, string> = {
    tbd: "badge-tbd",
    critical: "badge-critical",
    urgent: "badge-urgent",
    high: "badge-high",
    normal: "badge-normal",
    low: "badge-low",
  };
  return priorityMap[priority] || "badge-normal";
};

// Main Component
export function TaskList({ tasks, projectId, readOnly }: TaskListProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "on-board": true,
    "on-progress": true,
    "pending": true,
    "canceled": true,
    "done": true,
  });

  const { deleteTask } = useTask();
  const { members } = useWorkspace();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { updateTask } = useTask();
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);

  const handleDelete = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(taskId);
    }
  };

  return (
    <div className="space-y-4">
      {statusGroups.map((group) => {
        const groupTasks = tasks.filter((t) => t.status === group.status);

        return (
          <div
            key={group.status}
            className={cn(
              "surface-elevated rounded-lg overflow-hidden border border-border shadow-sm",
              hoveredStatus === group.status ? "ring-2 ring-dashed ring-primary/40 bg-primary/10" : ""
            )}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => {
              const dragging = document.body?.dataset?.dragging;
              if (dragging) setHoveredStatus(group.status);
            }}
            onDragLeave={() => setHoveredStatus(null)}
            onDrop={(e) => {
              e.preventDefault();
              const taskId = e.dataTransfer.getData("text/plain");
              if (taskId) {
                try {
                  updateTask(taskId, { status: group.status } as any);
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
            {/* Header */}
            <div
              className="flex items-center justify-between surface px-4 py-3 cursor-pointer hover:surface-hover transition-colors border-b"
              onClick={() =>
                setExpanded((prev) => ({
                  ...prev,
                  [group.status]: !prev[group.status],
                }))
              }
            >
              <div className="flex items-center gap-3">
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-muted transition-transform",
                    expanded[group.status] ? "rotate-0" : "-rotate-90"
                  )}
                />
                <Badge
                  variant="secondary"
                  className={cn(
                    "font-semibold text-xs px-2.5 py-1",
                    getStatusColor(group.status)
                  )}
                >
                  {group.label}
                </Badge>
                <span className="text-sm text-muted font-medium">
                  {groupTasks.length}{" "}
                  {groupTasks.length === 1 ? "task" : "tasks"}
                </span>
              </div>
            </div>

            {/* Table Content */}
            {expanded[group.status] && (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="surface border-b divider">
                    <tr>
                      <th className="text-left w-[33%] py-3 px-4 font-semibold text-muted text-xs uppercase">
                        Task Name
                      </th>
                      <th className="text-left w-[20%] py-3 px-4 font-semibold text-muted text-xs uppercase">
                        Assignee
                      </th>
                      <th className="text-left w-[16%] py-3 px-4 font-semibold text-muted text-xs uppercase">
                        Due Date
                      </th>
                      <th className="text-left w-[13%] py-3 px-4 font-semibold text-muted text-xs uppercase">
                        Priority
                      </th>
                      <th className="text-left w-[20%] py-3 px-4 font-semibold text-muted text-xs uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {groupTasks.map((task) => {
                      const assignedMembers = members.filter((m) =>
                        task.assignTo.includes(m.id)
                      );

                      return (
                        <tr
                          key={task.id}
                          draggable={true}
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", task.id);
                            e.dataTransfer.effectAllowed = "move";
                            try {
                              document.body.dataset.dragging = task.id;
                            } catch (err) { }
                          }}
                          onDragEnd={() => {
                            try {
                              delete document.body.dataset.dragging;
                            } catch (err) { }
                          }}
                          onClick={() => setSelectedTask(task)}
                          className="border-b divider hover:surface-hover transition-colors group cursor-pointer"
                        >
                          {/* Task Title + Drag Handle */}
                          <td className="py-3 px-4 cursor-pointer flex items-center gap-2">
                            <button
                              className="p-1 rounded hover:surface-hover cursor-grab active:cursor-grabbing"
                              tabIndex={-1}
                              title="Drag"
                              style={{ lineHeight: 0 }}
                              onMouseDown={e => {
                                
                                document.body.dataset.dragging = task.id;
                                e.preventDefault();
                              }}
                              onClick={e => e.stopPropagation()}
                            >
                              <GripVertical className="w-4 h-4 text-muted" />
                            </button>
                            <p className="font-medium text-foreground">
                              {task.title}
                            </p>
                          </td>

                          {/* Assignees */}
                          <td className="py-3 px-4">
                            {assignedMembers.length > 0 ? (
                              <div className="flex items-center">
                                <div className="flex -space-x-2">
                                  {assignedMembers.slice(0, 3).map((member) => (
                                    <div
                                      key={member.id}
                                      title={member.name}
                                      className="relative group/avatar"
                                    >
                                      <Avatar className="w-7 h-7 border-2 border-border shadow-sm hover:scale-105 transition-transform">
                                        <AvatarImage
                                          src={member.avatar}
                                          alt={member.name}
                                        />
                                        <AvatarFallback className="text-xs">
                                          {member.name.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                    </div>
                                  ))}

                                  {assignedMembers.length > 3 && (
                                    <div className="w-7 h-7 flex items-center justify-center text-[10px] font-medium surface text-muted-foreground rounded-full border-2 border-border">
                                      +{assignedMembers.length - 3}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted text-sm">
                                Unassigned
                              </span>
                            )}
                          </td>

                          {/* Due Date */}
                          <td className="py-3 px-4">
                            {task.dueDate ? (
                              <div className="flex items-center gap-1.5 text-muted">
                                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-sm">
                                  {new Date(task.dueDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    }
                                  )}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted text-sm">—</span>
                            )}
                          </td>

                          {/* Priority */}
                          <td className="py-3 px-4">
                            <span
                              className={cn(
                                "px-2 py-1 rounded-md text-xs font-medium",
                                getPriorityColor(task.priority)
                              )}
                            >
                              {task.priority.charAt(0).toUpperCase() +
                                task.priority.slice(1)}
                            </span>
                          </td>

                          {/* Status + Quick Actions */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "px-2 py-1 rounded-md text-xs font-medium",
                                  getStatusColor(task.status)
                                )}
                              >
                                {getStatusLabel(task.status)}
                              </span>

                              {/* Quick Actions */}
                              <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                  <button
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:surface-hover rounded ml-auto"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreHorizontal className="w-4 h-4 text-muted" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => setSelectedTask(task)}
                                  >
                                    Edit Task
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={(e) =>
                                      handleDelete(task.id, e as any)
                                    }
                                  >
                                    Delete Task
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Add Task Button */}
                <div className="border-t divider p-3">
                  {!readOnly && <QuickAddTask projectId={projectId} status={group.status} />}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* 🔹 Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
