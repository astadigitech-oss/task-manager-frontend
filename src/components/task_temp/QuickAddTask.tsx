"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  UserPlus,
  Calendar as CalendarIcon,
  Flag,
  CheckCircle2,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { useTask } from "@/hooks/useTask";
import { useWorkspace } from "@/context/WorkspaceContext";
import type { TaskStatus, TaskPriority } from "@/types/index";
import { cn } from "@/lib/utils";

interface QuickAddTaskProps {
  projectId: string;
  status: TaskStatus;
  onComplete?: () => void;
}

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  low: { label: "Low", className: "badge-low" },
  normal: { label: "Normal", className: "badge-normal" },
  high: { label: "High", className: "badge-high" },
  urgent: { label: "Urgent", className: "badge-urgent" },
  critical: { label: "Critical", className: "badge-critical" },
  tbd: { label: "TBD", className: "badge-tbd" },
};


export function QuickAddTask({ projectId, status, onComplete }: QuickAddTaskProps) {
  const { addTask } = useTask();
  const { members } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [assignees, setAssignees] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!taskName.trim()) return;

    addTask({
      title: taskName,
      description: "",
      status: status,
      priority: priority,
      projectId: projectId,
      assignTo: assignees,
      dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : new Date().toISOString().split("T")[0],
    });

    // Reset form
    setTaskName("");
    setAssignees([]);
    setDueDate(undefined);
    setPriority("normal");
    setIsOpen(false);
    onComplete?.();
  };

  const handleCancel = () => {
    setTaskName("");
    setAssignees([]);
    setDueDate(undefined);
    setPriority("normal");
    setIsOpen(false);
  };

  const toggleAssignee = (memberId: string) => {
    setAssignees((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full text-left px-3 py-2 text-sm text-muted hover:text-foreground hover:surface-hover rounded-md transition-colors"
      >
        + Add task
      </button>
    );
  }

  const selectedMembers = members.filter((m) => assignees.includes(m.id));

  return (
    <div className="surface-elevated border border-border rounded-lg shadow-lg p-3 space-y-3">
      {/* Task Name Input */}
      <Input
        ref={inputRef}
        placeholder="Task name..."
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && taskName.trim()) {
            handleSave();
          } else if (e.key === "Escape") {
            handleCancel();
          }
        }}
        className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
      />

      {/* Quick Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Assignee Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 gap-1.5 text-xs",
                selectedMembers.length > 0 ? "button-secondary" : "text-muted"
              )}
            >
              <UserPlus className="w-3.5 h-3.5" />
              {selectedMembers.length > 0 ? (
                <span>{selectedMembers.length} assigned</span>
              ) : (
                <span>Add assignee</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="start">
            <div className="space-y-1">
              {members.map((member) => (
                <button
                  key={member.id}
                  onClick={() => toggleAssignee(member.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded transition-colors",
                    assignees.includes(member.id) ? "button-secondary" : "hover:surface-hover"
                  )}
                >
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="text-xs">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm flex-1 text-left">{member.name}</span>
                  {assignees.includes(member.id) && (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Due Date Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 gap-1.5 text-xs",
                dueDate ? "button-secondary" : "text-muted"
              )}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              {dueDate ? format(dueDate, "MMM d") : "Add dates"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <Calendar mode="single" selected={dueDate} onSelect={setDueDate} />
          </PopoverContent>
        </Popover>

        {/* Priority Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 gap-1.5 text-xs",
                priority !== "normal"
                  ? priorityConfig[priority].className
                  : "text-muted"
              )}
            >
              <Flag className="w-3.5 h-3.5" />
              {priorityConfig[priority].label}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-48 p-2" align="start">
            <div className="space-y-1">
              {(Object.keys(priorityConfig) as TaskPriority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors",
                    priority === p
                      ? priorityConfig[p].className
                      : "hover:surface-hover text-muted"
                  )}
                >
                  <Flag className="w-3.5 h-3.5" />
                  {priorityConfig[p].label}
                </button>
              ))}
            </div>
          </PopoverContent>

        </Popover>
      </div>

      {/* Selected Assignees Display */}
      {selectedMembers.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {selectedMembers.map((member) => (
            <Badge
              key={member.id}
              variant="secondary"
              className="gap-1.5 pr-1 badge-normal"
            >
              <Avatar className="w-4 h-4">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback className="text-[8px]">
                  {member.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">{member.name}</span>
              <button
                onClick={() => toggleAssignee(member.id)}
                className="hover:surface-hover rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t divider">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="h-7 text-xs"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!taskName.trim()}
          className="h-7 text-xs button-primary"
        >
          Save
        </Button>
      </div>
    </div>
  );
}