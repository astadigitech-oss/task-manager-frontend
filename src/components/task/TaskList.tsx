"use client";

import { memo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Calendar, MoreHorizontal, GripVertical, Flag } from "lucide-react";
import { TaskDetailModal } from "../modals/TaskDetailModal";
import { TaskEditModal } from "../modals/TaskEditModal";
import { QuickAddTask } from "./QuickAddTask";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TaskStatus } from "@/types/shared/status";
import { useDeleteTask, useUpdateTask } from "@/context/TaskContext";
import { cn } from "@/lib/utils/utils";
import { priorityConfig } from "@/constants/task";
import { showConfirmToast } from "@/lib/helpers/toast-helpers";
import { TaskApi } from "@/types/api/task.api";
import { UserAvatar } from "../shared/UserAvatar";

interface TaskListProps {
  tasks: TaskApi[];
  project_id: number;
  readOnly?: boolean;
  workspace_id?: number;
}

const statusGroups: { status: TaskStatus; label: string }[] = [
  { status: "on-board", label: "On Board" },
  { status: "on-progress", label: "On Progress" },
  { status: "pending", label: "Pending" },
  { status: "canceled", label: "Canceled" },
  { status: "done", label: "Complete" },
];

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

export function TaskList({ tasks, project_id, readOnly, workspace_id: propWorkspaceId }: TaskListProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "on-board": true,
    "on-progress": true,
    "pending": true,
    "canceled": true,
    "done": true,
  });

  const deleteMutation = useDeleteTask();
  const updateMutation = useUpdateTask();

  const [selectedTask, setSelectedTask] = useState<TaskApi | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);

  const workspace_id = propWorkspaceId || Number(project_id);

  const handleDelete = (task_id: number, taskTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;

    showConfirmToast(
      `Hapus task "${taskTitle}"?`,
      "Task yang dihapus tidak dapat dikembalikan.",
      async () => {
        try {
          await deleteMutation.mutateAsync({
            workspaceId: workspace_id,
            projectId: project_id,
            taskId: task_id
          });
        } catch (err) {
          console.error("Failed to delete task:", err);
        }
      }
    );
  };

  const handleTaskClick = (task: TaskApi) => {
    setSelectedTask(task);
    setIsEditing(false);
  };

  const handleEditTask = (task: TaskApi) => {
    setSelectedTask(task);
    setIsEditing(true);
  };

  const handleSwitchToEdit = () => {
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
    setIsEditing(false);
  };

  const handleDragStart = (e: React.DragEvent, task: TaskApi) => {
    (e.currentTarget as HTMLElement).style.opacity = '1';
    e.dataTransfer.setData("text/plain", task.id.toString());
    e.dataTransfer.effectAllowed = "move";
    try {
      document.body.dataset.dragging = task.id.toString();
    } catch (err) { }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (readOnly) return;
    (e.currentTarget as HTMLElement).style.opacity = '';
    try {
      delete document.body.dataset.dragging;
    } catch (err) { }
  };

  const handleDrop = async (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();

    const task_id = e.dataTransfer.getData("text/plain");
    if (task_id) {
      try {
        await updateMutation.mutateAsync({
          workspaceId: workspace_id,
          projectId: project_id,
          taskId: Number(task_id),
          payload: { status }
        });
      } catch (err) {
        console.error("Failed to update task status:", err);
      }
    }
    setHoveredStatus(null);
    try {
      delete document.body.dataset.dragging;
    } catch (err) { }
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
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDragEnter={() => {
              const dragging = document.body?.dataset?.dragging;
              if (dragging) setHoveredStatus(group.status);
            }}
            onDragLeave={() => {
              if (!readOnly) setHoveredStatus(null);
            }}
            onDrop={(e) => handleDrop(e, group.status)}
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
                    "w-4 h-4 text-foreground transition-transform",
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
                <span className="text-sm text-foreground font-medium">
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
                      <th className="text-left w-[33%] py-3 px-4 font-semibold text-foreground text-xs uppercase">
                        Task Name
                      </th>
                      <th className="text-left w-[20%] py-3 px-4 font-semibold text-foreground text-xs uppercase">
                        Assignee
                      </th>
                      <th className="text-left w-[16%] py-3 px-4 font-semibold text-foreground text-xs uppercase">
                        Due Date
                      </th>
                      <th className="text-left w-[13%] py-3 px-4 font-semibold text-foreground text-xs uppercase">
                        Priority
                      </th>
                      <th className="text-left w-[20%] py-3 px-4 font-semibold text-foreground text-xs uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {groupTasks.map((task) => {
                      const assignedMembers = task.task_members || [];

                      return (
                        <tr
                          key={task.id}
                          draggable={!readOnly}
                          onDragStart={(e) => handleDragStart(e, task)}
                          onDragEnd={handleDragEnd}
                          onClick={() => handleTaskClick(task)}
                          className="border-b divider hover:surface-hover transition-colors group cursor-pointer"
                        >
                          <td className="py-3 px-4 cursor-pointer flex items-center gap-2">
                            {!readOnly && (
                              <button
                                className="p-1 rounded hover:surface-hover cursor-grab active:cursor-grabbing"
                                tabIndex={-1}
                                title="Drag to reorder"
                                style={{ lineHeight: 0 }}
                                onMouseDown={e => {
                                  document.body.dataset.dragging = task.id.toString();
                                  e.preventDefault();
                                }}
                                onClick={e => e.stopPropagation()}
                              >
                                <GripVertical className="w-4 h-4 text-foreground" />
                              </button>
                            )}
                            <p className="font-medium text-foreground">
                              {task.title}
                            </p>
                          </td>

                          <td className="py-3 px-4">
                            {assignedMembers.slice(0, 3).map((member) => (
                              <div
                                key={member.user_id}
                                title={member.name}
                                className="relative group/avatar"
                              >
                                <UserAvatar
                                  name={member.name}
                                  avatar={member.avatar}
                                  size="sm"
                                  className="w-7 h-7 border-2 border-border shadow-sm hover:scale-105 transition-transform"
                                />
                              </div>
                            ))}
                          </td>

                          <td className="py-3 px-4">
                            {task.due_date ? (
                              <div className="flex items-center gap-1.5 text-foreground">
                                <Calendar className="w-3.5 h-3.5 text-foreground" />
                                <span className="text-sm">
                                  {new Date(task.due_date).toLocaleDateString(
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
                              <span className="text-foreground text-sm">—</span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span title={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}>
                              <Flag
                                className="w-4 h-4"
                                style={{ color: priorityConfig[task.priority]?.color }}
                                fill={priorityConfig[task.priority]?.color}
                              />
                            </span>
                          </td>

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

                              {!readOnly && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:surface-hover rounded ml-auto"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreHorizontal className="w-4 h-4 text-foreground" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditTask(task);
                                      }}
                                    >
                                      Edit Task
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(task.id, task.title, e as any);
                                      }}
                                    >
                                      Delete Task
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="border-t divider p-3">
                  {!readOnly && <QuickAddTask project_id={project_id} workspace_id={workspace_id} status={group.status} />}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {selectedTask && !isEditing && (
        <TaskDetailModal
          task={selectedTask}
          onClose={handleCloseModal}
          onEdit={handleSwitchToEdit}
          workspace_id={workspace_id}
        />
      )}

      {selectedTask && isEditing && (
        <TaskEditModal
          task={selectedTask}
          onClose={handleCloseModal}
          workspace_id={workspace_id}
        />
      )}
    </div>
  );
}

export const TaskListMemo = memo(TaskList, (prevProps, nextProps) => {
  return (
    prevProps.tasks.length === nextProps.tasks.length &&
    prevProps.project_id === nextProps.project_id &&
    prevProps.readOnly === nextProps.readOnly &&
    JSON.stringify(prevProps.tasks) === JSON.stringify(nextProps.tasks)
  );
});