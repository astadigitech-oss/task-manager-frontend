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

export type WorkspaceResponse = ApiResponse<WorkspaceMemberApi>;
export type WorkspaceListResponse = ApiResponse<WorkspaceApi[]>;