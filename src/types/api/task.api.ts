import { TaskStatus } from "../shared/status";
import { TaskPriority } from "../shared/priority";
import { ApiResponse } from "./user.api";

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

export type TaskMemberListResponse = ApiResponse<TaskMemberApi[]>;
export type TaskResponse = ApiResponse<TaskApi>;
export type TaskListResponse = ApiResponse<TaskApi[]>;
export type TaskDetailResponse = ApiResponse<TaskApi>;
export type TaskImageResponse = ApiResponse<TaskImageApi>;
export type TaskImageListResponse = ApiResponse<TaskImageApi[]>;

// Type guard to check if task has deadline
export function hasDeadline(task: TaskApi): task is TaskApi & { due_date: string } {
    return !!task.due_date;
}

// Type guard to check if task is completed
export function isCompleted(task: TaskApi): task is TaskApi & { finished_at: string } {
    return task.status === "done" && !!task.finished_at;
}