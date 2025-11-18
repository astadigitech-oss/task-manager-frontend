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
  Activity,
  ChevronRight,
  Clock,
  MessageSquare,
  ChevronLeft,
  Download,
  Eye,
  File,
  MoreVertical,
  Maximize2,
  LayoutGrid,
  List,
  Plus,
} from "lucide-react";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { useTask } from "../../hooks/useTask";
import { useWorkspace } from "@/context/WorkspaceContext";
import type { Task, TaskStatus, TaskPriority } from "@/types/index";
import { divisionConfig } from "@/types";
import { cn } from "@/lib/utils";

import { ImageLightboxModal } from "./ImageLightBoxModal";
import { UniversalAttachmentViewer } from "@/components/modals/UniversalAttachmntViewer";
import { Switch } from "../ui/switch";

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

// Mock activity data
const mockActivities = [
  {
    id: 1,
    type: "upload",
    user: "John Doe",
    message: "uploaded 2 files",
    timestamp: "Just now",
    files: ["Screenshot 2025-10...png", "pelaksanaan-1.pdf"],
  },
  {
    id: 2,
    type: "comment",
    user: "Jane Smith",
    message: "added a comment",
    content: "Great progress on this task!",
    timestamp: "5 minutes ago",
  },
  {
    id: 3,
    type: "status",
    user: "John Doe",
    message: "changed status from On Board to On Progress",
    timestamp: "1 hour ago",
  },
  {
    id: 4,
    type: "assign",
    user: "Admin",
    message: "assigned this task to John Doe",
    timestamp: "2 hours ago",
  },
];

export function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
  const { updateTask, deleteTask } = useTask();
  const { members, projects } = useWorkspace();
  const [editedTask, setEditedTask] = useState<Task>(task);
  const [hasChanges, setHasChanges] = useState(false);
  const [notes, setNotes] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showActivity, setShowActivity] = useState(false);
  const [comment, setComment] = useState("");
  const [attachmentIndex, setAttachmentIndex] = useState(0);

  // NEW: lightbox + pdf states + restrict download
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfData, setPdfData] = useState<{ url: string; name: string } | null>(null);
  const [restrictDownload, setRestrictDownload] = useState(false);

  const project = projects.find((p) => p.id === task.projectId);
  const assignedMembers = members.filter((m) => editedTask.assignTo.includes(m.id));

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

  const handlePostComment = () => {
    if (comment.trim()) {
      // TODO: Add comment to activity
      console.log("New comment:", comment);
      setComment("");
    }
  };

  // helper untuk menentukan apakah file adalah image
  const isImageFile = (file: File) => file.type.startsWith("image/");
  const isPDFFile = (file: File) => file.type === "application/pdf";

  // Build array of image URLs only for image lightbox
  const imageAttachments = useMemo(() => {
    return attachments
      .map((file) => ({ file, url: URL.createObjectURL(file) }))
      .filter((f) => isImageFile(f.file))
      .map((f) => f.url);
    // NOTE: created object URLs are not revoked here for simplicity.
    // In production you may want to track and revoke them appropriately.
  }, [attachments]);

  // Handle click on attachment (index = index in attachments array)
  const handlePreviewAttachment = (index: number) => {
    const file = attachments[index];
    if (!file) return;

    if (isImageFile(file)) {
      // compute image index (how many images before this index)
      const imagesBefore = attachments.slice(0, index).filter(isImageFile).length;
      setLightboxIndex(imagesBefore);
      setLightboxOpen(true);
      return;
    }

    if (isPDFFile(file)) {
      const pdfUrl = URL.createObjectURL(file);
      setPdfData({ url: pdfUrl, name: file.name });
      setPdfOpen(true);
      return;
    }

    // For other files, fallback: try to open in new tab / trigger download
    const url = URL.createObjectURL(file);
    // If downloads are restricted, show a notice instead of opening
    if (restrictDownload) {
      alert("Download restricted for this task.");
      URL.revokeObjectURL(url);
      return;
    }
    window.open(url, "_blank");
    // we don't revoke here because browser tab may still use it
  };

  const handleDownloadAttachment = (file: File) => {
    if (restrictDownload) {
      alert("Download restricted for this task.");
      return;
    }
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePreviousAttachment = () => {
    setAttachmentIndex((prev) => Math.max(0, prev - 3));
  };

  const handleNextAttachment = () => {
    setAttachmentIndex((prev) => Math.min(attachments.length - 1, prev + 3));
  };

  const visibleAttachments = attachments.slice(attachmentIndex, attachmentIndex + 3);

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")) {
      return "🖼️";
    } else if (ext === "pdf") {
      return "📄";
    } else if (["doc", "docx"].includes(ext || "")) {
      return "📝";
    } else if (["xls", "xlsx"].includes(ext || "")) {
      return "📊";
    } else if (["zip", "rar", "7z"].includes(ext || "")) {
      return "🗜️";
    }
    return "📎";
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "p-0 gap-0 overflow-hidden transition-all duration-300",
          showActivity ? "sm:max-w-[1200px]" : "sm:max-w-[720px]"
        )}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Task Details</DialogTitle>
        </DialogHeader>

        <div className="flex h-[80vh] max-h-[800px]">
          {/* Main Content */}
          <div
            className={cn(
              "flex-1 overflow-y-auto transition-all duration-300",
              showActivity ? "border-r" : ""
            )}
          >
            <div className="p-6 space-y-6">
              {/* Header with Activity Toggle */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Input
                    value={editedTask.title}
                    onChange={(e) => handleUpdate({ title: e.target.value })}
                    className="text-xl font-semibold border-0 px-0 focus-visible:ring-0 focus-visible:border-b"
                    placeholder="Task name"
                  />
                  {project && <p className="text-sm text-muted mt-1">in {project.name}</p>}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowActivity(!showActivity)}
                  className={cn("gap-2 transition-colors", showActivity && "button-secondary")}
                >
                  <Activity className="w-4 h-4" />
                  Activity
                  <ChevronRight
                    className={cn("w-4 h-4 transition-transform", showActivity && "rotate-180")}
                  />
                </Button>
              </div>

              {/* Status and Priority Row */}
              <div className="flex items-center gap-3 flex-wrap">
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
                  <div className="flex items-center gap-2 text-muted">
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
                              "w-full flex items-center gap-2 px-2 py-1.5 rounded transition-colors",
                              editedTask.assignTo.includes(member.id) ? "button-secondary" : "hover:surface-hover"
                            )}
                          >
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm flex-1 text-left">{member.name}</span>
                            {editedTask.assignTo.includes(member.id) && (
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                            )}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  {assignedMembers.length > 0 ? (
                    assignedMembers.map((member) => {
                      const division = divisionConfig[member.division as keyof typeof divisionConfig];
                      return (
                        <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:surface-hover group">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                            <div className="flex items-center gap-1 text-xs text-muted">
                              <span>{member.role}</span>
                              {division && (
                                <>
                                  <span className="text-muted">•</span>
                                  <span>
                                    {division.emoji} {division.label}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => toggleAssignee(member.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:surface-hover rounded"
                          >
                            <X className="w-3.5 h-3.5 text-muted" />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted py-2">No one assigned</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Dates Section */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                    <CalendarIcon className="h-4 w-4" />
                    Start Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !editedTask.startDate && "text-muted")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editedTask.startDate ? format(new Date(editedTask.startDate), "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={editedTask.startDate ? new Date(editedTask.startDate) : undefined}
                        onSelect={(date) => handleDateChange(date, "startDate")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                    <CalendarIcon className="h-4 w-4" />
                    Due Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !editedTask.dueDate && "text-muted")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editedTask.dueDate ? format(new Date(editedTask.dueDate), "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={editedTask.dueDate ? new Date(editedTask.dueDate) : undefined}
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
                <label className="text-sm font-semibold text-foreground mb-2 block">Description</label>
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
                  <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-foreground">
                    <h4 className="text-base font-semibold">Attachments</h4>
                    {attachments.length > 0 && <span className="text-sm text-muted">{attachments.length}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Download all">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Grid view">
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="List view">
                      <List className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Fullscreen">
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                    <label htmlFor="file-upload">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        type="button"
                        onClick={() => document.getElementById("file-upload")?.click()}
                        title="Upload"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </label>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>

                {/* Upload Drop Zone */}
                <div
                  className="mb-4 p-8 border-2 border-dashed border-border rounded-lg surface hover:surface-hover transition-colors text-center cursor-pointer"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <p className="text-sm text-muted">
                    Drop your files here to <span className="underline">upload</span>
                  </p>
                </div>

                {/* Restrict Download Toggle */}
                <div className="flex items-center gap-2 mb-3">
                  <Switch checked={restrictDownload} onCheckedChange={setRestrictDownload} />
                  <span className="text-sm text-muted">Restrict Download</span>
                </div>

                {/* Attachments Grid */}
                {attachments.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {attachments.map((file, index) => {
                      const isImage = file.type.startsWith("image/");
                      const isPDF = file.type === "application/pdf";
                      const fileUrl = URL.createObjectURL(file);
                      const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
                      const timeAgo = "Just now"; // You can implement proper time calculation

                      return (
                        <div key={index} className="relative group surface-elevated rounded-lg overflow-hidden border border-border hover:border-border transition-all">
                          {/* Preview Image/Icon */}
                          <div className="aspect-video bg-surface flex items-center justify-center relative">
                            {isImage ? (
                              <img src={fileUrl} alt={file.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center justify-center">
                                <div className="w-16 h-16 rounded-lg bg-destructive/20 flex items-center justify-center mb-2">
                                  <span className="text-3xl">{isPDF ? "📄" : getFileIcon(file.name)}</span>
                                </div>
                                <span className="text-foreground text-xs font-semibold uppercase">{fileExt}</span>
                              </div>
                            )}

                            {/* Hover Actions */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="icon"
                                variant="secondary"
                                className="h-7 w-7 rounded-md button-secondary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Open menu (placeholder)
                                }}
                              >
                                <MoreVertical className="h-4 w-4 text-foreground" />
                              </Button>
                            </div>

                            {/* Fullscreen / Preview Icon */}
                            <button
                              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40"
                              onClick={() => handlePreviewAttachment(index)}
                            >
                              <div className="w-10 h-10 rounded-full bg-card/90 flex items-center justify-center">
                                <Maximize2 className="w-5 h-5 text-foreground" />
                              </div>
                            </button>

                            {/* File Type Badge (for non-images) */}
                            {!isImage && (
                              <div className="absolute bottom-2 right-2">
                                <div className="bg-card text-card-foreground text-xs px-2 py-1 rounded flex items-center gap-1">
                                  <File className="w-3 h-3" />
                                  <span className="uppercase font-semibold">{fileExt}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* File Info */}
                          <div className="p-3 surface-elevated flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <h4 className="text-sm font-medium text-foreground truncate mb-1">{file.name}</h4>
                              <p className="text-xs text-muted">{timeAgo}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Download button (disabled if restrictDownload) */}
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={restrictDownload}
                                className={restrictDownload ? "opacity-40 cursor-not-allowed" : "hover:surface-hover"}
                                onClick={() => !restrictDownload && handleDownloadAttachment(file)}
                                title={restrictDownload ? "Download restricted" : "Download"}
                              >
                                <Download className="w-4 h-4" />
                              </Button>

                              {/* Delete from attachments list */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="hover:surface-hover"
                                onClick={() => removeAttachment(index)}
                                title="Remove"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {attachments.length === 0 && <p className="text-center text-sm text-gray-500 py-4">No attachments yet</p>}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 surface-elevated border-t p-6">
              <div className="flex justify-between items-center">
                <Button variant="ghost" className="text-destructive hover:text-destructive/90 hover:surface-hover" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Task
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onClose}>
                    {hasChanges ? "Cancel" : "Close"}
                  </Button>
                  {hasChanges && (
                    <Button onClick={handleSave} className="button-primary">
                      Save Changes
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Activity Drawer */}
          {showActivity && (
            <div className="w-[400px] bg-gray-50 flex flex-col">
              {/* Activity Header */}
              <div className="p-6 border-b bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Activity
                  </h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowActivity(false)} className="h-8 w-8">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Activity List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {mockActivities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    {/* <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs bg-blue-100 text-blue-600">{activity.user.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="bg-white rounded-lg p-3 shadow-sm border">
                        <p className="text-sm">
                          <span className="font-semibold">{activity.user}</span>{" "}
                          <span className="text-gray-600">{activity.message}</span>
                        </p>

                        {activity.content && <p className="text-sm text-gray-700 mt-2 italic">"{activity.content}"</p>}

                        {activity.files && (
                          <div className="mt-2 space-y-1">
                            {activity.files.map((file, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs bg-gray-50 p-2 rounded">
                                <Paperclip className="w-3 h-3" />
                                <span className="truncate">{file}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                          <Clock className="w-3 h-3" />
                          {activity.timestamp}
                        </div>
                      </div>
                    </div> */}
                  </div>
                ))}
              </div>

              {/* Comment Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="min-h-[60px] resize-none text-sm"
                    />
                    <div className="flex justify-end mt-2">
                      <Button size="sm" onClick={handlePostComment} disabled={!comment.trim()} className="bg-blue-600 hover:bg-blue-700">
                        <MessageSquare className="w-3.5 h-3.5 mr-1" />
                        Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Integrasi Lightbox & PDF Modal */}
        <ImageLightboxModal
          images={imageAttachments}
          initialIndex={lightboxIndex}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          canDelete={true}
          allowDownload={!restrictDownload}
          onDelete={(imgIdx) => {
            // find the real attachment index that corresponds to this image index
            const realImageFiles = attachments.filter(isImageFile);
            const targetFile = realImageFiles[imgIdx];
            const realIndex = attachments.indexOf(targetFile);
            if (realIndex !== -1) removeAttachment(realIndex);
            // close if no images left
            if (attachments.filter(isImageFile).length <= 1) setLightboxOpen(false);
          }}
        />

        {pdfData && (
          <UniversalAttachmentViewer
            url={pdfData.url}
            name={pdfData.name}
            open={pdfOpen}
            onOpenChange={setPdfOpen}
            allowDownload={!restrictDownload}
            canDelete
            onDelete={() => {
              // find the real attachment index that corresponds to this pdf
              const realPdfFiles = attachments.filter(isPDFFile);
              const targetFile = realPdfFiles[0];
              const realIndex = attachments.indexOf(targetFile);
              if (realIndex !== -1) removeAttachment(realIndex);
              setPdfOpen(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
