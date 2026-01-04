import { ProjectApi } from "@/types/api/project.api";

export function mapProject(data: any): ProjectApi {
    return {
        id: data.id,
        name: data.name,
        description: data.description || null,
        workspace_id: data.workspace_id,
        progress: data.progress || 0,
        task_count: data.task_count || 0,
        member_count: data.member_count || 0,
        members: data.members || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        createdBy: data.created_by,
    };
}