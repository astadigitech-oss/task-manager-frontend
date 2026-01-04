"use client";

import { useState, memo, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "../ui/card";
import { Calendar, MoreHorizontal, GripVertical, Flag } from "lucide-react";
import { TaskDetailModal } from "@/components/modals/TaskDetailModal";
import { TaskEditModal } from "@/components/modals/TaskEditModal";
import { QuickAddTask } from "@/components/task/QuickAddTask";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteTask } from "@/context/TaskContext";
import type { TaskStatus } from "@/types/shared/status";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils/utils";
import { priorityConfig } from "@/constants/task";
import { showConfirmToast } from "@/lib/helpers/toast-helpers";
import { TaskApi } from "@/types/api/task.api";
import { UserAvatar } from "../shared/UserAvatar";

interface TaskCardProps {
  tasks: TaskApi[];
  status: TaskStatus;
  projectId: number;
  readOnly?: boolean;
  workspaceId?: number;
}

const SingleTaskCard = memo(({
  task,
  isMyTask,
  readOnly,
  user,
  onDelete,
  onSelectTask,
  onEditTask
}: {
  task: TaskApi;
  isMyTask: boolean;
  readOnly?: boolean;
  user: any;
  onDelete: (taskId: number, taskTitle: string, e: React.MouseEvent) => void;
  onSelectTask: (task: TaskApi) => void;
  onEditTask: (task: TaskApi) => void;
}) => {
  const assignedMembers = task.task_members || [];

  const handleDragStart = useCallback((e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = '1';
    const draggingId = document.body?.dataset?.dragging;
    if (draggingId) {
      e.dataTransfer.setData("text/plain", draggingId);
      e.dataTransfer.effectAllowed = "move";
    } else {
      e.dataTransfer.setData("text/plain", task.id.toString());
      e.dataTransfer.effectAllowed = "move";
    }
  }, [task.id]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = '';
    try {
      delete document.body.dataset.dragging;
    } catch (err) { }
  }, []);

  const handleGripDragStart = useCallback((e: React.DragEvent) => {
    const card = e.currentTarget.closest('[draggable="true"]') as HTMLElement;
    if (card) {
      card.style.opacity = '1';
    }

    e.dataTransfer.setData("text/plain", task.id.toString());
    e.dataTransfer.effectAllowed = "move";
    try {
      document.body.dataset.dragging = task.id.toString();
    } catch (err) { }
  }, [task.id]);

  const handleGripDragEnd = useCallback((e: React.DragEvent) => {
    const card = e.currentTarget.closest('[draggable="true"]') as HTMLElement;
    if (card) {
      card.style.opacity = '';
    }
    try {
      delete document.body.dataset.dragging;
    } catch (err) { }
  }, []);

  const formattedDate = useMemo(() =>
    task.due_date
      ? new Date(task.due_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
      : null,
    [task.due_date]
  );

  return (
    <Card
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        "card border border-border shadow-sm hover:shadow-md cursor-pointer transition-all group relative",
        isMyTask ? "ring-2 ring-primary/40" : ""
      )}
      onClick={() => onSelectTask(task)}
    >
      <CardContent className="p-3 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1 w-full">
            <button
              className="p-0 rounded hover:surface-hover cursor-grab active:cursor-grabbing"
              draggable={true}
              onDragStart={handleGripDragStart}
              onDragEnd={handleGripDragEnd}
              onClick={(e) => e.stopPropagation()}
              title="Drag"
            >
              <GripVertical className="w-4 h-4 text-foreground" />
            </button>

            <h3 className="font-medium text-sm text-foreground leading-tight flex-1">
              {task.title}
            </h3>
          </div>

          {!readOnly && (user?.role === "admin" || isMyTask) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:surface-hover rounded"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-6 h-6 text-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditTask(task);
                  }}
                >
                  Edit Task
                </DropdownMenuItem>
                {user?.role === "admin" && (
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(task.id, task.title, e as any);
                    }}
                  >
                    Delete Task
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {task.description && (
          <p className="text-xs text-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between text-foreground text-xs mt-1">
          <div className="flex items-center gap-2">
            {assignedMembers.length > 0 ? (
              <div className="flex -space-x-2">
                {assignedMembers.slice(0, 3).map((member) => (
                  <UserAvatar
                    key={member.user_id}
                    name={member.name}
                    avatar={member.avatar}
                    size="sm"
                    className="w-7 h-7 border-2 border-border text-foreground shadow-sm hover:scale-105 transition-transform"
                  />
                ))}
                {assignedMembers.length > 3 && (
                  <div className="w-5 h-5 flex items-center text-foreground justify-center text-[10px] font-medium badge-tbd rounded-full border-2 border-border">
                    +{assignedMembers.length - 3}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-foreground text-xs">Unassigned</span>
            )}

            {formattedDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-foreground" />
                <span className="text-[11px]">{formattedDate}</span>
              </div>
            )}
          </div>

          {task.priority && task.priority !== "normal" && (
            <div className="flex items-center gap-1">
              <Flag
                className="w-3.5 h-3.5"
                style={{ color: priorityConfig[task.priority]?.color }}
                fill={priorityConfig[task.priority]?.color}
                aria-label={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              />
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

SingleTaskCard.displayName = "SingleTaskCard";

const TaskCardComponent = ({
  tasks,
  status,
  projectId,
  readOnly,
  workspaceId: propWorkspaceId
}: TaskCardProps) => {
  const deleteMutation = useDeleteTask();
  const [selectedTask, setSelectedTask] = useState<TaskApi | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuthStore();
  const params = useParams();

  const workspace_id = useMemo(() => {
    if (propWorkspaceId && propWorkspaceId > 0) {
      return propWorkspaceId;
    }

    const paramWorkspaceId = params?.workspace_id;
    if (paramWorkspaceId) {
      const id = Number(paramWorkspaceId);
      if (id > 0) return id;
    }

    if (tasks.length > 0 && tasks[0].project_id) {
      console.warn("workspace_id not found in props or URL, using fallback");
      return 1;
    }

    return 1;
  }, [propWorkspaceId, params, tasks]);

  const handleDelete = useCallback((taskId: number, taskTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;

    showConfirmToast(
      `Hapus task "${taskTitle}"?`,
      "Task yang dihapus tidak dapat dikembalikan.",
      async () => {
        try {
          await deleteMutation.mutateAsync({
            workspaceId: workspace_id,
            projectId,
            taskId
          });
        } catch (err) {
          console.error("Failed to delete task:", err);
        }
      }
    );
  }, [readOnly, deleteMutation, workspace_id, projectId]);

  const handleSelectTask = useCallback((task: TaskApi) => {
    setSelectedTask(task);
    setIsEditing(false);
  }, []);

  const handleEditTask = useCallback((task: TaskApi) => {
    setSelectedTask(task);
    setIsEditing(true);
  }, []);

  const handleSwitchToEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedTask(null);
    setIsEditing(false);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => {
        const assignedMembers = task.task_members || [];
        const isMyTask = user && assignedMembers.some(member => member.user_id === Number(user.id));

        return (
          <SingleTaskCard
            key={task.id}
            task={task}
            isMyTask={!!isMyTask}
            readOnly={readOnly}
            user={user}
            onDelete={handleDelete}
            onSelectTask={handleSelectTask}
            onEditTask={handleEditTask}
          />
        );
      })}

      {!readOnly && user?.role === "admin" && (
        <QuickAddTask project_id={projectId} workspace_id={workspace_id} status={status} />
      )}

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
};

export const TaskCard = memo(TaskCardComponent, (prevProps, nextProps) => {
  if (prevProps.tasks.length !== nextProps.tasks.length) return false;
  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.projectId !== nextProps.projectId) return false;
  if (prevProps.readOnly !== nextProps.readOnly) return false;
  if (prevProps.workspaceId !== nextProps.workspaceId) return false;

  for (let i = 0; i < prevProps.tasks.length; i++) {
    const prev = prevProps.tasks[i];
    const next = nextProps.tasks[i];

    if (
      prev.id !== next.id ||
      prev.title !== next.title ||
      prev.status !== next.status ||
      prev.priority !== next.priority ||
      prev.due_date !== next.due_date ||
      JSON.stringify(prev.task_members) !== JSON.stringify(next.task_members)
    ) {
      return false;
    }
  }

  return true;
});