"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
    useEffect,
    useRef,
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
    useUploadTaskImagesBefore, 
    useUploadTaskImagesAfter,   
    useTaskImagesBefore,       
    useTaskImagesAfter,        
    useDeleteTaskImage
} from "@/hooks/task/useTaskImages";
import { normalizeTask } from "@/lib/utils/normalizeTask";
import {
    useTaskFiles,
    useUploadTaskFiles,
    useDeleteTaskFile,
    useDownloadTaskFile,
    useViewTaskFile,
} from "@/hooks/task/useTaskFiles";
import { useWorkspace } from "@/context/WorkspaceContext";

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
    const { selectedWorkspaceId: contextWorkspaceId } = useWorkspace();

    const [selectedProjectId, setSelectedProjectIdState] = useState<number | null>(null);
    const [selectedWorkspaceId, setSelectedWorkspaceIdState] = useState<number | null>(null);

    // Ref untuk tracking perubahan workspace dari context
    const lastContextWorkspaceId = useRef<number | null>(null);
    // Ref untuk tracking perubahan workspace lokal
    const lastLocalWorkspaceId = useRef<number | null>(null);

    const setSelectedProjectId = useCallback((id: number | null) => {
        setSelectedProjectIdState(id);
    }, []);

    const setSelectedWorkspaceId = useCallback((id: number | null) => {
        setSelectedWorkspaceIdState(id);
    }, []);

    useEffect(() => {
        if (contextWorkspaceId !== lastContextWorkspaceId.current) {
            console.log(`[TaskContext] Workspace changed from context: ${lastContextWorkspaceId.current} -> ${contextWorkspaceId}`);


            lastContextWorkspaceId.current = contextWorkspaceId;
            lastLocalWorkspaceId.current = contextWorkspaceId;

            setSelectedWorkspaceIdState(contextWorkspaceId);
            setSelectedProjectIdState(null);
        }
    }, [contextWorkspaceId]);

    useEffect(() => {

        if (selectedWorkspaceId !== lastLocalWorkspaceId.current) {
            console.log(`[TaskContext] Workspace changed locally: ${lastLocalWorkspaceId.current} -> ${selectedWorkspaceId}`);
            lastLocalWorkspaceId.current = selectedWorkspaceId;

            if (selectedWorkspaceId !== lastContextWorkspaceId.current) {
                lastContextWorkspaceId.current = selectedWorkspaceId;
            }
        }
    }, [selectedWorkspaceId]);

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
            setSelectedProjectIdState(null);
            setSelectedWorkspaceIdState(null);
            lastContextWorkspaceId.current = null;
            lastLocalWorkspaceId.current = null;
        }
    }, [isAuthenticated, isHydrated]);

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
    useTaskImagesBefore,          
    useTaskImagesAfter,           
    useUploadTaskImagesBefore,   
    useUploadTaskImagesAfter,  
    useDeleteTaskImage,
    useTaskFiles,
    useUploadTaskFiles,
    useDeleteTaskFile,
    useDownloadTaskFile,
    useViewTaskFile,
};