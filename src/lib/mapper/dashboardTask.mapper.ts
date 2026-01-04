import type { TaskApi, TaskMemberApi } from "@/types/api/task.api";

export function mapDashboardTask(task: any): TaskApi {

    const taskMembers: TaskMemberApi[] = (task.members || [])
        .filter((m: any) => m.user_id > 0)
        .map((m: any) => ({
            id: m.user_id,
            name: m.user_name || '',
            user_id: m.user_id,
            task_id: task.id,
            project_id: task.project_id,
            avatar: null,
            role: m.role_in_task || '',
            user_email: m.user_email || '',
            position: null,
            joinedAt: m.assigned_at || '',
        }));

    return {
        ...task,
        task_members: taskMembers,
        members: [],
        
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