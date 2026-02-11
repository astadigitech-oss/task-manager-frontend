import { ApiResponse, UserApi } from "./user.api";

// ============ WORKSPACE ============
export interface WorkspaceRequest {
    name: string;
    color?: string;
}

export interface WorkspaceApi {
    id: number;
    name: string;
    color: string;
    project_id: number[];
    createdAt: string;
    updatedAt: string;
    createdBy: string;
}

export interface WorkspaceMemberApi {
    position: string | null;
    id: number;
    name: string;
    user_id: number;
    project_id: number;
    avatar?: string | null;
    profile_img?: string | null;
    role: string;
    user_email: string;
    joinedAt: string;
    user: UserApi;
}

export type WorkspaceMemberListResponse = {
    success: boolean;
    code: number;
    message: string;
    data: WorkspaceMemberApi[];
};

// ============ ATTENDANCE ============
export interface AttendanceRequest {
    activity: string;
    obstacle: string;
    workspace_id: number;
}

export interface AttendanceUserApi {
    id: number;
    name: string;
    email: string;
}

export interface AttendanceWorkspaceApi {
    id: number;
    name: string;
}

export interface AttendanceApi {
    id: number;
    activity: string;
    obstacle: string;
    clock_in: string;
    created_at: string;
    user: AttendanceUserApi;
    workspace: AttendanceWorkspaceApi;
}

export interface AttendanceImageApi {
    id: number;
    url: string;
    title?: string;
    created_at?: string;
}

export type AttendanceResponse = ApiResponse<AttendanceApi>;
export type AttendanceListResponse = ApiResponse<AttendanceApi[]>;

export type WorkspaceResponse = ApiResponse<WorkspaceMemberApi>;
export type WorkspaceListResponse = ApiResponse<WorkspaceApi[]>;