"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";
import { Calendar, Tag, MoreHorizontal } from "lucide-react";
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

const priorityConfig: Record<string, string> = {
  low: "badge-low",
  normal: "badge-normal",
  high: "badge-high",
  urgent: "badge-urgent",
  critical: "badge-critical",
  tbd: "badge-tbd",
};

interface TaskCardProps {
  tasks: Task[];
  status: TaskStatus;
  projectId: string;
}

export function TaskCard({ tasks, status, projectId }: TaskCardProps) {
  const { deleteTask } = useTask();
  const { members } = useWorkspace();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleDelete = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(taskId);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => {
        const assignedMembers = members.filter((m) => task.assignTo.includes(m.id));

        return (
          <Card
            key={task.id}
            className="bg-white border border-gray-200 shadow-sm hover:shadow-md cursor-pointer transition-all group relative"
            onClick={() => setSelectedTask(task)}
          >
            <CardContent className="p-3 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-sm text-gray-900 leading-tight flex-1">
                  {task.title}
                </h3>

                {/* Quick Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-500" />
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
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(task.id, e as any);
                      }}
                    >
                      Delete Task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {task.description && (
                <p className="text-xs text-gray-600 line-clamp-2">
                  {task.description}
                </p>
              )}

              <div className="flex items-center justify-between text-gray-600 text-xs mt-1">
                <div className="flex items-center gap-2">
                  {assignedMembers.length > 0 ? (
                    <div className="flex -space-x-2">
                      {assignedMembers.slice(0, 3).map((member) => (
                        <Avatar
                          key={member.id}
                          className="w-5 h-5 border-2 border-white shadow-sm hover:scale-105 transition-transform"
                        >
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback className="text-[10px]">
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {assignedMembers.length > 3 && (
                        <div className="w-5 h-5 flex items-center justify-center text-[10px] font-medium bg-gray-200 text-gray-700 rounded-full border-2 border-white">
                          +{assignedMembers.length - 3}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">Unassigned</span>
                  )}

                  {task.dueDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
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
                    <Tag className="w-3 h-3 text-gray-500" />
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${priorityConfig[task.priority] || "badge-normal"
                        }`}
                    >
                      {task.priority.charAt(0).toUpperCase() +
                        task.priority.slice(1)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Quick Add Task */}
      <QuickAddTask projectId={projectId} status={status} />

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}