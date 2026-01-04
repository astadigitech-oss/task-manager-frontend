// lib/utils/projectProgress.ts
import { TaskApi } from "@/types/api/task.api";
import { TaskStatus } from "@/types/shared/status";

interface TaskProgressResult {
    progress: number;
    total: number;
    done: number;
    active: number;
    canceled: number;
}

export function calculateProjectProgress(tasks: TaskApi[]): number {
    if (!tasks || tasks.length === 0) return 0;

    const activeTasks = tasks.filter(t => t.status !== "canceled");

    if (activeTasks.length === 0) return 0;

    const doneCount = activeTasks.filter(t => t.status === "done").length;

    return Math.round((doneCount / activeTasks.length) * 100);
}

export function calculateTaskProgress(
    tasks: TaskApi[],
    doneStatus: TaskStatus = "done"
): TaskProgressResult {
    if (!tasks || tasks.length === 0) {
        return {
            progress: 0,
            total: 0,
            done: 0,
            active: 0,
            canceled: 0,
        };
    }

    const canceledTasks = tasks.filter(t => t.status === "canceled");
    const activeTasks = tasks.filter(t => t.status !== "canceled");
    const doneTasks = activeTasks.filter(t => t.status === doneStatus);

    const progress =
        activeTasks.length === 0
            ? 0
            : Math.round((doneTasks.length / activeTasks.length) * 100);

    return {
        progress,
        total: tasks.length,
        active: activeTasks.length,
        done: doneTasks.length,
        canceled: canceledTasks.length,
    };
}


export function calculateProjectsProgress(
    tasksByProject: Map<number, TaskApi[]>
): Map<number, number> {
    const progressMap = new Map<number, number>();

    tasksByProject.forEach((tasks, projectId) => {
        progressMap.set(projectId, calculateProjectProgress(tasks));
    });

    return progressMap;
}