import { useTask } from "@/context/TaskContext";
import { TaskStatus } from "@/types/shared/status";
import { useMemo } from "react";

export interface ProgressBreakdown {
    done: number;
    on_progress: number;
    on_board: number;
    pending: number;
    canceled: number;
}

const STATUSES: TaskStatus[] = ["done", "on_progress", "on_board", "pending", "canceled"];

export function useProjectProgress(workspaceId?: number, projectId?: number) {
    const { tasks } = useTask();

    const stats = useMemo(() => {
        const total = tasks.length;

        if (total === 0) {
            return {
                progress: 0,
                done: 0,
                total: 0,
                breakdown: {
                    done: 0,
                    on_progress: 0,
                    on_board: 0,
                    pending: 0,
                    canceled: 0,
                } satisfies ProgressBreakdown,
            };
        }

        const countByStatus = Object.fromEntries(
            STATUSES.map((status) => [
                status,
                tasks.filter((t) => t.status === status).length,
            ])
        ) as Record<TaskStatus, number>;

        const breakdown: ProgressBreakdown = {
            done: Math.round((countByStatus.done / total) * 100),
            on_progress: Math.round((countByStatus.on_progress / total) * 100),
            on_board: Math.round((countByStatus.on_board / total) * 100),
            pending: Math.round((countByStatus.pending / total) * 100),
            canceled: Math.round((countByStatus.canceled / total) * 100),
        };

        return {
            progress: breakdown.done,
            done: countByStatus.done,
            total,
            breakdown,
        };
    }, [tasks]);

    return {
        progress: stats.progress,
        progressDetails: stats,
        breakdown: stats.breakdown,
    };
}