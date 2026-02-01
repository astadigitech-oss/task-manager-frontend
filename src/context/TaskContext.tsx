"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
    useEffect,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { TaskApi } from "@/types/api/task.api";
import { taskKeys } from "@/lib/react-query/taskKeys";

import {
    useTasks,
    useCreateTask,
    useUpdateTask,
    useDeleteTask
} from "@/hooks/task/useTask";
import {
    useTaskMembers,
    useAddTaskMember,
    useRemoveTaskMember
} from "@/hooks/task/useTaskMember";
import {
    useTaskImages,
    useUploadTaskImage,
    useUploadMultipleTaskImages,
    useDeleteTaskImage
} from "@/hooks/task/useTaskImages";

interface TaskContextType {
    selectedProjectId: number | null;
    selectedWorkspaceId: number | null;
    setSelectedProjectId: (id: number | null) => void;
    setSelectedWorkspaceId: (id: number | null) => void;

    tasks: TaskApi[];
    isLoading: boolean;
    refetchTasks: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

function recalculateOverdueStatus(task: TaskApi): TaskApi {

    if (task.status === "done" || task.status === "canceled") {
        return {
            ...task,
            overdue_duration: 0,
            is_overdue: false
        };
    }

    // Tidak ada due_date
    if (!task.due_date) {
        return {
            ...task,
            overdue_duration: 0,
            is_overdue: false
        };
    }

    try {
        const now = new Date();
        
        let dueDate: Date;
        
        if (task.due_date.includes('T') || task.due_date.includes(' ')) {

            dueDate = new Date(task.due_date.replace(' ', 'T'));
        } else {

            const [year, month, day] = task.due_date.split('-').map(Number);
            dueDate = new Date(year, month - 1, day);
            
            if (!task.due_time) {
                dueDate.setHours(23, 59, 59, 999);
            }
        }
        
        // Override dengan due_time jika ada
        if (task.due_time) {
            const [hours, minutes] = task.due_time.split(':').map(Number);
            dueDate.setHours(hours, minutes, 0, 0);
        }

        const diffMs = now.getTime() - dueDate.getTime();

        if (diffMs > 0) {
            const overdueMins = Math.floor(diffMs / (1000 * 60));
            return {
                ...task,
                overdue_duration: overdueMins,
                is_overdue: true
            };
        }

        return {
            ...task,
            overdue_duration: 0,
            is_overdue: false
        };
    } catch (error) {
        console.error('Error recalculating overdue for task:', task.id, error);
        return {
            ...task,
            overdue_duration: 0,
            is_overdue: false
        };
    }
}

export function TaskProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, isHydrated } = useAuthStore();
    const queryClient = useQueryClient();

    const [selectedProjectId, setSelectedProjectIdState] = useState<number | null>(null);
    const [selectedWorkspaceId, setSelectedWorkspaceIdState] = useState<number | null>(null);

    const setSelectedProjectId = useCallback((id: number | null) => {
        setSelectedProjectIdState(id);
    }, []);

    const setSelectedWorkspaceId = useCallback((id: number | null) => {
        setSelectedWorkspaceIdState(id);
    }, []);

    const { data = [], isLoading, refetch } = useTasks(
        selectedWorkspaceId,
        selectedProjectId
    );

    const tasks = data;

    const refetchTasks = useCallback(() => {
        refetch();
    }, [refetch]);

    useEffect(() => {
        if (!isHydrated) return;

        if (!isAuthenticated) {
            setSelectedProjectId(null);
            setSelectedWorkspaceId(null);
        }
    }, [isAuthenticated, isHydrated, setSelectedProjectId, setSelectedWorkspaceId]);

    useEffect(() => {
        if (!selectedWorkspaceId || !selectedProjectId) return;

        const interval = setInterval(() => {
            queryClient.setQueryData<TaskApi[]>(
                taskKeys.list(selectedWorkspaceId, selectedProjectId),
                (oldTasks) => {
                    if (!oldTasks) return oldTasks;
                    
                    return oldTasks.map(recalculateOverdueStatus);
                }
            );
        }, 60000); // Update setiap 1 menit

        return () => clearInterval(interval);
    }, [selectedWorkspaceId, selectedProjectId, queryClient]);

    return (
        <TaskContext.Provider
            value={{
                selectedProjectId,
                selectedWorkspaceId,
                setSelectedProjectId,
                setSelectedWorkspaceId,
                tasks,
                isLoading,
                refetchTasks,
            }}
        >
            {children}
        </TaskContext.Provider>
    );
}

export function useTask() {
    const ctx = useContext(TaskContext);
    if (!ctx) throw new Error("useTask must be used within TaskProvider");
    return ctx;
}

export {
    useTasks,
    useCreateTask,
    useUpdateTask,
    useDeleteTask,
    useTaskMembers,
    useAddTaskMember,
    useRemoveTaskMember,
    useTaskImages,
    useUploadTaskImage,
    useUploadMultipleTaskImages,
    useDeleteTaskImage,
};