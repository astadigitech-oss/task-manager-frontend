import type { TaskApi, TaskMemberApi } from "@/types/api/task.api";
import { TaskStatus } from "@/types/shared/status";
import { TaskPriority } from "@/types/shared/priority";

export function mapDashboardTask(task: any): TaskApi {

    const taskMembers: TaskMemberApi[] = (task.members || [])
        .filter((m: any) => m.user_id > 0)
        .map((m: any) => ({
            id: m.user_id,
            name: m.user_name || '',
            user_id: m.user_id,
            task_id: task.id,
            project_id: task.project_id,
            user_profile_image: m.user_profile_image || m.profile_img || m.profile_image || null,
            avatar: m.user_profile_image || m.profile_img || m.profile_image || null,
            profile_img: m.profile_img || null,
            profile_image: m.profile_image || null,
            role_in_task: m.role_in_task || '',
            user_email: m.user_email || '',
            position: null,
            joinedAt: m.assigned_at || '',
        }));

    // Normalize status: convert underscores to dashes
    const normalizeStatus = (status: string): TaskStatus => {
        if (!status) return "on_board";
        const normalized = status.replace(/_/g, '-');
        return normalized as TaskStatus;
    };

    // Normalize priority: convert underscores to dashes
    const normalizePriority = (priority: string): TaskPriority => {
        if (!priority) return "normal";
        const normalized = priority.replace(/_/g, '-');
        return normalized as TaskPriority;
    };

    return {
        ...task,
        task_members: taskMembers,
        members: [],
        status: task.status as TaskStatus,
        priority: normalizePriority(task.priority),

        due_date:
            task.due_date && !task.due_date.startsWith("0001")
                ? task.due_date
                : undefined,

        start_date:
            task.start_date && !task.start_date.startsWith("0001")
                ? task.start_date
                : undefined,
    };
}