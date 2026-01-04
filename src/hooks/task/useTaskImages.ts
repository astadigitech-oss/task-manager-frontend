
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskImageService } from "@/services/task/taskImage.service";
import { taskKeys, invalidateTaskQueries } from "@/lib/react-query/taskKeys";
import { showSuccessToast, showErrorToast } from "@/lib/helpers/toast-helpers";
import { TaskImageApi } from "@/types/api/task.api";

/**
 *  Hook untuk fetch task images
 */
export function useTaskImages(
    workspaceId: number | null,
    projectId: number | null,
    taskId: number | null
) {
    return useQuery({
        queryKey: taskKeys.images(workspaceId || 0, projectId || 0, taskId || 0),
        queryFn: async () => {
            if (!workspaceId || !projectId || !taskId) return [];
            if (workspaceId === 0) {
                console.warn("Invalid workspace_id in useTaskImages:", workspaceId);
                return [];
            }

            const res = await taskImageService.list(workspaceId, projectId, taskId);

            if (!res.success || !res.data) {
                return [];
            }

            const validImages = res.data
                .filter(img => {
                    if (!img.url) {

                        return false;
                    }
                    return true;
                })
                .map(img => ({
                    ...img,
                    image_url: img.url
                }));

            return validImages;
        },
        enabled: !!workspaceId && !!projectId && !!taskId && workspaceId > 0,
        staleTime: 3 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: (failureCount, error: any) => {
            if (error?.status === 403 || error?.response?.status === 403) {
                return false;
            }
            return failureCount < 2;
        },
    });
}

/**
 * Hook untuk upload single task image
 */
export function useUploadTaskImage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            workspaceId,
            projectId,
            taskId,
            file,
            options
        }: {
            workspaceId: number;
            projectId: number;
            taskId: number;
            file: File;
            options?: { title?: string; description?: string; onProgress?: (progress: number) => void };
        }) => {

            const validation = taskImageService.validateFile(file);
            if (!validation.valid) {
                throw new Error(validation.error || "File tidak valid");
            }

            const res = await taskImageService.upload(
                workspaceId,
                projectId,
                taskId,
                file,
                options
            );

            if (!res.success || !res.data) {
                throw new Error("Gagal upload gambar");
            }

            return { workspaceId, projectId, taskId, data: res.data };
        },
        onSuccess: ({ workspaceId, projectId, taskId }) => {
            invalidateTaskQueries.taskImages(queryClient, workspaceId, projectId, taskId);
            invalidateTaskQueries.allInProject(queryClient, workspaceId, projectId);
            showSuccessToast("Gambar berhasil diupload!");
        },
        onError: (error: any) => {
            const message = error.message || "Gagal upload gambar";
            showErrorToast(message);
        },
    });
}

/**
 * Hook untuk upload multiple task images
 */
export function useUploadMultipleTaskImages() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            workspaceId,
            projectId,
            taskId,
            files,
            options
        }: {
            workspaceId: number;
            projectId: number;
            taskId: number;
            files: File[];
            options?: { onProgress?: (progress: number) => void };
        }) => {
            const results = await taskImageService.uploadMultiple(
                workspaceId,
                projectId,
                taskId,
                files,
                {
                    onProgress: options?.onProgress,
                    onSingleComplete: (file, result) => {

                        queryClient.setQueryData(
                            taskKeys.images(workspaceId, projectId, taskId),
                            (old: TaskImageApi[] | undefined) => {
                                if (!old) return [result];
                                return [...old, result];
                            }
                        );
                    }
                }
            );

            return { workspaceId, projectId, taskId, results };
        },
        onSuccess: ({ workspaceId, projectId, taskId, results }) => {
            if (results.length > 0) {
                invalidateTaskQueries.taskImages(queryClient, workspaceId, projectId, taskId);
                invalidateTaskQueries.allInProject(queryClient, workspaceId, projectId);
                showSuccessToast(`${results.length} gambar berhasil diupload!`);
            } else {
                showErrorToast("Tidak ada gambar yang berhasil diupload");
            }
        },
        onError: (error: any) => {
            const message = error?.message || "Gagal upload beberapa gambar";
            showErrorToast(message);
        },
    });
}

/**
 * Hook untuk delete task image
 */
export function useDeleteTaskImage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            workspaceId,
            projectId,
            taskId,
            imageId
        }: {
            workspaceId: number;
            projectId: number;
            taskId: number;
            imageId: number;
        }) => {
            const res = await taskImageService.delete(workspaceId, projectId, taskId, imageId);

            if (!res.success) {
                throw new Error("Gagal menghapus gambar");
            }

            return { workspaceId, projectId, taskId, imageId };
        },
        onMutate: async ({ workspaceId, projectId, taskId, imageId }) => {

            await queryClient.cancelQueries({
                queryKey: taskKeys.images(workspaceId, projectId, taskId)
            });

            const previousImages = queryClient.getQueryData(
                taskKeys.images(workspaceId, projectId, taskId)
            );

            queryClient.setQueryData(
                taskKeys.images(workspaceId, projectId, taskId),
                (old: TaskImageApi[] | undefined) => {
                    if (!old) return old;
                    return old.filter(img => img.id !== imageId);
                }
            );

            return { previousImages };
        },
        onError: (error, variables, context) => {
            if (context?.previousImages) {
                queryClient.setQueryData(
                    taskKeys.images(variables.workspaceId, variables.projectId, variables.taskId),
                    context.previousImages
                );
            }
            showErrorToast("Gagal menghapus gambar");
        },
        onSuccess: ({ workspaceId, projectId, taskId }) => {
            invalidateTaskQueries.taskImages(queryClient, workspaceId, projectId, taskId);
            invalidateTaskQueries.allInProject(queryClient, workspaceId, projectId);
            showSuccessToast("Gambar berhasil dihapus!");
        },
    });
}