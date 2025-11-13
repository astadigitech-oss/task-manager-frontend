"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Calendar as CalendarComponent } from "../ui/calendar";
import {
  Calendar as CalendarIcon,
  Tag,
  User,
  Trash2,
  X,
  CheckCircle2,
  UserPlus,
  Paperclip,
  FileText,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { useTask } from "../../hooks/useTask";
import { useWorkspace } from "@/context/WorkspaceContext";
import type { Task, TaskStatus, TaskPriority } from "@/types/index";
import { divisionConfig } from "@/types";
import { cn } from "@/lib/utils";

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
}

const statusConfig = {
  "on-board": { label: "On Board", className: "status-on-board" },
  "on-progress": { label: "On Progress", className: "status-on-progress" },
  "pending": { label: "Pending", className: "status-pending" },
  "canceled": { label: "Canceled", className: "status-canceled" },
  "done": { label: "Done", className: "status-done" },
};

const priorityConfig = {
  low: { label: "Low", className: "badge-low" },
  normal: { label: "Normal", className: "badge-normal" },
  high: { label: "High", className: "badge-high" },
  urgent: { label: "Urgent", className: "badge-urgent" },
  critical: { label: "Critical", className: "badge-critical" },
  tbd: { label: "TBD", className: "badge-tbd" },
};

export function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
  const { updateTask, deleteTask } = useTask();
  const { members, projects } = useWorkspace();
  const [editedTask, setEditedTask] = useState<Task>(task);
  const [hasChanges, setHasChanges] = useState(false);
  const [notes, setNotes] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  const project = projects.find((p) => p.id === task.projectId);
  const assignedMembers = members.filter((m) =>
    editedTask.assignTo.includes(m.id)
  );

  const handleUpdate = (updates: Partial<Task>) => {
    setEditedTask((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateTask(task.id, editedTask);
    setHasChanges(false);
    onClose();
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(task.id);
      onClose();
    }
  };

  const toggleAssignee = (memberId: string) => {
    const newAssignees = editedTask.assignTo.includes(memberId)
      ? editedTask.assignTo.filter((id) => id !== memberId)
      : [...editedTask.assignTo, memberId];
    handleUpdate({ assignTo: newAssignees });
  };

  const handleDateChange = (date: Date | undefined, field: "startDate" | "dueDate") => {
    if (date) {
      handleUpdate({ [field]: format(date, "yyyy-MM-dd") });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...newFiles]);
      setHasChanges(true);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Task Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Title - Editable */}
          <div>
            <Input
              value={editedTask.title}
              onChange={(e) => handleUpdate({ title: e.target.value })}
              className="text-xl font-semibold border-0 px-0 focus-visible:ring-0 focus-visible:border-b"
              placeholder="Task name"
            />
            {project && (
              <p className="text-sm text-gray-500 mt-1">in {project.name}</p>
            )}
          </div>

          {/* Status and Priority Row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Status Selector */}
            <Select
              value={editedTask.status}
              onValueChange={(value) => handleUpdate({ status: value as TaskStatus })}
            >
              <SelectTrigger className="w-[160px] h-8">
                <Badge variant="outline" className={statusConfig[editedTask.status].className}>
                  {statusConfig[editedTask.status].label}
                </Badge>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <Badge variant="outline" className={config.className}>
                      {config.label}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Priority Selector */}
            <Select
              value={editedTask.priority}
              onValueChange={(value) => handleUpdate({ priority: value as TaskPriority })}
            >
              <SelectTrigger className="w-[140px] h-8">
                <Badge variant="outline" className={priorityConfig[editedTask.priority].className}>
                  <Tag className="w-3 h-3 mr-1" />
                  {priorityConfig[editedTask.priority].label}
                </Badge>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(priorityConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <Badge variant="outline" className={config.className}>
                      <Tag className="w-3 h-3 mr-1" />
                      {config.label}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Assignees Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-gray-700">
                <User className="h-4 w-4" />
                <h4 className="text-sm font-semibold">Assigned To</h4>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    <UserPlus className="w-3.5 h-3.5 mr-1" />
                    Add
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="end">
                  <div className="space-y-1">
                    {members.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => toggleAssignee(member.id)}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 transition-colors",
                          editedTask.assignTo.includes(member.id) && "bg-blue-50"
                        )}
                      >
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback className="text-xs">
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm flex-1 text-left">{member.name}</span>
                        {editedTask.assignTo.includes(member.id) && (
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Assigned Members Display */}
            <div className="space-y-2">
              {assignedMembers.length > 0 ? (
                assignedMembers.map((member) => {
                  const division = divisionConfig[member.division as keyof typeof divisionConfig];
                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 group"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {member.name}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span>{member.role}</span>
                          {division && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span>
                                {division.emoji} {division.label}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => toggleAssignee(member.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                      >
                        <X className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 py-2">No one assigned</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Dates Section */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <CalendarIcon className="h-4 w-4" />
                Start Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !editedTask.startDate && "text-gray-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editedTask.startDate
                      ? format(new Date(editedTask.startDate), "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={
                      editedTask.startDate
                        ? new Date(editedTask.startDate)
                        : undefined
                    }
                    onSelect={(date) => handleDateChange(date, "startDate")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Due Date */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <CalendarIcon className="h-4 w-4" />
                Due Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !editedTask.dueDate && "text-gray-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editedTask.dueDate
                      ? format(new Date(editedTask.dueDate), "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={
                      editedTask.dueDate ? new Date(editedTask.dueDate) : undefined
                    }
                    onSelect={(date) => handleDateChange(date, "dueDate")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Separator />

          {/* Description Section */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Description
            </label>
            <Textarea
              value={editedTask.description || ""}
              onChange={(e) => handleUpdate({ description: e.target.value })}
              className="min-h-[120px] resize-none"
              placeholder="Add a description..."
            />
          </div>

          <Separator />

          {/* Attachments Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-gray-700">
                <Paperclip className="h-4 w-4" />
                <h4 className="text-sm font-semibold">Attachments</h4>
              </div>
              <label htmlFor="file-upload">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  type="button"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <Upload className="w-3.5 h-3.5 mr-1" />
                  Upload
                </Button>
              </label>
              <input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {attachments.length > 0 ? (
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-blue-100">
                      <Paperclip className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                    >
                      <X className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No attachments</p>
                <p className="text-xs text-gray-400 mt-1">
                  Click upload to add files
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Notes Section */}
          <div>
            <div className="flex items-center gap-2 text-gray-700 mb-3">
              <FileText className="h-4 w-4" />
              <h4 className="text-sm font-semibold">Notes</h4>
            </div>
            <Textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setHasChanges(true);
              }}
              className="min-h-[100px] resize-none"
              placeholder="Add notes or comments..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t">
          <Button
            variant="ghost"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Task
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              {hasChanges ? "Cancel" : "Close"}
            </Button>
            {hasChanges && (
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}