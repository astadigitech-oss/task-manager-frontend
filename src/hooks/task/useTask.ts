import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksService } from "@/services/task/task.service";
import { taskKeys, invalidateTaskQueries } from "@/lib/react-query/taskKeys";
import { mapTask } from "@/lib/mapper/task.mapper";
import { showSuccessToast, showErrorToast } from "@/lib/helpers/toast-helpers";
import { TaskApi, TaskRequest } from "@/types/api/task.api";
import { ApiError } from "@/lib/api/interceptors";

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

                    if (errorMessage.includes('tidak ditemukan')) {
                        return [];
                    }

                    // 🔹 Kalau error lain, baru throw
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

            const normalizeDate = (date?: string) =>
                date && !date.includes("T")
                    ? new Date(`${date}T00:00:00Z`).toISOString()
                    : date;

            const res = await tasksService.create(workspaceId, projectId, {
                ...payload,
                start_date: normalizeDate(payload.start_date),
                due_date: normalizeDate(payload.due_date),
            });

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

            const currentTask = queryClient.getQueryData<TaskApi[]>(
                taskKeys.list(workspaceId, projectId)
            )?.find(t => t.id === taskId);

            const finalPayload = { ...payload };

            if (payload.status === "done" && currentTask?.status !== "done") {
                finalPayload.finished_at = new Date().toISOString();

                if (currentTask?.due_date) {
                    const dueDateTime = new Date(currentTask.due_date);

                    if (currentTask.due_time) {
                        const [hours, minutes] = currentTask.due_time.split(':').map(Number);
                        dueDateTime.setHours(hours, minutes, 0, 0);
                    } else {

                        dueDateTime.setHours(23, 59, 59, 999);
                    }

                    const now = new Date();
                    if (now > dueDateTime) {

                        console.log('Task completed after deadline');
                    }
                }
            }

            if (currentTask?.status === "done" && payload.status !== "done") {
                finalPayload.finished_at = null;
            }

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
                        if (payload.status === "done" && task.status !== "done") {
                            updates.finished_at = new Date().toISOString();
                        }
                        if (task.status === "done" && payload.status !== "done") {
                            updates.finished_at = undefined;
                            updates.is_overdue = false;
                        }

                        return {
                            ...task,
                            ...(payload.status !== null && payload.status !== undefined
                                ? { status: payload.status }
                                : {}),
                            ...(payload.priority !== null && payload.priority !== undefined
                                ? { priority: payload.priority }
                                : {}),
                            ...(payload.title !== undefined ? { title: payload.title } : {}),
                            ...(payload.description !== undefined ? { description: payload.description } : {}),
                            ...(payload.start_date !== undefined ? { start_date: payload.start_date } : {}),
                            ...(payload.due_date !== undefined ? { due_date: payload.due_date } : {}),
                            ...(payload.due_time !== undefined ? { due_time: payload.due_time } : {}),
                            ...(payload.notes !== undefined ? { notes: payload.notes } : {}),
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

        onSuccess: (_, variables) => {
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