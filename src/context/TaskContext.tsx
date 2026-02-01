"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
    useEffect,
} from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { TaskApi } from "@/types/api/task.api";

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
import { normalizeTask } from "@/lib/utils/normalizeTask";

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


export function TaskProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, isHydrated } = useAuthStore();

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

    const tasks = data.map(normalizeTask);

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