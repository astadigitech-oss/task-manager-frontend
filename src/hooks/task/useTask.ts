import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksService } from "@/services/task/task.service";
import { taskKeys, invalidateTaskQueries } from "@/lib/react-query/taskKeys";
import { mapTask } from "@/lib/mapper/task.mapper";
import { showSuccessToast, showErrorToast } from "@/lib/helpers/toast-helpers";
import { TaskApi, TaskRequest } from "@/types/api/task.api";
import { ApiError } from "@/lib/api/interceptors";


function calculateOptimisticOverdue(task: TaskApi): number {

    if (!task.due_date) return 0;

    const now = new Date();
    const [year, month, day] = task.due_date.split('-').map(Number);
    const dueDate = new Date(year, month - 1, day);

    if (task.due_time) {
        const [hours, minutes] = task.due_time.split(':').map(Number);
        dueDate.setHours(hours, minutes, 0, 0);
    } else {
        dueDate.setHours(23, 59, 59, 999);
    }

    const diffMs = now.getTime() - dueDate.getTime();

    if (diffMs <= 0) return 0;

    return Math.floor(diffMs / (1000 * 60));
}

/**
 * =========================
 * FETCH TASK LIST
 * =========================
 */
export function useTasks(
    workspaceId: number | null,
    projectId: number | null
) {
    return useQuery<TaskApi[]>({
        queryKey: taskKeys.list(workspaceId ?? 0, projectId ?? 0),
        enabled: Boolean(workspaceId && projectId),

        queryFn: async (): Promise<TaskApi[]> => {
            if (!workspaceId || !projectId) {
                return [];
            }

            try {
                const res = await tasksService.list(workspaceId, projectId);

                if (!res.success || !res.data) {
                    throw new Error("Gagal memuat task");
                }

                return res.data.map(mapTask);
            } catch (error) {
                if (error instanceof ApiError && error.status === 403) {
                    const errorMessage = error.data?.error || error.message;

                    if (errorMessage.includes('tidak ditemukan') || errorMessage.includes('not found')) {
                        return [];
                    }

                    throw new ApiError(
                        403,
                        `Anda tidak memiliki akses ke project ini`,
                        error.data
                    );
                }
                throw error;
            }
        },

        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,

        retry: (failureCount, error) => {

            if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
                return false;
            }
            return failureCount < 2;
        },

        throwOnError: false,
    });
}

/**
 * =========================
 * FETCH TASK DETAIL
 * =========================
 */
export function useTaskDetail(
    workspaceId: number | null,
    projectId: number | null,
    taskId: number | null
) {
    return useQuery<TaskApi | null>({
        queryKey: taskKeys.detail(
            workspaceId ?? 0,
            projectId ?? 0,
            taskId ?? 0
        ),
        enabled: Boolean(workspaceId && projectId && taskId),

        queryFn: async () => {
            if (!workspaceId || !projectId || !taskId) {
                return null;
            }

            try {
                const res = await tasksService.detail(workspaceId, projectId, taskId);

                if (!res.success || !res.data) {
                    throw new Error("Gagal memuat detail task");
                }

                return mapTask(res.data);
            } catch (error) {
                if (error instanceof ApiError && error.status === 403) {
                    const errorMessage = error.data?.error || error.message;
                    throw new ApiError(
                        403,
                        `Task tidak ditemukan atau Anda tidak memiliki akses`,
                        error.data
                    );
                }
                throw error;
            }
        },

        staleTime: 60 * 1000,
        gcTime: 3 * 60 * 1000,
        throwOnError: false,
    });
}

/**
 * =========================
 * CREATE TASK
 * =========================
 */
export function useCreateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            workspaceId,
            projectId,
            payload,
        }: {
            workspaceId: number;
            projectId: number;
            payload: TaskRequest;
        }) => {
            const res = await tasksService.create(workspaceId, projectId, payload);

            if (!res.success || !res.data) {
                throw new Error("Gagal membuat task");
            }

            return mapTask(res.data);
        },

        onSuccess: (task, variables) => {
            queryClient.setQueryData<TaskApi[]>(
                taskKeys.list(variables.workspaceId, variables.projectId),
                (old = []) => [...old, task]
            );

            invalidateTaskQueries.allInProject(
                queryClient,
                variables.workspaceId,
                variables.projectId
            );

            showSuccessToast("Task berhasil dibuat!");
        },

        onError: (error: unknown) => {
            const message =
                error instanceof ApiError
                    ? (error.data?.error || error.message)
                    : "Gagal membuat task";

            showErrorToast(message);
        },
    });
}

/**
 * =========================
 * UPDATE TASK
 * =========================
 */
export function useUpdateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            workspaceId,
            projectId,
            taskId,
            payload,
        }: {
            workspaceId: number;
            projectId: number;
            taskId: number;
            payload: Partial<TaskRequest>;
        }) => {
            const res = await tasksService.update(
                workspaceId,
                projectId,
                taskId,
                payload
            );

            if (!res.success || !res.data) {
                throw new Error("Gagal update task");
            }

            return mapTask(res.data);
        },

        onMutate: async ({ workspaceId, projectId, taskId, payload }) => {
            await queryClient.cancelQueries({
                queryKey: taskKeys.list(workspaceId, projectId),
            });

            const previousTasks = queryClient.getQueryData<TaskApi[]>(
                taskKeys.list(workspaceId, projectId)
            );

            queryClient.setQueryData<TaskApi[]>(
                taskKeys.list(workspaceId, projectId),
                (old) => {
                    if (!old) return old;

                    return old.map(task => {
                        if (task.id !== taskId) return task;

                        const updates: Partial<TaskApi> = {};

                        if (payload.status !== undefined) {
                            updates.status = payload.status ?? task.status;
                        }

                        if (payload.priority !== undefined) {
                            updates.priority = payload.priority ?? task.priority;
                        }

                        if (payload.title !== undefined) {
                            updates.title = payload.title;
                        }
                        if (payload.description !== undefined) {
                            updates.description = payload.description;
                        }
                        if (payload.notes !== undefined) {
                            updates.notes = payload.notes;
                        }
                        if (payload.start_date !== undefined) {
                            updates.start_date = payload.start_date;
                        }
                        if (payload.due_date !== undefined) {
                            updates.due_date = payload.due_date;
                        }
                        if (payload.due_time !== undefined) {
                            updates.due_time = payload.due_time;
                        }

                        if (payload.status === "done" && task.status !== "done") {
                            updates.finished_at = new Date().toISOString();

                            const overdueMins = calculateOptimisticOverdue(task);
                            updates.overdue_duration = overdueMins;
                            updates.is_overdue = overdueMins > 0;
                        }

                        if (task.status === "done" && payload.status && payload.status !== "done") {
                            updates.finished_at = undefined;
                            updates.overdue_duration = 0;
                            updates.is_overdue = false;
                        }

                        if (payload.finished_at !== undefined) {
                            updates.finished_at = payload.finished_at || undefined;
                        }

                        return {
                            ...task,
                            ...updates
                        };
                    });
                }
            );

            return { previousTasks };
        },

        onError: (error, variables, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(
                    taskKeys.list(variables.workspaceId, variables.projectId),
                    context.previousTasks
                );
            }

            const message =
                error instanceof ApiError
                    ? (error.data?.error || error.message)
                    : "Gagal update task";

            showErrorToast(message);
        },

        onSuccess: (updatedTask, variables) => {
            queryClient.setQueryData<TaskApi[]>(
                taskKeys.list(variables.workspaceId, variables.projectId),
                (old = []) => old.map(task =>
                    task.id === variables.taskId ? updatedTask : task
                )
            );

            invalidateTaskQueries.allInProject(
                queryClient,
                variables.workspaceId,
                variables.projectId
            );

            invalidateTaskQueries.taskDetail(
                queryClient,
                variables.workspaceId,
                variables.projectId,
                variables.taskId
            );

            showSuccessToast("Task berhasil diperbarui!");
        },
    });
}

/**
 * =========================
 * DELETE TASK
 * =========================
 */
export function useDeleteTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            workspaceId,
            projectId,
            taskId,
        }: {
            workspaceId: number;
            projectId: number;
            taskId: number;
        }) => {
            await tasksService.softDelete(workspaceId, projectId, taskId);
            return taskId;
        },

        onMutate: async ({ workspaceId, projectId, taskId }) => {
            await queryClient.cancelQueries({
                queryKey: taskKeys.list(workspaceId, projectId),
            });

            const previousTasks = queryClient.getQueryData<TaskApi[]>(
                taskKeys.list(workspaceId, projectId)
            );

            queryClient.setQueryData<TaskApi[]>(
                taskKeys.list(workspaceId, projectId),
                (old = []) => old.filter((task) => task.id !== taskId)
            );

            return { previousTasks };
        },

        onError: (error, variables, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(
                    taskKeys.list(variables.workspaceId, variables.projectId),
                    context.previousTasks
                );
            }

            const message =
                error instanceof ApiError
                    ? (error.data?.error || error.message)
                    : "Gagal menghapus task";

            showErrorToast(message);
        },

        onSuccess: (_, variables) => {
            invalidateTaskQueries.allInProject(
                queryClient,
                variables.workspaceId,
                variables.projectId
            );

            showSuccessToast("Task berhasil dihapus!");
        },
    });
}