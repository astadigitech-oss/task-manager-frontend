import { useTask } from "@/context/TaskContext";
import { TaskStatus } from "@/types/shared/status";
import { useMemo } from "react";

export function useProjectProgress(workspaceId?: number, projectId?: number) {
    const { tasks } = useTask();

    const stats = useMemo(() => {
        const total = tasks.length;
        if (total === 0) {
            return { progress: 0, done: 0, total: 0 };
        }

        const done = tasks.filter(
            (t) => t.status === "done"
        ).length;

        const progress = Math.round((done / total) * 100);

        return { progress, done, total };
    }, [tasks]);

    return {
        progress: stats.progress,
        progressDetails: stats,
    };
}
