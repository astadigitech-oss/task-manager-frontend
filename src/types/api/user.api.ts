import { Role } from "../shared/role";

// Generic response wrapper
export interface ApiResponse<T> {
    body?: any;
    statusCode?: number;
    success: boolean;
    code: number;
    message: string;
    data: T;
}

// ============ AUTH ============
export interface LoginRequest {
    email: string;
    password: string;
    role: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

// Base User dari API
export interface UserApi {
    id: number;
    name: string;
    email: string;
    role: Role;
    avatar: string | null;
    // profile_img: string | null;
    is_online: boolean;
    last_seen: string | null;
    created_at: string;
    updated_at: string;
}

export interface UserProfile extends UserApi {
    position?: string | null;
    projectsCount?: number;
    tasksCompleted?: number;
    last_active_workspace_id: number | null;
    telegram_chat_id?: string | null;
}

// Auth response (biasanya return UserProfile dengan token)
export interface AuthResponse {
    code: number;
    success: boolean;
    message: string;
    data: {
        user: UserProfile;
        token: string;
    };
}

// Pagination metadata
export interface PaginationMeta {
    has_next: boolean;
    has_prev: boolean;
    limit: number;
    page: number;
    total: number;
    total_pages: number;
}

// User list response 
export interface UserListResponse {
    success: boolean;
    code: number;
    message: string;
    data: {
        pagination: PaginationMeta;
        users: UserApi[];
    };
}

// Single user response
export interface UserResponse {
    success: boolean;
    code: number;
    message: string;
    data: UserProfile;
}

export type UserWsEvent =
    | {
        type: "USER_ONLINE";
        user: UserApi;
    }
    | {
        type: "USER_OFFLINE";
        user_id: number;
        last_seen?: string;
    };