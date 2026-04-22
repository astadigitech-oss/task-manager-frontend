"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  UserPlus,
  Calendar as CalendarIcon,
  CheckCircle2,
  X,
  Flag,
} from "lucide-react";
import { format } from "date-fns";
import { useCreateTask, useAddTaskMember } from "@/context/TaskContext";
import { useProject } from "@/context/ProjectContext";
import type { TaskStatus } from "@/types/shared/status";
import type { TaskPriority } from "@/types/shared/priority";
import { cn } from "@/lib/utils/utils";
import { priorityConfig } from "@/constants/task";
import {
  showErrorToast,
  showWarningToast,
  showSuccessToast,
} from "@/lib/helpers/toast-helpers";
import { projectMembersService } from "@/services/projects/projectMember.service";
import { TaskRequest } from "@/types/api/task.api";
import { UserAvatar } from "../shared/UserAvatar";
import { buildTaskPayload } from "@/lib/mapper/task.mapper";

interface QuickAddTaskProps {
  project_id: number;
  workspace_id?: number;
  status: TaskStatus;
  onComplete?: () => void;
}

export function QuickAddTask({
  project_id,
  workspace_id,
  status,
  onComplete,
}: QuickAddTaskProps) {
  const createMutation = useCreateTask();
  const addMemberMutation = useAddTaskMember();
  const { projects } = useProject();

  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [assignees, setAssignees] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<string | undefined>();
  const [dueDate, setDueDate] = useState<string | undefined>();
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const inputRef = useRef<HTMLInputElement>(null);

  const currentProject = projects.find((p) => p.id === project_id);
  const currentWorkspaceId = workspace_id || currentProject?.workspace_id;

  const { data: projectMembers = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: ['project-members', project_id],
    queryFn: async () => {
      const res = await projectMembersService.getAll(project_id);
      return res.success && Array.isArray(res.data) ? res.data : [];
    },
    enabled: isOpen && !!project_id,
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    if (isOpen) {
      // Set start date to today automatically (using local timezone)
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const localDateString = `${year}-${month}-${day}`;
      setStartDate(localDateString);
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!title.trim() || !currentWorkspaceId) {
      showErrorToast("Nama task wajib diisi!");
      return;
    }

    const payload = buildTaskPayload({
      startDate: startDate,
      title: title.trim(),
      status,
      priority,
      dueDate: dueDate,
    }, 'create');

    try {

      const createdTask = await createMutation.mutateAsync({
        workspaceId: currentWorkspaceId,
        projectId: project_id,
        payload,
      });

      if (!createdTask?.id) return;

      if (assignees.length > 0) {
        for (const userId of assignees) {
          await addMemberMutation.mutateAsync({
            workspaceId: currentWorkspaceId,
            projectId: project_id,
            taskId: createdTask.id,
            userId,
            role: 'member'
          });
        }
      }

    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };
  const toggleAssignee = (userId?: number) => {
    if (!userId) return;
    setAssignees((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleDateSelect = (date: Date | undefined) => {
    const formattedDate = date ? format(date, "yyyy-MM-dd") : undefined;
    setDueDate(formattedDate);
  }

  const handleCancel = () => {
    setTitle("");
    setAssignees([]);
    setStartDate(undefined);
    setDueDate(undefined);
    setPriority("normal");
    setIsOpen(false);
  };

  return (
    <div className="mb-3 px-2">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="text-foreground hover:text-foreground text-sm"
        >
          + Add Task
        </button>
      ) : (
        <div className="border border-border rounded-md p-3 flex flex-col gap-3">
          <Input
            ref={inputRef}
            placeholder="Task name..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-sm"
            disabled={createMutation.isPending}
          />

          <div className="flex items-center flex-wrap gap-2">
            {/* Assignees */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-sm"
                  disabled={createMutation.isPending}
                >
                  {assignees.length > 0 ? (
                    <div className="flex -space-x-2">
                      {projectMembers
                        .filter((m) => assignees.includes(m.user_id ?? m.id))
                        .slice(0, 5)
                        .map((m) => (
                          <UserAvatar
                            key={m.id}
                            name={m.name}
                            avatar={m.avatar || m.profile_img || m.profile_image || ""}
                            size="sm"
                            className="w-6 h-6 border"
                          />
                        ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-foreground">
                      <UserPlus className="w-4 h-4" />
                      Assign
                    </div>
                  )}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-72 p-2">
                {isLoadingMembers ? (
                  <div className="py-4 text-center text-sm">Loading...</div>
                ) : projectMembers.length === 0 ? (
                  <div className="py-4 text-center text-sm">
                    No project members
                  </div>
                ) : (
                  projectMembers.map((m) => {
                    const uid = m.user_id ?? m.id;
                    const selected = assignees.includes(uid);
                    return (
                      <button
                        key={m.id}
                        onClick={() => toggleAssignee(uid)}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-1 rounded text-sm hover:bg-muted",
                          selected && "bg-primary/10"
                        )}
                      >
                        <UserAvatar
                          name={m.name}
                          avatar={m.avatar || m.profile_img || m.profile_image || ""}
                          size="sm"
                          className="w-6 h-6"
                        />
                        <div className="flex-1 text-left">{m.name}</div>
                        {selected && (
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        )}
                      </button>
                    );
                  })
                )}
              </PopoverContent>
            </Popover>

            {/* Due Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-xs flex items-center gap-1"
                  disabled={createMutation.isPending}
                >
                  <CalendarIcon className="w-4 h-4" />
                  {dueDate ? format(new Date(dueDate), "MMM d, yyyy") : "Due"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <Calendar mode="single"
                  selected={dueDate ? new Date(dueDate) : undefined}
                  onSelect={handleDateSelect} />
              </PopoverContent>
            </Popover>

            {/* Priority */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  disabled={createMutation.isPending}
                >
                  <Flag
                    className="w-3.5 h-3.5"
                    style={{ color: priorityConfig[priority].color }}
                    fill={priorityConfig[priority].color}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-2">
                {Object.entries(priorityConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setPriority(key as TaskPriority)}
                    className="w-full flex items-center gap-2 px-2 py-1 text-sm rounded hover:bg-muted"
                  >
                    <Flag
                      className="w-3.5 h-3.5"
                      style={{ color: config.color }}
                      fill={config.color}
                    />
                    {config.label}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={createMutation.isPending}
            >
              <X className="w-4 h-4" />
            </Button>

            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={createMutation.isPending || !title.trim()}
              className="bg-sky-500 hover:bg-sky-600 text-white"
            >
              {createMutation.isPending ? "Adding..." : "Add"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}