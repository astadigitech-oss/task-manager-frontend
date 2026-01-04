import type { TaskApi } from "@/types/api/task.api";

export function normalizeTask(task: any): TaskApi {
    return {
        ...task,

        task_members: task.task_members ?? task.members ?? [],

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
