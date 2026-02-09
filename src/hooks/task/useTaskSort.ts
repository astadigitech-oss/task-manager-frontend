import { useState, useMemo, useCallback, useEffect } from "react";
import { TaskApi } from "@/types/api/task.api";
import { TaskSortOption } from "@/types/shared/filter";
import { sortTasks } from "@/lib/utils/taskSorting";

export function useTaskSort(
    tasks: TaskApi[],
    initialSort: TaskSortOption = 'manual',
    storageKey: string = 'task-sort-preference'
) {
    const [sortOption, setSortOption] = useState<TaskSortOption>(initialSort);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved && saved !== sortOption) {
                setSortOption(saved as TaskSortOption);
            }
        } catch (err) {
            console.warn('Failed to load sort preference:', err);
        }
    }, [storageKey]);

    const sortedTasks = useMemo(() => {
        return sortTasks(tasks, sortOption);
    }, [tasks, sortOption]);

    const handleSortChange = useCallback((newSort: TaskSortOption) => {
        setSortOption(newSort);

        // Save to localStorage
        try {
            localStorage.setItem(storageKey, newSort);
        } catch (err) {
            console.warn('Failed to save sort preference:', err);
        }
    }, [storageKey]);

    return {
        sortOption,
        sortedTasks,
        setSortOption: handleSortChange,
    };
}