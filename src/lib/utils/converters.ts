import { ProfileApiResponse } from "@/types/api/profile.api";
import { UserProfile, UserApi } from "@/types/api/user.api";
import { Role } from "@/types/shared/role";

/**
 * Simpan path
 */
function normalizeProfileImage(path?: string | null): string | null {
  if (!path) return null;
  
  if (!path.includes('/') && !path.startsWith('http') && !path.startsWith('blob:')) {
    console.warn(`Invalid profile image path: ${path}`);
    return null;
  }
  
  return path;
}

export function apiProfileToUserProfile(api: ProfileApiResponse): UserProfile {
  const normalizedAvatar = normalizeProfileImage(api.profile_image || api.profile_img || api.user_profile_image);

  return {
    id: Number(api.id),
    name: api.name,
    email: api.email,
    role: api.role,
    avatar: normalizedAvatar,
    position: api.position ?? null,
    is_online: Boolean(api.is_online),
    last_seen: api.last_seen ?? null,
    created_at: api.CreatedAt ?? "",
    updated_at: api.UpdatedAt ?? "",
    projectsCount: Number(api.projects ?? 0),
    tasksCompleted: Number(api.tasks ?? 0),
  };
}

export function apiUserToUserApi(apiUser: any): UserApi {
  const normalizedAvatar = normalizeProfileImage(apiUser.profile_image);

  return {
    id: Number(apiUser.id),
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.role as Role,
    avatar: normalizedAvatar,
    is_online: apiUser.is_online ?? false,
    last_seen: apiUser.last_seen ?? null,
    created_at: apiUser.created_at,
    updated_at: apiUser.updated_at,
  };
}