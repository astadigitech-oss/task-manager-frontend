// profile.api.ts
import { Role } from "../shared/role";

export interface ProfileApiData {
    avatar: string | null;
    email: string;
    name: string;
    position: string | null;
}

export interface ProfileGetResponse {
    success: boolean;
    code: number;
    message: string;
    data: ProfileApiData;
}

export interface ProfileApiResponse {
    id: number;
    name: string;
    email: string;
    role: Role;
    profile_image: string | null;
    profile_img: string | null;
    user_profile_image: string | null;
    position: string | null;
    is_online: boolean;
    last_seen: string | null;
    workspaces: number | null;
    projects: number | null;
    tasks: number | null;
    CreatedAt: string;
    UpdatedAt: string;
    deleted_at: string | null;
}