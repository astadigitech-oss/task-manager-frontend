"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Trash2, Flag, Activity, ChevronRight } from "lucide-react";

// UI Components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

// Hooks & Context
import { useTask } from "@/hooks/useTask";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useAttachments } from "@/hooks/useAttachments";
import { useAuthStore } from "@/store/useAuthStore";

// Types
import type { Task, TaskStatus, TaskPriority, TaskActivity } from "@/types/index";

// Utils
import { isImageFile, isPDFFile } from "@/lib/file-utils";
import { cn } from "@/lib/utils";
import { showSuccessToast, showErrorToast, showWarningToast, showConfirmToast } from "@/lib/toast-helpers";

// Constants
import { statusConfig, priorityConfig } from "@/constants/task";

// Components
import { AssigneesSection } from "@/components/modals/task-detail/AssigneesSection";
import { DateSection } from "@/components/modals/task-detail/DateSection";
import { AttachmentsSection } from "@/components/modals/task-detail/AttachmentsSection";
import { TaskActivitySection } from "@/components/modals/task-detail/TaskActivitySection";

// Modals
import { ImageLightBoxModal } from "@/components/modals/ImageLightBoxModal";
import { UniversalAttachmentViewer } from "@/components/modals/UniversalAttachmentViewer";

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  readOnly?: boolean; // Member mode - view only
}

export function TaskDetailModal({ task, onClose, readOnly = false }: TaskDetailModalProps) {
  const { updateTask, deleteTask } = useTask();
  const { members, projects } = useWorkspace();
  const { user } = useAuthStore();
  const [editedTask, setEditedTask] = useState<Task>(task);
  const [hasChanges, setHasChanges] = useState(false);
  const [showActivity, setShowActivity] = useState(false);

  // Use custom hook for attachments
  const {
    attachments,
    lightboxOpen,
    setLightboxOpen,
    lightboxIndex,
    pdfOpen,
    setPdfOpen,
    pdfData,
    restrictDownload,
    setRestrictDownload,
    imageAttachments,
    handleFileUpload,
    removeAttachment,
    handlePreviewAttachment,
    handleDownloadAttachment,
  } = useAttachments({
    onChangeCallback: () => setHasChanges(true),
  });

  const project = projects.find((p) => p.id === task.projectId);

  const generateMockActivities = (): TaskActivity[] => {
    const activities: TaskActivity[] = [];

    // Activity: Task created
    activities.push({
      id: `activity-created-${task.id}`,
      type: "edit",
      userId: task.assignTo[0] || user?.id || "1",
      timestamp: task.createdAt,
      data: { action: "created" },
    });

    // Activity: Assignees added
    task.assignTo.forEach((assigneeId, index) => {
      const assignee = members.find((m) => m.id === assigneeId);
      if (assignee) {
        activities.push({
          id: `activity-assignee-${task.id}-${index}`,
          type: "assignee_add",
          userId: user?.id || "1",
          timestamp: new Date(new Date(task.createdAt).getTime() + index * 60000).toISOString(),
          data: { assigneeName: assignee.name },
        });
      }
    });

    // Activity: Status change (if updated)
    if (task.updatedAt !== task.createdAt) {
      activities.push({
        id: `activity-status-${task.id}`,
        type: "status_change",
        userId: task.assignTo[0] || user?.id || "1",
        timestamp: task.updatedAt,
        data: { newStatus: task.status },
      });
    }
    // Activity: Status change (if updated)
    if (task.updatedAt !== task.createdAt) {
      activities.push({
        id: `activity-priority-${task.id}`,
        type: "priority_change",
        userId: task.assignTo[0] || user?.id || "1",
        timestamp: task.updatedAt,
        data: { newStatus: task.status },
      });
    }

    // Activity: Mock attachment uploads
    attachments.forEach((file, index) => {
      activities.push({
        id: `activity-attachment-${task.id}-${index}`,
        type: "attachment_upload",
        userId: user?.id || task.assignTo[0] || "1",
        timestamp: new Date(new Date(task.updatedAt).getTime() + (index + 1) * 120000).toISOString(),
        data: { fileName: file.name, fileIndex: index },
      });
    });

    // Sort by timestamp (newest first)
    return activities.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const mockActivities = generateMockActivities();

  const handleUpdate = (updates: Partial<Task>) => {
    // Member hanya bisa update status
    if (readOnly && !updates.status) return;
    setEditedTask((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (readOnly) return;

    // Validasi
    if (!editedTask.title.trim()) {
      showErrorToast("Nama task wajib diisi!", "Silakan masukkan nama task.");
      return;
    }

    if (editedTask.title.trim().length < 3) {
      showErrorToast("Nama task terlalu pendek!", "Nama task minimal 3 karakter.");
      return;
    }

    if (editedTask.assignTo.length === 0) {
      showWarningToast("Task belum di-assign", "Task akan disimpan tanpa assignee.");
    }

    updateTask(task.id, {
      ...editedTask,
      title: editedTask.title.trim(),
      description: editedTask.description.trim(),
    });

    // Show success toast for manual save
    showSuccessToast("Task berhasil diedit!", `Perubahan pada task "${editedTask.title.trim()}" telah disimpan.`);

    setHasChanges(false);
    onClose();
  };

  const handleDelete = () => {
    if (readOnly) return; // Member tidak bisa delete

    showConfirmToast(
      `Hapus task "${task.title}"?`,
      "Task yang dihapus tidak dapat dikembalikan.",
      () => {
        deleteTask(task.id);
        onClose();
      }
    );
  };

  const toggleAssignee = (memberId: string) => {
    if (readOnly) return; // Member tidak bisa toggle assignee
    const newAssignees = editedTask.assignTo.includes(memberId)
      ? editedTask.assignTo.filter((id) => id !== memberId)
      : [...editedTask.assignTo, memberId];
    handleUpdate({ assignTo: newAssignees });
  };

  const handleDateChange = (date: Date | undefined, field: "startDate" | "dueDate") => {
    if (readOnly) return; // Member tidak bisa change date
    if (date) {
      handleUpdate({ [field]: format(date, "yyyy-MM-dd") });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="p-0 gap-0 overflow-hidden transition-all duration-300 sm:max-w-[900px]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">Task Details</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[80vh] max-h-[800px]">
          {/* Main Content - Scrollable Area */}
          <div className="flex-1 overflow-y-auto transition-all duration-300">
            <div className="p-6 space-y-6">
              {/* Task Title and Project */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Input
                    value={editedTask.title}
                    onChange={(e) => handleUpdate({ title: e.target.value })}
                    className="text-xl font-semibold border-0 px-0 focus-visible:ring-0 focus-visible:border-b"
                    placeholder="Task name"
                    disabled={readOnly}
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
                  onValueChange={(value: string) => {
                    handleUpdate({ status: value as TaskStatus });
                    // Auto-save status change untuk member
                    if (readOnly) {
                      updateTask(task.id, { ...editedTask, status: value as TaskStatus });
                    }
                  }}
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
                  onValueChange={(value: string) => handleUpdate({ priority: value as TaskPriority })}
                  disabled={readOnly}
                >
                  <SelectTrigger className="w-[140px] h-8">
                    <div className="flex items-center gap-1.5">
                      <Flag
                        className="w-3.5 h-3.5"
                        style={{ color: priorityConfig[editedTask.priority].color }}
                        fill={priorityConfig[editedTask.priority].color}
                      />
                      <span className="text-sm">{priorityConfig[editedTask.priority].label}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-1.5">
                          <Flag
                            className="w-3.5 h-3.5"
                            style={{ color: config.color }}
                            fill={config.color}
                          />
                          <span>{config.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Assignees Section */}
              <AssigneesSection
                members={members}
                assignedMemberIds={editedTask.assignTo}
                onToggleAssignee={toggleAssignee}
                readOnly={readOnly}
              />

              <Separator />

              {/* Dates Section */}
              <DateSection
                startDate={editedTask.startDate}
                dueDate={editedTask.dueDate}
                onDateChange={handleDateChange}
                readOnly={readOnly}
              />

              <Separator />

              {/* Description Section */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Description</label>
                <Textarea
                  value={editedTask.description || ""}
                  onChange={(e) => handleUpdate({ description: e.target.value })}
                  className="min-h-[120px] resize-none"
                  placeholder="Add a description..."
                  disabled={readOnly}
                />
              </div>

              <Separator />

              {/* Attachments Section */}
              <AttachmentsSection
                attachments={attachments}
                restrictDownload={restrictDownload}
                onRestrictDownloadChange={setRestrictDownload}
                onFileUpload={handleFileUpload}
                onPreviewAttachment={handlePreviewAttachment}
                onDownloadAttachment={handleDownloadAttachment}
                onRemoveAttachment={removeAttachment}
                readOnly={readOnly}
              />

              {/* Activity Section - Collapsible */}
              {showActivity && (
                <>
                  <Separator />
                  <TaskActivitySection
                    activities={mockActivities}
                    attachments={attachments}
                    onPreviewAttachment={handlePreviewAttachment}
                    onDownloadAttachment={handleDownloadAttachment}
                  />
                </>
              )}
            </div>
          </div>

          {/* Action Buttons - Fixed Footer */}
          <div className="border-t surface-elevated px-6 py-4">
            <div className="flex justify-between items-center">
              <div className={cn("flex gap-2", readOnly && "ml-auto")}>
                <Button variant="outline" onClick={onClose}>
                  {readOnly ? "Close" : hasChanges ? "Cancel" : "Close"}
                </Button>
                {!readOnly && hasChanges && (
                  <Button onClick={handleSave} className="button-primary">
                    Save Changes
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Integrasi Lightbox & PDF Modal */}
        <ImageLightBoxModal
          images={imageAttachments}
          initialIndex={lightboxIndex}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          canDelete={true}
          allowDownload={!restrictDownload}
          onDelete={(imgIdx: string | number) => {
            // find the real attachment index that corresponds to this image index
            const realImageFiles = attachments.filter(isImageFile);
            const targetFile = realImageFiles[imgIdx as number];
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
