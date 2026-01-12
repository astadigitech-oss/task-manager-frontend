"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import type { TaskApi } from "@/types/api/task.api";
import { statusConfig, priorityConfig } from "@/constants/task";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AssigneesSection } from "@/components/task/task-detail/AssigneesSection";
import { projectMembersService } from "@/services/projects/projectMember.service";
import { ImageLightBoxModal } from "./ImageLightBoxModal";
import { 
  formatDeadline, 
  isTaskOverdue, 
  isCompletedLate,
  getTaskDeadlineStatus 
} from "@/lib/mapper/task.mapper";

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

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const project = useMemo(
    () => projects.find(p => p.id === task.project_id),
    [projects, task.project_id]
  );

  function useProjectMembers(projectId: number) {
    return useQuery({
      queryKey: ['project-members', projectId],
      queryFn: () => projectMembersService.getAll(projectId).then(r => r.data ?? []),
      enabled: !!projectId,
      staleTime: 2 * 60 * 1000,
    });
  }
  const { data: projectMembers = [] } = useProjectMembers(task.project_id);

  const taskMembers = task.task_members || [];

  const canEdit = useMemo(() => {
    return (
      user?.role === "admin" ||
      taskMembers.some((m) => m.user_id === Number(user?.id))
    );
  }, [user, taskMembers]);

  const membersForSection = useMemo(() => {
    return projectMembers.map((pm) => ({
      id: pm.user_id ?? pm.id,
      name: pm.name,
      avatar: pm.avatar || "",
      role: pm.role || "member",
      division: "",
    }));
  }, [projectMembers]);

  const assignedMemberIds = useMemo(() => {
    return taskMembers.map((m) => m.user_id);
  }, [taskMembers]);

  const deadlineStatus = useMemo(() => {
    const status = getTaskDeadlineStatus(task);
    
    return status;
  }, [task]);

  const handlePointerDownOutside = (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-sonner-toast]")) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const imageUrls = useMemo(
    () =>
      taskImages
        .map((img) => resolveImageUrl(img.url))
        .filter((url): url is string => Boolean(url)),
    [taskImages]
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="p-0 gap-0 overflow-hidden sm:max-w-300"
        onPointerDownOutside={handlePointerDownOutside}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Task Details
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-[80vh] max-h-200">
          <div className="flex-1 overflow-y-auto">
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
                        ? 'bg-green-100 text-green-800 border-green-300 gap-1'
                        : deadlineStatus.status === 'completed-late'
                        ? 'bg-orange-100 text-orange-800 border-orange-300 gap-1'
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

                          {isTaskOverdue(task) && (
                            <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Overdue</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {task.status === "done" && task.finished_at && (
                    <div className={`mt-3 p-3 rounded-lg border ${
                      isCompletedLate(task) 
                        ? 'bg-orange-50 border-orange-200' 
                        : 'bg-green-50 border-green-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-xs">Completed At</Label>
                          <p className="text-sm font-medium mt-0.5">
                            {format(new Date(task.finished_at), "PPP 'at' p")}
                          </p>
                        </div>
                        {isCompletedLate(task) ? (
                          <Badge variant="outline" className="gap-1 bg-orange-100 text-orange-800 border-orange-300">
                            <AlertTriangle className="w-3 h-3" />
                            Completed Late
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 bg-green-100 text-green-800 border-green-300">
                            <CheckCircle2 className="w-3 h-3" />
                            On Time
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
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

              {/* ATTACHMENTS SECTION */}
              {taskImages?.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <Label className="mb-3 block">Images ({taskImages.length})</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {taskImages.map((img, index) => {
                        const imageUrl = resolveImageUrl(img.url);
                        if (!imageUrl) return null;

                        return (
                          <div
                            key={img.id}
                            className="relative rounded-lg border overflow-hidden aspect-video bg-muted group cursor-pointer"
                          >
                            <img
                              src={imageUrl}
                              alt={img.title || "Task image"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                            <div
                              className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                setPreviewIndex(index);
                                setPreviewOpen(true);
                              }}
                            >
                              <div className="w-10 h-10 rounded-full bg-card/90 flex items-center justify-center">
                                <Maximize2 className="w-5 h-5" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* FOOTER SECTION */}
          <div className="border-t px-6 py-4 flex justify-end gap-2">
            {canEdit && onEdit && (
              <Button onClick={onEdit}>
                Edit Task
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
      <ImageLightBoxModal
        images={imageUrls}
        initialIndex={previewIndex}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        canDelete={false}
        allowDownload={false}
      />
    </Dialog>
  );
}