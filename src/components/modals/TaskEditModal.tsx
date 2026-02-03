"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { Flag, Layout, Clock } from "lucide-react";
import { resolveImageUrl } from "@/lib/helpers/imageUrlHelper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { AssigneesSection } from "@/components/task/task-detail/AssigneesSection";
import { DateSection } from "@/components/task/task-detail/DateSection";
import { AttachmentsSection } from "@/components/task/task-detail/AttachmentsSection";
import { useProject } from "@/context/ProjectContext";
import { useAuthStore } from "@/store/useAuthStore";
import {
    useUpdateTask,
    useDeleteTask,
    useAddTaskMember,
    useRemoveTaskMember,
    useTaskImages,
    useUploadMultipleTaskImages,
    useDeleteTaskImage
} from "@/context/TaskContext";
import { useProjectMembers } from "@/hooks/project/useProjectMembers";
import type { TaskApi, TaskFileApi } from "@/types/api/task.api";
import type { ProjectMemberApi } from "@/types/api/project.api";
import type { TaskStatus } from "@/types/shared/status";
import type { TaskPriority } from "@/types/shared/priority";
import { cn } from "@/lib/utils/utils";
import { showErrorToast, showWarningToast, showConfirmToast } from "@/lib/helpers/toast-helpers";
import { statusConfig, priorityConfig } from "@/constants/task";
import { ImageLightBoxModal } from "./ImageLightBoxModal";
import { buildTaskPayload } from "@/lib/mapper/task.mapper";
import { useQueryClient } from "@tanstack/react-query";
import { taskKeys } from "@/lib/react-query/taskKeys";
import { FilesSection } from "../task/task-detail/FilesSection";
import { useDeleteTaskFile, useDownloadTaskFile, useTaskFiles, useUploadTaskFiles } from "@/hooks/task/useTaskFiles";

interface TaskEditModalProps {
    task: TaskApi;
    onClose: () => void;
    workspace_id: number;
    mode?: "admin" | "member";
    isAdmin?: boolean;
    isMember?: boolean;
}

export function TaskEditModal({ task, onClose, workspace_id }: TaskEditModalProps) {
    const { projects } = useProject();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    // Mutations
    const updateMutation = useUpdateTask();
    const deleteMutation = useDeleteTask();
    const addMemberMutation = useAddTaskMember();
    const removeMemberMutation = useRemoveTaskMember();
    const uploadImagesMutation = useUploadMultipleTaskImages();
    const deleteImageMutation = useDeleteTaskImage();

    const role = user?.role;

    const isAdmin = role === "admin";
    const isMember = role === "member";

    const canEditTask = isAdmin || isMember;
    const canEdit = isAdmin;
    const canDeleteTask = isAdmin;

    // Queries
    const { data: taskImages = [] } = useTaskImages(workspace_id, task.project_id, task.id);

    // Form state
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || "");
    const [notes, setNotes] = useState(task.notes || "");
    const [status, setStatus] = useState<TaskStatus>(task.status);
    const [priority, setPriority] = useState<TaskPriority>(task.priority);
    const [startDate, setStartDate] = useState<string | undefined>(task.start_date);
    const [dueDate, setDueDate] = useState<string | undefined>(task.due_date);
    const [dueTime, setDueTime] = useState(task.due_time || "");
    const [hasChanges, setHasChanges] = useState(false);
    // const [showActivity, setShowActivity] = useState(false);

    const { data: taskFiles = [] } = useTaskFiles(workspace_id, task.project_id, task.id);
    const uploadFilesMutation  = useUploadTaskFiles();
    const deleteFileMutation   = useDeleteTaskFile();
    const downloadFileMutation = useDownloadTaskFile();

    const [fileUploadProgress, setFileUploadProgress] = useState(0);

    const [localAssignedIds, setLocalAssignedIds] = useState<number[]>(
        task.task_members?.map(m => m.user_id) || []
    );

    useEffect(() => {
        setTitle(task.title);
        setDescription(task.description || "");
        setNotes(task.notes || "");
        setStatus(task.status);
        setPriority(task.priority);
        setStartDate(task.start_date);
        setDueDate(task.due_date);
        setDueTime(task.due_time || "");
        setHasChanges(false);
        setLocalAssignedIds(task.task_members?.map(m => m.user_id) || []);
    }, [task.id, task]);

    const [restrictDownload, setRestrictDownload] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const imageUrls = useMemo(
        () => taskImages.map(img => resolveImageUrl(img.url)).filter(Boolean),
        [taskImages]
    );


    const project = useMemo(
        () => projects.find(p => p.id === task.project_id),
        [projects, task.project_id]
    );

    const { members: projectMembers = [] } = useProjectMembers(task.project_id);

    const membersForSection = useMemo(() => {
        return projectMembers.map((pm: ProjectMemberApi) => ({
            id: pm.user_id ?? pm.id,
            name: pm.name,
            avatar: pm.profile_img || pm.avatar || "",
            role: pm.role || "member",
            division: "",
        }));
    }, [projectMembers]);

    // Gunakan localAssignedIds yang reactive
    const assignedMemberIds = localAssignedIds;

    const handleSave = async () => {
        if (!title.trim()) {
            showErrorToast("Nama task wajib diisi!", "Silakan masukkan nama task.");
            return;
        }

        if (title.trim().length < 3) {
            showErrorToast("Nama task terlalu pendek!", "Nama task minimal 3 karakter.");
            return;
        }

        if (localAssignedIds.length === 0) {
            showWarningToast("Task belum di-assign", "Task akan disimpan tanpa assignee.");
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
        }, 'update');

        try {
            const result = await updateMutation.mutateAsync({
                workspaceId: workspace_id,
                projectId: task.project_id,
                taskId: task.id,
                payload
            });

            setHasChanges(false);
            onClose();
        } catch (err) {
            console.error("Failed to update task:", err);
        }
    };

    const handleDelete = () => {
        showConfirmToast(
            `Hapus task "${task.title}"?`,
            "Task yang dihapus tidak dapat dikembalikan.",
            async () => {
                try {
                    await deleteMutation.mutateAsync({
                        workspaceId: workspace_id,
                        projectId: task.project_id,
                        taskId: task.id
                    });
                    onClose();
                } catch (err) {
                    console.error("Failed to delete task:", err);
                }
            }
        );
    };

    const toggleAssignee = useCallback(async (userId: number | undefined) => {
        if (!userId) return;

        const isCurrentlyAssigned = localAssignedIds.includes(userId);

        try {
            if (isCurrentlyAssigned) {

                await removeMemberMutation.mutateAsync({
                    workspaceId: workspace_id,
                    projectId: task.project_id,
                    taskId: task.id,
                    memberId: userId
                });

                setLocalAssignedIds(prev => prev.filter(id => id !== userId));
            } else {

                await addMemberMutation.mutateAsync({
                    workspaceId: workspace_id,
                    projectId: task.project_id,
                    taskId: task.id,
                    userId,
                    role: "member"
                });


                setLocalAssignedIds(prev => [...prev, userId]);
            }

            queryClient.invalidateQueries({
                queryKey: taskKeys.detail(workspace_id, task.project_id, task.id)
            });
            queryClient.invalidateQueries({
                queryKey: taskKeys.list(workspace_id, task.project_id)
            });

        } catch (err) {
            console.error("Failed to toggle assignee:", err);
            showErrorToast("Gagal update assignee", "Silakan coba lagi");
        }
    }, [localAssignedIds, workspace_id, task, addMemberMutation, removeMemberMutation, queryClient]);

    const handleDateChange = useCallback((date: Date | undefined, field: "startDate" | "dueDate") => {
        const formattedDate = date ? format(date, "yyyy-MM-dd") : undefined;
        if (field === "startDate") {
            setStartDate(formattedDate);
        } else {
            setDueDate(formattedDate);
        }
        setHasChanges(true);
    }, []);

    const handleImageUpload = useCallback(async (files: File[]) => {
        if (files.length === 0) return;

        try {
            await uploadImagesMutation.mutateAsync({
                workspaceId: workspace_id,
                projectId: task.project_id,
                taskId: task.id,
                files,
                options: {
                    onProgress: (progress) => setUploadProgress(progress)
                }
            });
            setUploadProgress(0);
        } catch (err) {
            console.error('Upload failed:', err);
            setUploadProgress(0);
        }
    }, [workspace_id, task.project_id, task.id, uploadImagesMutation]);

    const handlePreviewImage = useCallback((index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    }, []);

    const handleDownloadImage = useCallback((image: any) => {
        const imageUrlRaw = image.image_url || image.url;
        const imageUrl = resolveImageUrl(imageUrlRaw);
        const a = document.createElement("a");
        a.href = imageUrl;
        a.download = image.title || `image-${image.id}.jpg`;
        a.target = "_blank";
        a.click();
    }, []);

    const handleRemoveImage = useCallback(async (imageId: number) => {

        if (!workspace_id || workspace_id <= 0) {
            console.error("Invalid workspace_id in handleRemoveImage:", workspace_id);
            showErrorToast("Workspace ID tidak valid", "Silakan refresh halaman");
            return;
        }

        showConfirmToast(
            "Hapus gambar?",
            "Gambar yang dihapus tidak dapat dikembalikan.",
            async () => {
                try {
                    await deleteImageMutation.mutateAsync({
                        workspaceId: workspace_id,
                        projectId: task.project_id,
                        taskId: task.id,
                        imageId
                    });
                } catch (err: any) {
                    console.error("Failed to delete image:", {
                        error: err,
                        message: err?.message,
                        response: err?.response?.data
                    });

                }
            }
        );
    }, [workspace_id, task.project_id, task.id, deleteImageMutation]);

    const handleFileUpload = useCallback(async (files: File[]) => {
        if (files.length === 0) return;
        try {
            await uploadFilesMutation.mutateAsync({
                workspaceId: workspace_id,
                projectId: task.project_id,
                taskId: task.id,
                files,
                options: {
                    onProgress: (progress) => setFileUploadProgress(progress),
                },
            });
            setFileUploadProgress(0);
        } catch (err) {
            console.error("File upload failed:", err);
            setFileUploadProgress(0);
        }
    }, [workspace_id, task.project_id, task.id, uploadFilesMutation]);

    const handleDownloadFile = useCallback((file: TaskFileApi) => {
        downloadFileMutation.mutate({
            workspaceId: workspace_id,
            projectId: task.project_id,
            taskId: task.id,
            fileId: file.id,
            filename: file.filename,
        });
    }, [workspace_id, task.project_id, task.id, downloadFileMutation]);

    const handleRemoveFile = useCallback((fileId: number) => {
        showConfirmToast(
            "Hapus file?",
            "File yang dihapus tidak dapat dikembalikan.",
            async () => {
                try {
                    await deleteFileMutation.mutateAsync({
                        workspaceId: workspace_id,
                        projectId: task.project_id,
                        taskId: task.id,
                        fileId,
                    });
                } catch (err) {
                    console.error("Failed to delete file:", err);
                }
            }
        );
    }, [workspace_id, task.project_id, task.id, deleteFileMutation]);

    const handlePointerDownOutside = (e: Event) => {
        const target = e.target as HTMLElement;
        const isToastClick = target.closest('[data-sonner-toast]') !== null;
        const isToastContainer = target.closest('[data-sonner-toaster]') !== null;

        if (isToastClick || isToastContainer) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent
                className="p-0 gap-0 overflow-hidden sm:max-w-300"
                onPointerDownOutside={handlePointerDownOutside}
                aria-describedby={undefined}
            >
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <DialogTitle>Edit Task</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col h-[80vh] max-h-200">
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-6 space-y-6">
                            {/* TITLE SECTION */}
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <Input
                                        value={title}
                                        onChange={(e) => {
                                            setTitle(e.target.value);
                                            setHasChanges(true);
                                        }}
                                        className="text-xl font-semibold border-0 px-0 focus-visible:ring-0"
                                        placeholder="Task name"
                                        disabled={!canEdit}
                                    />
                                    {project && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <Layout className="w-4 h-4 text-foreground" />
                                            <p className="text-sm text-muted-foreground">in {project.name}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* STATUS AND PRIORITY */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <Select
                                    value={status}
                                    onValueChange={(value: string) => {
                                        setStatus(value as TaskStatus);
                                        setHasChanges(true);
                                    }}
                                    disabled={!canEditTask}
                                >
                                    <SelectTrigger className="w-40 h-8">
                                        <Badge variant="outline" className={statusConfig[status].className}>
                                            {statusConfig[status].label}
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
                                    value={priority}
                                    onValueChange={(value: string) => {
                                        setPriority(value as TaskPriority);
                                        setHasChanges(true);
                                    }}
                                    disabled={!canEdit}
                                >
                                    <SelectTrigger className="w-35 h-8">
                                        <div className="flex items-center gap-1.5">
                                            <Flag
                                                className="w-3.5 h-3.5"
                                                style={{ color: priorityConfig[priority].color }}
                                                fill={priorityConfig[priority].color}
                                            />
                                            <span className="text-sm">{priorityConfig[priority].label}</span>
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

                            {/* ASSIGNEE SECTION */}
                            <AssigneesSection
                                member={membersForSection}
                                assignedMemberIds={assignedMemberIds}
                                onToggleAssignee={toggleAssignee}
                                readOnly={!canEdit}
                            />

                            <Separator />

                            {/* START DATES SECTION */}
                            <DateSection
                                startDate={startDate}
                                dueDate={dueDate}
                                onDateChange={handleDateChange}
                                readOnly={!canEdit}
                            />

                            <Separator />

                            {/* DUE TIME SECTION*/}
                            {dueDate && (
                                <>
                                    <div className="space-y-2">
                                        <Label>Due Time (Optional)</Label>
                                        <div className="flex gap-2 items-center">
                                            <Input
                                                type="time"
                                                value={dueTime}
                                                onChange={(e) => {
                                                    setDueTime(e.target.value);
                                                    setHasChanges(true);
                                                }}
                                                className="w-40"
                                                placeholder="HH:MM"
                                                disabled={!canEdit}
                                            />

                                            <div className="flex gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setDueTime("09:00");
                                                        setHasChanges(true);
                                                    }}
                                                    disabled={!canEdit}
                                                >
                                                    9 AM
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setDueTime("17:00");
                                                        setHasChanges(true);
                                                    }}
                                                    disabled={!canEdit}
                                                >
                                                    5 PM
                                                </Button>
                                            </div>

                                            {dueTime && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setDueTime("");
                                                        setHasChanges(true);
                                                    }}
                                                    disabled={!canEdit}
                                                >
                                                    Clear
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Set specific deadline time. If empty, deadline is end of day (23:59).
                                        </p>
                                    </div>

                                    <Separator />
                                </>
                            )}

                            {/* DESCRIPTION SECTION */}
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => {
                                        setDescription(e.target.value);
                                        setHasChanges(true);
                                    }}
                                    className="min-h-30 resize-none"
                                    placeholder="Add a description..."
                                    disabled={!canEdit}
                                />
                            </div>

                            <Separator />

                            {/* NOTES SECTION */}
                            <div className="space-y-2">
                                <Label>Notes</Label>
                                <Textarea
                                    value={notes}
                                    onChange={(e) => {
                                        setNotes(e.target.value);
                                        setHasChanges(true);
                                    }}
                                    className="min-h-30 resize-none"
                                    placeholder="Add some notes..."
                                    disabled={!canEditTask}
                                />
                            </div>

                            <Separator />

                            {/* IMAGES SECTION */}
                            {workspace_id > 0 && (
                                <AttachmentsSection
                                    images={taskImages || []}
                                    restrictDownload={restrictDownload}
                                    onRestrictDownloadChange={setRestrictDownload}
                                    onFileUpload={handleImageUpload}
                                    onPreviewImage={handlePreviewImage}
                                    onDownloadImage={handleDownloadImage}
                                    onRemoveImage={handleRemoveImage}
                                    readOnly={false}
                                    isUploading={uploadImagesMutation.isPending}
                                    uploadProgress={uploadProgress}
                                />
                            )}

                            <Separator />

                            {/* FILES / DOCUMENTS SECTION */}
                            {workspace_id > 0 && (
                                <FilesSection
                                    files={taskFiles}
                                    onFileUpload={handleFileUpload}
                                    onDownloadFile={handleDownloadFile}
                                    onRemoveFile={handleRemoveFile}
                                    readOnly={!canEdit}
                                    isUploading={uploadFilesMutation.isPending}
                                    uploadProgress={fileUploadProgress}
                                    workspaceId={workspace_id}
                                    projectId={task.project_id}
                                    taskId={task.id}
                                />
                            )}
                        </div>
                    </div>

                    {/* FOOTER SECTION */}
                    <div className="border-t px-6 py-4">
                        <div className="flex justify-between items-center">
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={deleteMutation.isPending || !canDeleteTask}
                            >
                                {deleteMutation.isPending ? "Deleting..." : "Delete Task"}
                            </Button>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={onClose}>
                                    {hasChanges ? "Cancel" : "Close"}
                                </Button>
                                {hasChanges && (
                                    <Button
                                        onClick={handleSave}
                                        disabled={updateMutation.isPending}
                                    >
                                        {updateMutation.isPending ? "Saving..." : "Save Changes"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
            <ImageLightBoxModal
                images={imageUrls}
                initialIndex={lightboxIndex}
                open={lightboxOpen}
                onOpenChange={setLightboxOpen}
                canDelete={false}
            />
        </Dialog>
    );
}