"use client";

import { useCallback, useMemo, useState } from "react";
import { format } from "date-fns";
import { AlertTriangle, Flag, Layout, Maximize2, CheckCircle2 } from "lucide-react";
import { resolveImageUrl } from "@/lib/helpers/imageUrlHelper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useTaskImages } from "@/context/TaskContext";
import { useProject } from "@/context/ProjectContext";
import { useAuthStore } from "@/store/useAuthStore";
import { useProjectMembers } from "@/hooks/project/useProjectMembers";
import type { TaskApi, TaskFileApi } from "@/types/api/task.api";
import type { ProjectMemberApi } from "@/types/api/project.api";
import { statusConfig, priorityConfig } from "@/constants/task";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AssigneesSection } from "@/components/task/task-detail/AssigneesSection";
import { ImageLightBoxModal } from "./ImageLightBoxModal";
import {
  formatDeadline,
  isCompletedLate,
  getTaskDeadlineStatus,
  formatFinishedAt,
  formatOverdueDisplay,
} from "@/lib/mapper/task.mapper";
import { FilesSection } from "../task/task-detail/FilesSection";
import { useDownloadTaskFile, useTaskFiles } from "@/hooks/task/useTaskFiles";
import { ScrollArea } from "../ui/scroll-area";
import { StatusDurationTracker } from "../task/task-detail/StatusDurationTracker";

interface TaskDetailModalProps {
  task: TaskApi;
  onClose: () => void;
  onEdit?: () => void;
  workspace_id: number;
}

export function TaskDetailModal({ task, onClose, onEdit, workspace_id }: TaskDetailModalProps) {
  const { data: taskImages = [] } = useTaskImages(workspace_id, task.project_id, task.id);
  const { projects } = useProject();
  const { user } = useAuthStore();

  const role = user?.role;

  const isAdmin = role === "admin";

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [lightboxType, setLightboxType] = useState<"before" | "after">("before");

  const project = useMemo(
    () => projects.find(p => p.id === task.project_id),
    [projects, task.project_id]
  );

  const { members: projectMembers = [] } = useProjectMembers(task.project_id);

  const { data: taskFiles = [] } = useTaskFiles(
    isAdmin ? workspace_id : null,
    isAdmin ? task.project_id : null,
    isAdmin ? task.id : null
  );
  const downloadFileMutation = useDownloadTaskFile();

  const taskMembers = task.task_members || [];

  const canEdit = useMemo(() => {
    return (
      user?.role === "admin" ||
      taskMembers.some((m) => m.user_id === Number(user?.id))
    );
  }, [user, taskMembers]);

  const membersForSection = useMemo(() => {
    return projectMembers.map((pm: ProjectMemberApi) => ({
      id: pm.user_id ?? pm.id,
      name: pm.name,
      avatar: pm.profile_img || pm.avatar || "",
      role: pm.role || "member",
      division: "",
    }));
  }, [projectMembers]);

  const assignedMemberIds = useMemo(() => {
    return taskMembers.map((m) => m.user_id);
  }, [taskMembers]);

  const deadlineStatus = useMemo(() => {
    return getTaskDeadlineStatus(task);
  }, [task]);

  const handlePointerDownOutside = (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-sonner-toast]")) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Separate before/after image URLs for lightbox
  const imageUrlsBefore = useMemo(
    () =>
      taskImages
        .filter(img => img.type === "before")
        .map((img) => resolveImageUrl(img.url))
        .filter((url): url is string => Boolean(url)),
    [taskImages]
  );

  const imageUrlsAfter = useMemo(
    () =>
      taskImages
        .filter(img => img.type === "after")
        .map((img) => resolveImageUrl(img.url))
        .filter((url): url is string => Boolean(url)),
    [taskImages]
  );

  const handleDownloadFile = useCallback((file: TaskFileApi) => {
    downloadFileMutation.mutate({
      workspaceId: workspace_id,
      projectId: task.project_id,
      taskId: task.id,
      fileId: file.id,
      filename: file.filename,
    });
  }, [workspace_id, task.project_id, task.id, downloadFileMutation]);

  const taskImagesBefore = useMemo(() => taskImages.filter(img => img.type === "before"), [taskImages]);
  const taskImagesAfter = useMemo(() => taskImages.filter(img => img.type === "after"), [taskImages]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="p-0 gap-0 overflow-hidden sm:max-w-300 aria-describedby={undefined}"
        onPointerDownOutside={handlePointerDownOutside}
        aria-describedby={undefined}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Task Details
            </DialogTitle>
          </div>
        </DialogHeader>


        <div className="flex flex-col h-[80vh] max-h-200">
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="flex h-full">
              <div className="p-6 space-y-6">
                {/* TITLE SECTION */}
                <div>
                  <h2 className="text-2xl font-bold">{task.title}</h2>
                  {project && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Layout className="w-4 h-4" />
                      <span className="text-sm">in {project.name}</span>
                    </div>
                  )}
                </div>

                {/* STATUS & PRIORITY SECTION*/}
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="outline" className={statusConfig[task.status].className}>
                    {statusConfig[task.status].label}
                  </Badge>

                  <div className="flex items-center gap-1.5">
                    <Flag
                      className="w-4 h-4"
                      style={{ color: priorityConfig[task.priority].color }}
                      fill={priorityConfig[task.priority].color}
                    />
                    <span className="text-sm font-medium">
                      {priorityConfig[task.priority].label}
                    </span>
                  </div>

                  {task.due_date && deadlineStatus.status !== 'no-deadline' && (
                    <Badge
                      variant={
                        deadlineStatus.variant === 'destructive' ? 'destructive' :
                          deadlineStatus.variant === 'warning' ? 'outline' :
                            deadlineStatus.variant === 'success' ? 'default' :
                              'secondary'
                      }
                      className={
                        deadlineStatus.status === 'completed-on-time'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700 gap-1'
                          : deadlineStatus.status === 'completed-late'
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700 gap-1'
                            : 'gap-1'
                      }
                    >
                      {deadlineStatus.status === 'completed-on-time' && (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      {(deadlineStatus.status === 'overdue' || deadlineStatus.status === 'completed-late') && (
                        <AlertTriangle className="w-3 h-3" />
                      )}
                      {deadlineStatus.message}
                    </Badge>
                  )}
                </div>

                <Separator />

                {/* ASSIGNEES SECTION */}
                <AssigneesSection
                  member={membersForSection}
                  assignedMemberIds={assignedMemberIds}
                  onToggleAssignee={() => { }}
                  readOnly
                  workspaceId={workspace_id}
                  projectId={task.project_id}
                  taskId={task.id}
                />

                <Separator />

                {/* DATES SECTION */}
                {(task.start_date || task.due_date) && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      {task.start_date && (
                        <div>
                          <Label>Start Date</Label>
                          <p className="text-sm mt-1">
                            {format(new Date(task.start_date), "PPP")}
                          </p>
                        </div>
                      )}
                      {task.due_date && (
                        <div>
                          <Label>Due Date</Label>
                          <div className="mt-1 space-y-1">
                            <p className="text-sm font-medium">
                              {formatDeadline(task.due_date, task.due_time)}
                            </p>
                            {task.due_time && (
                              <p className="text-xs text-muted-foreground">
                                Time: {task.due_time}
                              </p>
                            )}

                            {task.status !== "done" && task.status !== "canceled" && (
                              <>
                                {deadlineStatus.status === 'overdue' && (
                                  <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>{formatOverdueDisplay(task)}</span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* FINISHED AT SECTION */}
                    {task.status === "done" && task.finished_at && (
                      <div className={`mt-4 p-4 rounded-lg border ${isCompletedLate(task)
                        ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50'
                        : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50'
                        }`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <Label className="text-xs font-semibold mb-1 block text-foreground">
                              Completed At
                            </Label>
                            <p className="text-sm font-medium text-foreground">
                              {formatFinishedAt(task.finished_at)}
                            </p>
                            {task.due_date && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Due date was: {formatDeadline(task.due_date, task.due_time)}
                              </p>
                            )}

                            {isCompletedLate(task) && task.overdue_duration && task.overdue_duration > 0 && (
                              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 font-medium">
                                {formatOverdueDisplay(task)}
                              </p>
                            )}
                          </div>
                          <div>
                            {isCompletedLate(task) ? (
                              <Badge variant="outline" className="gap-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700 whitespace-nowrap">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Completed Late
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700 whitespace-nowrap">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                On Time
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <Separator />

                    <StatusDurationTracker task={task} />

                    <Separator />
                  </>
                )}

                {/* DESCRIPTION SECTION */}
                {task.description && (
                  <>
                    <div>
                      <Label>Description</Label>
                      <p className="whitespace-pre-wrap text-muted-foreground text-sm mt-1">
                        {task.description}
                      </p>
                    </div>
                    <Separator />
                  </>
                )}

                {/* IMAGES SECTION — Before (kiri) & After (kanan) — View Only */}
                {taskImages?.length > 0 && (
                  <>
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Images</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {/* BEFORE */}
                        <div className="border rounded-lg p-4 space-y-3">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Before
                          </p>
                          {taskImagesBefore.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">No images</p>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              {taskImagesBefore.map((img, index) => {
                                const imageUrl = resolveImageUrl(img.url);
                                if (!imageUrl) return null;
                                return (
                                  <div
                                    key={img.id}
                                    className="relative rounded-md border overflow-hidden aspect-video bg-muted group cursor-pointer"
                                    onClick={() => {
                                      setPreviewIndex(index);
                                      setLightboxType("before");
                                      setPreviewOpen(true);
                                    }}
                                  >
                                    <img
                                      src={imageUrl}
                                      alt={img.title || "Before image"}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = "none";
                                      }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <div className="w-8 h-8 rounded-full bg-card/90 flex items-center justify-center">
                                        <Maximize2 className="w-4 h-4" />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* AFTER */}
                        <div className="border rounded-lg p-4 space-y-3">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            After
                          </p>
                          {taskImagesAfter.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">No images</p>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              {taskImagesAfter.map((img, index) => {
                                const imageUrl = resolveImageUrl(img.url);
                                if (!imageUrl) return null;
                                return (
                                  <div
                                    key={img.id}
                                    className="relative rounded-md border overflow-hidden aspect-video bg-muted group cursor-pointer"
                                    onClick={() => {
                                      setPreviewIndex(index);
                                      setLightboxType("after");
                                      setPreviewOpen(true);
                                    }}
                                  >
                                    <img
                                      src={imageUrl}
                                      alt={img.title || "After image"}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = "none";
                                      }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <div className="w-8 h-8 rounded-full bg-card/90 flex items-center justify-center">
                                        <Maximize2 className="w-4 h-4" />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* NOTES SECTION */}
                <div className="space-y-1">
                  <Label>Notes</Label>
                  {task.notes && task.notes.trim() !== "" ? (
                    <p className="whitespace-pre-wrap text-muted-foreground text-sm">
                      {task.notes}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Tidak ada notes untuk task ini
                    </p>
                  )}
                </div>

                {/* FILES / DOCUMENTS SECTION */}
                {isAdmin && workspace_id > 0 && (
                  <>
                    <Separator />
                    <FilesSection
                      files={taskFiles}
                      onFileUpload={async () => { }}
                      onDownloadFile={handleDownloadFile}
                      onRemoveFile={() => { }}
                      readOnly={true}
                      workspaceId={workspace_id}
                      projectId={task.project_id}
                      taskId={task.id}
                    />
                  </>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* FOOTER SECTION */}
          <div className="border-t px-6 py-4 flex justify-end gap-2">
            {canEdit && onEdit && (
              <Button className="bg-sky-500 hover:bg-sky-600 text-white" onClick={onEdit}>
                Edit Task
              </Button>
            )}
            <Button className="bg-gray-500 hover:bg-gray-600 text-white" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

      </DialogContent>

      {/* Lightbox — switch images array based on type */}
      <ImageLightBoxModal
        images={lightboxType === "before" ? imageUrlsBefore : imageUrlsAfter}
        initialIndex={previewIndex}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        canDelete={false}
        allowDownload={false}
      />
    </Dialog>
  );
}