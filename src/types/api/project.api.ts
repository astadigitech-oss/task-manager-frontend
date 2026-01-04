import { ApiResponse, UserApi } from "./user.api";

// ============ PROJECTS ============

export interface ProjectRequest {
    name: string;
    description?: string | null;
    workspace_id: number;
}

// Member yang ada di dalam response project list
export interface ProjectMemberInList {
    id: number;
    name: string;
    profile_image: string | null;
}

export interface ProjectApi {
    id: number;
    name: string;
    description: string | null;
    workspace_id: number;
    progress: number;
    task_count: number;
    member_count: number;
    members: ProjectMemberInList[];
    createdAt?: string;
    updatedAt?: string;
    createdBy?: number;
}

export interface ProjectMemberApi {
    profile_img: string | null | undefined;
    id: number;
    name: string;
    user_id: number;
    project_id: number;
    avatar?: string | null;
    profile_image?: string | null;
    role: string;
    user_email: string;
    position: string | null;
    joinedAt: string;
    user: UserApi;
}

export type ProjectMemberListResponse = ApiResponse<ProjectMemberApi[]>;
export type ProjectResponse = ApiResponse<ProjectApi>;
export type ProjectListResponse = ApiResponse<ProjectApi[]>;
export type ProjectDetailResponse = ApiResponse<ProjectApi>;

// ============ PROJECT IMAGES ============

export interface ProjectImageApi {
    id: number;
    project_id: number;
    uploaded_by: number;
    url: string;
    created_at: string;
    fullUrl?: string;
}

export type ProjectImageResponse = ApiResponse<ProjectImageApi>;
export type ProjectImageListResponse = ApiResponse<ProjectImageApi[]>;