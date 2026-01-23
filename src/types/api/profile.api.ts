import { Role } from "../shared/role";

export interface ProfileApiResponse {
    profile_img: string | null;
    id: number;
    name: string;
    email: string;
    role: Role;
    profile_image: string | null;
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