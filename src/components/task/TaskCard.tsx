"use client";

import { useState, memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";
import { Calendar, MoreHorizontal, GripVertical, Flag } from "lucide-react";
import { TaskDetailModal } from "@/components/modals/TaskDetailModal";
import { QuickAddTask } from "@/components/task/QuickAddTask";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTask } from "@/hooks/useTask";
import { useWorkspace } from "@/context/WorkspaceContext";
import type { Task, TaskStatus } from "@/types/index";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import { priorityConfig } from "@/constants/task";
import { showConfirmToast } from "@/lib/toast-helpers";

interface TaskCardProps {
  tasks: Task[];
  status: TaskStatus;
  projectId: string;
  readOnly?: boolean;
}

const TaskCardComponent = ({ tasks, status, projectId, readOnly }: TaskCardProps) => {
  const { deleteTask } = useTask();
  const { members } = useWorkspace();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { user } = useAuthStore();

  const handleDelete = (taskId: string, taskTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return; // Member tidak bisa delete

    showConfirmToast(
      `Hapus task "${taskTitle}"?`,
      "Task yang dihapus tidak dapat dikembalikan.",
      () => {
        deleteTask(taskId);
      }
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => {
        const assignedMembers = members.filter((m) => task.assignTo.includes(m.id));
        const isMyTask = user && task.assignTo.includes(user.id);

        return (
          <Card
                key={task.id}
                draggable={true}
                onDragStart={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = '1';
                  const draggingId = document.body?.dataset?.dragging;
                  if (draggingId) {
                    e.dataTransfer.setData("text/plain", draggingId);
                    e.dataTransfer.effectAllowed = "move";
                  } else {
                    e.dataTransfer.setData("text/plain", task.id);
                    e.dataTransfer.effectAllowed = "move";
                  }
                }}
                onDragEnd={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = '';
                  try {
                    delete document.body.dataset.dragging;
                  } catch (err) {}
                }}
                className={cn(
                  "card border border-border shadow-sm hover:shadow-md cursor-pointer transition-all group relative",
                  isMyTask ? "ring-2 ring-primary/40" : ""
                )}
                onClick={() => setSelectedTask(task)}
              >
            <CardContent className="p-3 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1 w-full">
                  <button
                    className="p-0 rounded hover:surface-hover cursor-grab active:cursor-grabbing"
                    draggable={true}
                    onDragStart={(e) => {
                      // Set parent card opacity to full
                      const card = e.currentTarget.closest('[draggable="true"]') as HTMLElement;
                      if (card) {
                        card.style.opacity = '1';
                      }

                      e.dataTransfer.setData("text/plain", task.id);
                      e.dataTransfer.effectAllowed = "move";
                      try {
                        document.body.dataset.dragging = task.id;
                      } catch (err) {}
                    }}
                    onDragEnd={(e) => {
                      // Reset parent card opacity
                      const card = e.currentTarget.closest('[draggable="true"]') as HTMLElement;
                      if (card) {
                        card.style.opacity = '';
                      }
                      try {
                        delete document.body.dataset.dragging;
                      } catch (err) {}
                    }}
                    onClick={(e) => e.stopPropagation()}
                    title="Drag"
                  >
                    <GripVertical className="w-4 h-4 text-muted" />
                  </button>

                  <h3 className="font-medium text-sm text-foreground leading-tight flex-1">
                    {task.title}
                  </h3>
                </div>

                {/* Show dropdown only for admin or own tasks */}
                {!readOnly && (user?.role === "admin" || isMyTask) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:surface-hover rounded"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-6 h-6 text-muted" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTask(task);
                        }}
                      >
                        Edit Task
                      </DropdownMenuItem>
                      {user?.role === "admin" && ( // Only admin can delete
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(task.id, task.title, e as any);
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
                <p className="text-xs text-muted line-clamp-2">
                  {task.description}
                </p>
              )}

              <div className="flex items-center justify-between text-muted text-xs mt-1">
                <div className="flex items-center gap-2">
                  {assignedMembers.length > 0 ? (
                    <div className="flex -space-x-2">
                      {assignedMembers.slice(0, 3).map((member) => (
                        <Avatar
                          key={member.id}
                          className="w-5 h-5 border-2 border-border shadow-sm hover:scale-105 transition-transform"
                        >
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback className="text-[10px]">
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {assignedMembers.length > 3 && (
                        <div className="w-5 h-5 flex items-center justify-center text-[10px] font-medium badge-tbd rounded-full border-2 border-border">
                          +{assignedMembers.length - 3}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted text-xs">Unassigned</span>
                  )}

                  {task.dueDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-muted" />
                      <span className="text-[11px]">
                        {new Date(task.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
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
      })}

      {!readOnly && user?.role === "admin" && (
        <QuickAddTask projectId={projectId} status={status} />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          readOnly={readOnly}
        />
      )}
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export const TaskCard = memo(TaskCardComponent, (prevProps, nextProps) => {
  // Only re-render if tasks array changes or status changes
  return (
    prevProps.tasks.length === nextProps.tasks.length &&
    prevProps.status === nextProps.status &&
    prevProps.projectId === nextProps.projectId &&
    prevProps.readOnly === nextProps.readOnly &&
    JSON.stringify(prevProps.tasks) === JSON.stringify(nextProps.tasks)
  );
});
