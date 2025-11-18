"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import {
  ClipboardList,
  UserPlus,
  Calendar as CalendarIcon,
  Tag,
  Layout,
  CheckCircle2,
  X,
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { useTask } from "@/hooks/useTask";
import { useWorkspace } from "@/context/WorkspaceContext";
import type { TaskStatus, TaskPriority } from "@/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AddTaskModal({ projectId }: { projectId?: string }) {
  const { addTask } = useTask();
  const { projects, members } = useWorkspace();

  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("on-board");
  const [assignees, setAssignees] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [priority, setPriority] = useState<TaskPriority>("normal");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus("on-board");
    setAssignees([]);
    setStartDate(undefined);
    setDueDate(undefined);
    setPriority("normal");
  };

  const handleSubmit = () => {
    if (!title.trim() || !selectedProjectId) return;

    addTask({
      title,
      description,
      status,
      priority,
      projectId: selectedProjectId,
      assignTo: assignees,
      startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
      dueDate: dueDate
        ? format(dueDate, "yyyy-MM-dd")
        : new Date().toISOString().split("T")[0],
    });

    resetForm();
    setOpen(false);
  };

  const handleCancel = () => {
    resetForm();
    setOpen(false);
  };

  const toggleAssignee = (id: string) => {
    setAssignees((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const assignedMembers = members.filter((m) => assignees.includes(m.id));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          + New Task
        </Button>
      </DialogTrigger>

      <DialogContent
        className="
          max-w-xl sm:max-w-4xl 
          bg-white dark:bg-neutral-900 
          border border-gray-200 dark:border-neutral-700 
          rounded-lg p-6
        "
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Add Task
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400 text-sm">
            Create a new task and assign it to your team members
          </DialogDescription>
        </DialogHeader>

        {/* Task Fields */}
        <div className="mt-4 flex flex-col gap-4">
          {/* Project Select */}
          <Select
            value={selectedProjectId}
            onValueChange={setSelectedProjectId}
          >
            <SelectTrigger
              className="
                w-full border border-gray-300 dark:border-neutral-700
                bg-white dark:bg-neutral-800
                text-gray-700 dark:text-gray-200
              "
            >
              <ClipboardList className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700">
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Title */}
          <Input
            placeholder="Task Name or type '/' for commands"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="
              text-gray-900 dark:text-gray-100
              bg-white dark:bg-neutral-800
              border-gray-300 dark:border-neutral-700
              focus-visible:ring-blue-500 focus-visible:ring-1
            "
          />

          {/* Description */}
          <Textarea
            placeholder="Add a more detailed description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="
              min-h-[100px]
              text-gray-900 dark:text-gray-100
              bg-white dark:bg-neutral-800
              border-gray-300 dark:border-neutral-700
              focus-visible:ring-blue-500 focus-visible:ring-1
            "
          />
        </div>

        {/* Meta Section */}
        <div className="flex flex-wrap items-center gap-3 mt-5">
          {/* Status */}
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as TaskStatus)}
          >
            <SelectTrigger
              className="
                bg-gray-100 dark:bg-neutral-800
                text-gray-700 dark:text-gray-200
                border-gray-300 dark:border-neutral-700
                w-auto px-3 text-sm
              "
            >
              <Layout className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700">
              <SelectItem value="on-board">On Board</SelectItem>
              <SelectItem value="on-progress">On Progress</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>

          {/* Assignees */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="
                  relative flex items-center gap-1 h-9 px-2 text-sm
                  border border-gray-300 dark:border-neutral-700
                  bg-gray-100 dark:bg-neutral-800
                  hover:bg-gray-200 dark:hover:bg-neutral-700
                "
              >
                {assignedMembers.length > 0 ? (
                  <div className="flex -space-x-2">
                    {assignedMembers.slice(0, 5).map((member) => (
                      <TooltipProvider key={member.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Avatar className="h-7 w-7 border-2 border-white dark:border-neutral-900 shadow-sm">
                              <AvatarImage
                                src={member.avatar}
                                alt={member.name}
                              />
                              <AvatarFallback className="text-xs">
                                {member.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent className="bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-200">
                            {member.name}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-300">
                    <UserPlus className="w-4 h-4" />
                    Assign
                  </div>
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent
              className="
                w-64 p-2
                bg-white dark:bg-neutral-900 
                border border-gray-200 dark:border-neutral-700
              "
            >
              <div className="space-y-1">
                {members.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => toggleAssignee(member.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded transition-colors",
                      "hover:bg-gray-100 dark:hover:bg-neutral-800",
                      "text-gray-700 dark:text-gray-200",
                      assignees.includes(member.id) &&
                        "bg-blue-50 dark:bg-blue-900/30"
                    )}
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="text-xs">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm flex-1 text-left">
                      {member.name}
                    </span>
                    {assignees.includes(member.id) && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Start Date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="
                  bg-gray-100 dark:bg-neutral-800
                  text-gray-700 dark:text-gray-200
                  border-gray-300 dark:border-neutral-700
                  w-auto px-3 text-sm flex items-center gap-2
                "
              >
                <CalendarIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                {startDate ? format(startDate, "MMM d, yyyy") : "Start Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="
                w-auto p-2 
                bg-white dark:bg-neutral-900 
                border border-gray-200 dark:border-neutral-700
              "
            >
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Due Date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="
                  bg-gray-100 dark:bg-neutral-800
                  text-gray-700 dark:text-gray-200
                  border-gray-300 dark:border-neutral-700
                  w-auto px-3 text-sm flex items-center gap-2
                "
              >
                <CalendarIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                {dueDate ? format(dueDate, "MMM d, yyyy") : "Due Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="
                w-auto p-2 
                bg-white dark:bg-neutral-900 
                border border-gray-200 dark:border-neutral-700
              "
            >
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Priority */}
          <Select
            value={priority}
            onValueChange={(v) => setPriority(v as TaskPriority)}
          >
            <SelectTrigger
              className="
                bg-gray-100 dark:bg-neutral-800
                text-gray-700 dark:text-gray-200
                border-gray-300 dark:border-neutral-700
                w-auto px-3 text-sm
              "
            >
              <Tag className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700">
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Footer */}
        <div
          className="
            flex justify-end items-center mt-6 
            border-t border-gray-200 dark:border-neutral-700 
            pt-4 gap-2
          "
        >
          <Button
            variant="outline"
            onClick={handleCancel}
            className="
              text-gray-700 dark:text-gray-200
              border-gray-300 dark:border-neutral-700
              hover:bg-gray-100 dark:hover:bg-neutral-800
            "
          >
            Cancel
          </Button>

          <Button
            className="
              bg-blue-600 hover:bg-blue-700 
              text-white px-5 py-2 text-sm rounded-md
            "
            onClick={handleSubmit}
            disabled={!title.trim() || !selectedProjectId}
          >
            Create Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
