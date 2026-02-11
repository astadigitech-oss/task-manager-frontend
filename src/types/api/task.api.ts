import { TaskStatus } from "../shared/status";
import { TaskPriority } from "../shared/priority";
import { ApiResponse } from "./user.api";
import { TaskSortOption } from "../shared/filter";

// ============ TASKS ============

export interface TaskRequest {
    title: string;
    description: string;
    status: TaskStatus | null;
    priority: TaskPriority | null;
    start_date?: string;
    due_date?: string;
    notes?: string;
    due_time?: string;
    finished_at?: string | null;
}


export interface TaskMemberInList {
    profile_image: string | null;
    user_profile_image: string | null;
    avatar: string | null;
    user_id: number;
    user_name: string;
    user_email: string;
    role_in_task: string;
    assigned_at: string;
}

export interface TaskImageInList {
    id: number;
    url: string;
}

export interface TaskApi {
    workspace_id: number;
    id: number;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    project_id: number;
    members: TaskMemberInList[];
    member_count: number;
    images: TaskImageInList[] | null;
    start_date?: string;
    due_date?: string;
    due_time?: string | null;
    finished_at?: string;
    is_overdue?: boolean;
    notes?: string;
    created_at: string;
    updated_at: string;
    overdue_duration?: number | null;
    order_index: number;
    task_members?: TaskMemberApi[];
}

export interface TaskMemberApi {
    id: number;
    name: string;
    user_id: number;
    task_id: number;
    project_id: number;
    avatar?: string | null;
    profile_image?: string | null;
    user_profile_image: string | null;
    profile_img?: string | null;
    role_in_task: string;
    user_email: string;
    position: string | null;
    joinedAt: string;
}

export interface TaskImageApi {
    title: string;
    id: number;
    project_id: number;
    uploaded_by: number;
    url: string;
    created_at: string;
    fullUrl?: string;
}

export interface TaskFileUploaderApi {
    id: number;
    name: string;
    email: string;
    role: string;
    profile_image: string | null;
    position: string | null;
    is_online: boolean;
}

export interface TaskFileApi {
    id: number;
    task_id: number;
    filename: string;
    url: string;
    mime_type: string;
    file_size: number;
    uploaded_by: number;
    created_at: string;
    updated_at: string;
    user: TaskFileUploaderApi;
}

export interface TaskSortConfig {
    value: TaskSortOption;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
}

export type TaskMemberListResponse = ApiResponse<TaskMemberApi[]>;
export type TaskResponse = ApiResponse<TaskApi>;
export type TaskListResponse = ApiResponse<TaskApi[]>;
export type TaskDetailResponse = ApiResponse<TaskApi>;
export type TaskImageResponse = ApiResponse<TaskImageApi>;
export type TaskImageListResponse = ApiResponse<TaskImageApi[]>;
export type TaskFileListResponse = ApiResponse<TaskFileApi[]>;
export type TaskFileResponse = ApiResponse<TaskFileApi>;

// Type guard to check if task has deadline
export function hasDeadline(task: TaskApi): task is TaskApi & { due_date: string } {
    return !!task.due_date;
}

// Type guard to check if task is completed
export function isCompleted(task: TaskApi): task is TaskApi & { finished_at: string } {
    return task.status === "done" && !!task.finished_at;
}

export function isImageFile(file: TaskFileApi): boolean {
    return file.mime_type.startsWith("image/");
}

export function isPdfFile(file: TaskFileApi): boolean {
    return file.mime_type === "application/pdf";
}

export function isOfficeFile(file: TaskFileApi): boolean {
    const officeMimes = [
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    return officeMimes.includes(file.mime_type);
}

/** Format file size ke human-readable string (KB / MB) */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Ambil extension dari filename */
export function getFileExtension(filename: string): string {
    return filename.split(".").pop()?.toLowerCase() ?? "";
}