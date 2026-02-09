import { TaskApi, } from "@/types/api/task.api";
import { PRIORITY_WEIGHT } from "@/constants/task";
import { TaskSortOption } from "@/types/shared/filter";

export function sortTasks(
    tasks: TaskApi[],
    sortOption: TaskSortOption
): TaskApi[] {
    const sorted = [...tasks];

    switch (sortOption) {
        case 'manual':
            return sorted.sort((a, b) => {
                const orderA = a.order_index ?? a.id;
                const orderB = b.order_index ?? b.id;
                return orderA - orderB;
            });

        case 'priority-high-low':
            return sorted.sort((a, b) => {
                const weightA = PRIORITY_WEIGHT[a.priority] || 0;
                const weightB = PRIORITY_WEIGHT[b.priority] || 0;
                return weightB - weightA;
            });

        case 'priority-low-high':
            return sorted.sort((a, b) => {
                const weightA = PRIORITY_WEIGHT[a.priority] || 0;
                const weightB = PRIORITY_WEIGHT[b.priority] || 0;
                return weightA - weightB;
            });

        case 'due-date-asc':
            return sorted.sort((a, b) => {
                if (!a.due_date && !b.due_date) return 0;
                if (!a.due_date) return 1;
                if (!b.due_date) return -1;
                return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
            });

        case 'due-date-desc':
            return sorted.sort((a, b) => {
                if (!a.due_date && !b.due_date) return 0;
                if (!a.due_date) return 1;
                if (!b.due_date) return -1;
                return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
            });

        case 'created-asc':
            return sorted.sort((a, b) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );

        case 'created-desc':
            return sorted.sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

        case 'title-asc':
            return sorted.sort((a, b) =>
                a.title.localeCompare(b.title, 'id', { sensitivity: 'base' })
            );

        case 'title-desc':
            return sorted.sort((a, b) =>
                b.title.localeCompare(a.title, 'id', { sensitivity: 'base' })
            );

        default:
            return sorted;
    }
}