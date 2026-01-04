import { TaskApi } from "@/types/api/task.api";

export function selectUpcomingReminders(
    tasks: TaskApi[],
    userId?: number
): TaskApi[] {
    if (!userId) return [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    return tasks.filter((task) => {

        if (!task.due_date) return false;

        if (task.status === "done" || task.status === "canceled") return false;

        const members = task.task_members || task.members || [];
        const isAssigned = members.some((m) => m.user_id === userId);
        if (!isAssigned) return false;

        const dueDate = new Date(task.due_date);
        const dueDateOnly = new Date(
            dueDate.getFullYear(),
            dueDate.getMonth(),
            dueDate.getDate()
        );

        return dueDateOnly >= today && dueDateOnly <= sevenDaysFromNow;
    });
}

export function selectOverdueReminders(
    tasks: TaskApi[],
    userId?: number
): TaskApi[] {
    if (!userId) return [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return tasks.filter((task) => {

        if (!task.due_date) return false;

        if (task.status === "done" || task.status === "canceled") return false;

        const members = task.task_members || task.members || [];
        const isAssigned = members.some((m) => m.user_id === userId);
        if (!isAssigned) return false;

        const dueDate = new Date(task.due_date);
        const dueDateOnly = new Date(
            dueDate.getFullYear(),
            dueDate.getMonth(),
            dueDate.getDate()
        );

        return dueDateOnly < today;
    });
}