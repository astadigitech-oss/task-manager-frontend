"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { UserPlus, Calendar as CalendarIcon, Layout, CheckCircle2, Flag, Clock } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { useTask, useCreateTask, useAddTaskMember } from "@/context/TaskContext";
import { useProject } from "@/context/ProjectContext";
import type { TaskStatus } from "@/types/shared/status";
import type { TaskPriority } from "@/types/shared/priority";
import { cn } from "@/lib/utils/utils";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { priorityConfig, statusConfig } from "@/constants/task";
import { showErrorToast } from "@/lib/helpers/toast-helpers";
import { ScrollArea } from "../ui/scroll-area";
import { focusManager, useQuery } from "@tanstack/react-query";
import { projectMembersService } from "@/services/projects/projectMember.service";
import { buildTaskPayload } from "@/lib/mapper/task.mapper";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";

interface CreateTaskModalProps {
  project_id: number;
  workspace_id?: number;
}

export function CreateTaskModal({ project_id, workspace_id }: CreateTaskModalProps) {
  const { setSelectedProjectId, setSelectedWorkspaceId } = useTask();
  const { projects } = useProject();

  const createMutation = useCreateTask();
  const addMemberMutation = useAddTaskMember();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<TaskStatus>("on_board");
  const [assignees, setAssignees] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<string | undefined>();
  const [dueDate, setDueDate] = useState<string | undefined>();
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("normal");

  const currentProject = projects.find((p) => p.id === project_id);
  const currentWorkspaceId = workspace_id || currentProject?.workspace_id;

  const { data: projectMembers = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: ['project-members', project_id],
    queryFn: async () => {
      const res = await projectMembersService.getAll(project_id);
      if (res.success && Array.isArray(res.data)) {
        return res.data;
      }
      return [];
    },
    enabled: open && !!project_id,
    staleTime: 2 * 60 * 1000,
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setNotes("");
    setStatus("on_board");
    setAssignees([]);
    setStartDate(undefined);
    setDueDate(undefined);
    setDueTime("");
    setPriority("normal");
  };

  const handleSubmit = async () => {
    if (!title.trim() || !currentWorkspaceId) {
      showErrorToast("Nama task wajib diisi!");
      return;
    }

    const payload = buildTaskPayload({
      title: title.trim(),
      description: description.trim(),
      notes: notes.trim(),
      status,
      priority,
      startDate: startDate,
      dueDate: dueDate,
      dueTime: dueTime || undefined,
    }, 'create');

    try {
      setSelectedWorkspaceId(currentWorkspaceId);
      setSelectedProjectId(project_id);

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

      resetForm();
      setOpen(false);
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  const handleCancel = () => {
    resetForm();
    setOpen(false);
  };

  const toggleAssignee = (userId: number | undefined) => {
    if (!userId) return;
    setAssignees((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleDateSelect = (date: Date | undefined, field: 'start' | 'due') => {
    const formattedDate = date ? format(date, "yyyy-MM-dd") : undefined;
    if (field === 'start') {
      setStartDate(formattedDate)
    }
    else {
      setDueDate(formattedDate)
    }
  }

  const assignedMembers = projectMembers.filter(member => {
    const uid = member.user_id ?? member.id;
    return assignees.includes(uid);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ New Task</Button>
      </DialogTrigger>

      <DialogContent className="p-0 gap-0 sm:max-w-225 overflow-hidden" aria-describedby={undefined}>

        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Add Task</DialogTitle>
          <DialogDescription>
            Create a new task and assign it to your team members
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-[80vh] max-h-175">
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                <Layout className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Project: {currentProject?.name || "Unknown"}
                </span>
              </div>

              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Task Name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                placeholder="Tambahkan deskripsi Pada Task"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="min-h-30 resize-none break-all whitespace-pre-wrap"
              />

              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add some notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-30 resize-none break-all whitespace-pre-wrap"
                rows={3}
              />

              <div className="flex flex-wrap items-center gap-3 mt-5">
                {/* Status Section */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="px-3 text-sm">
                      <Badge variant="outline" className={statusConfig[status].className}>
                        {statusConfig[status].label}
                      </Badge>
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-48 p-2">
                    <div className="space-y-1">
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <button
                          key={key}
                          onClick={() => setStatus(key as TaskStatus)}
                          className={cn(
                            "w-full flex items-center justify-between px-2 py-1.5 rounded text-sm",
                            "hover:bg-muted transition-colors",
                            status === key && "bg-primary/10"
                          )}
                        >
                          <Badge variant="outline" className={config.className}>
                            {config.label}
                          </Badge>
                          {status === key && <CheckCircle2 className="w-4 h-4 text-primary" />}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>


                {/* Assignees Section */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1">
                      {assignedMembers.length > 0 ? (
                        <div className="flex -space-x-2">
                          {assignedMembers.slice(0, 5).map((member) => (
                            <TooltipProvider key={member.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <UserAvatar
                                      name={member.name}
                                      avatar={member.avatar || member.profile_img || member.profile_image || ""}
                                      size="sm"
                                      className="h-7 w-7 border-2"
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>{member.name}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <UserPlus className="w-4 h-4" />
                          Assign
                        </div>
                      )}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-80 p-2">
                    {isLoadingMembers ? (
                      <div className="py-4 text-center text-sm text-muted-foreground">
                        Memuat anggota...
                      </div>
                    ) : projectMembers.length === 0 ? (
                      <div className="py-4 text-center text-sm text-muted-foreground">
                        Tidak ada anggota di project ini
                      </div>
                    ) : (
                      <ScrollArea className="max-h-64">
                        <div className="space-y-1">
                          {projectMembers.map((member) => {
                            const userId = member.user_id ?? member.id;
                            const isSelected = assignees.includes(userId);

                            return (
                              <button
                                key={member.id}
                                onClick={() => toggleAssignee(userId)}
                                className={cn(
                                  "w-full flex items-center gap-2 px-2 py-1.5 rounded",
                                  "hover:bg-muted transition-colors",
                                  isSelected && "bg-primary/10"
                                )}
                              >
                                <UserAvatar
                                  name={member.name}
                                  avatar={member.avatar || member.profile_img || member.profile_image || ""}
                                  size="sm"
                                  className="w-6 h-6"
                                />
                                <div className="flex-1 text-left">
                                  <p className="text-sm">{member.name}</p>
                                  <p className="text-xs text-muted-foreground">{member.user_email}</p>
                                </div>
                                {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                              </button>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    )}
                  </PopoverContent>
                </Popover>

                {/* Start Date Section */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-auto px-3 text-sm">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {startDate ? format(new Date(startDate), "MMM d, yyyy") : "Start Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2">
                    <Calendar mode="single"
                      selected={startDate ? new Date(startDate) : undefined}
                      onSelect={(date) => handleDateSelect(date, 'start')} />
                  </PopoverContent>
                </Popover>

                {/* Due Date Section */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-auto px-3 text-sm">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {dueDate ? format(new Date(dueDate), "MMM d, yyyy") : "Due Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2">
                    <Calendar mode="single"
                      selected={dueDate ? new Date(dueDate) : undefined}
                      onSelect={(date) => handleDateSelect(date, 'due')} />
                  </PopoverContent>
                </Popover>

                {dueDate && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-auto px-3 text-sm">
                        <Clock className="w-4 h-4 mr-2" />
                        {dueTime || "Set Time"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3">
                      <div className="space-y-3">
                        <label className="text-sm font-medium">Deadline Time</label>
                        <Input
                          type="time"
                          value={dueTime}
                          onChange={(e) => setDueTime(e.target.value)}
                          className="w-full"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDueTime("09:00")}
                            className="flex-1"
                          >
                            9:00 AM
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDueTime("17:00")}
                            className="flex-1"
                          >
                            5:00 PM
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDueTime("")}
                          className="w-full"
                        >
                          Clear Time
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

                {/* Priority Section */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="px-3 text-sm flex items-center gap-2">
                      <Flag
                        className="w-3.5 h-3.5"
                        style={{ color: priorityConfig[priority].color }}
                        fill={priorityConfig[priority].color}
                      />
                      <span>{priorityConfig[priority].label}</span>
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-44 p-2">
                    <div className="space-y-1">
                      {Object.entries(priorityConfig).map(([key, config]) => (
                        <button
                          key={key}
                          onClick={() => setPriority(key as TaskPriority)}
                          className={cn(
                            "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm",
                            "hover:bg-muted transition-colors",
                            priority === key && "bg-primary/10"
                          )}
                        >
                          <Flag
                            className="w-3.5 h-3.5"
                            style={{ color: config.color }}
                            fill={config.color}
                          />
                          <span className="flex-1 text-left">{config.label}</span>
                          {priority === key && <CheckCircle2 className="w-4 h-4 text-primary" />}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="border-t px-6 py-4">
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!title.trim() || createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}