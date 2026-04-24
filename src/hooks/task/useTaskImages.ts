
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
                .filter(img => img.url)
                .map((img, index) => {
                    let type: "before" | "after" | undefined = img.type;

                    // 🚨 Karena backend tidak kirim type
                    // kita pakai fallback sementara

                    if (!type) {
                        // contoh logic sederhana:
                        // separuh pertama = before
                        // separuh kedua = after
                        type = index % 2 === 0 ? "before" : "after";
                    }

                    return {
                        ...img,
                        type,
                        image_url: img.url
                    };
                });

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
 * Hook fetch images before
 */
export function useTaskImagesBefore(
    workspaceId: number | null,
    projectId: number | null,
    taskId: number | null
) {
    return useQuery({
        queryKey: taskKeys.imagesBefore(workspaceId || 0, projectId || 0, taskId || 0),
        queryFn: async () => {
            if (!workspaceId || !projectId || !taskId || workspaceId === 0) return [];
            const res = await taskImageService.list(workspaceId, projectId, taskId);
            if (!res.success || !res.data) return [];
            // Fallback: jika type tidak ada, filter dengan nama file atau urutan
            return res.data
                .filter((img, index) => {
                    if (!img.url) return false;

                    // ✅ PRIORITAS 1: pakai type jika ada
                    if (img.type) return img.type === "before";

                    // ✅ PRIORITAS 2: pakai title (jika kamu kirim dari upload)
                    if (img.title?.toLowerCase().includes("before")) return true;

                    // ✅ PRIORITAS 3 (fallback terakhir): urutan
                    return index % 2 === 0; // asumsi genap = before
                })
                .map(img => ({
                    ...img,
                    type: "before", // 🔥 penting untuk konsistensi
                    image_url: img.url
                }));
        },
        enabled: !!workspaceId && !!projectId && !!taskId && workspaceId > 0,
        staleTime: 3 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}

/**
 * Hook fetch images after
 */
export function useTaskImagesAfter(
    workspaceId: number | null,
    projectId: number | null,
    taskId: number | null
) {
    return useQuery({
        queryKey: taskKeys.imagesAfter(workspaceId || 0, projectId || 0, taskId || 0),
        queryFn: async () => {
            if (!workspaceId || !projectId || !taskId || workspaceId === 0) return [];
            const res = await taskImageService.list(workspaceId, projectId, taskId);
            if (!res.success || !res.data) return [];
            // Fallback: jika type tidak ada, filter dengan nama file atau urutan
            return res.data
                .filter((img, index) => {
                    if (!img.url) return false;

                    if (img.type) return img.type === "after";

                    if (img.title?.toLowerCase().includes("after")) return true;

                    return index % 2 !== 0; // ganjil = after
                })
                .map(img => ({
                    ...img,
                    type: "after",
                    image_url: img.url
                }));
        },
        enabled: !!workspaceId && !!projectId && !!taskId && workspaceId > 0,
        staleTime: 3 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}

/**
 * Hook upload images before
 */
export function useUploadTaskImagesBefore() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            workspaceId, projectId, taskId, files, options
        }: {
            workspaceId: number;
            projectId: number;
            taskId: number;
            files: File[];
            options?: { onProgress?: (progress: number) => void };
        }) => {
            const results = await taskImageService.uploadMultipleByType(
                workspaceId, projectId, taskId, files, "before",
                {
                    onProgress: options?.onProgress,
                    onSingleComplete: (file, result) => {
                        queryClient.setQueryData(
                            taskKeys.imagesBefore(workspaceId, projectId, taskId),
                            (old: TaskImageApi[]) => old
                                ? [...old, { ...result, type: "before" }]
                                : [{ ...result, type: "before" }]
                        );
                    }
                }
            );
            return { workspaceId, projectId, taskId, results };
        },
        onSuccess: ({ workspaceId, projectId, taskId, results }) => {
            if (results.length > 0) {
                invalidateTaskQueries.taskImagesBefore(queryClient, workspaceId, projectId, taskId);
                invalidateTaskQueries.allInProject(queryClient, workspaceId, projectId);
                showSuccessToast(`${results.length} gambar before berhasil diupload!`);
            } else {
                showErrorToast("Tidak ada gambar before yang berhasil diupload");
            }
        },
        onError: (error: any) => {
            showErrorToast(error?.message || "Gagal upload gambar before");
        },
    });
}

/**
 * Hook upload images after
 */
export function useUploadTaskImagesAfter() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            workspaceId, projectId, taskId, files, options
        }: {
            workspaceId: number;
            projectId: number;
            taskId: number;
            files: File[];
            options?: { onProgress?: (progress: number) => void };
        }) => {
            const results = await taskImageService.uploadMultipleByType(
                workspaceId, projectId, taskId, files, "after",
                {
                    onProgress: options?.onProgress,
                    onSingleComplete: (file, result) => {
                        queryClient.setQueryData(
                            taskKeys.imagesAfter(workspaceId, projectId, taskId),
                            (old: TaskImageApi[]) => old
                                ? [...old, { ...result, type: "after" }]
                                : [{ ...result, type: "after" }]
                        );
                    }
                }
            );
            return { workspaceId, projectId, taskId, results };
        },
        onSuccess: ({ workspaceId, projectId, taskId, results }) => {
            if (results.length > 0) {
                invalidateTaskQueries.taskImagesAfter(queryClient, workspaceId, projectId, taskId);
                invalidateTaskQueries.allInProject(queryClient, workspaceId, projectId);
                showSuccessToast(`${results.length} gambar after berhasil diupload!`);
            } else {
                showErrorToast("Tidak ada gambar after yang berhasil diupload");
            }
        },
        onError: (error: any) => {
            showErrorToast(error?.message || "Gagal upload gambar after");
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