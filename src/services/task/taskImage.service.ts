import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/interceptors";
import { TaskImageApi, TaskImageListResponse, TaskImageResponse } from "@/types/api/task.api";

const handleApiError = (error: any, customMessage?: string) => {
    if (error instanceof ApiError) {
        throw error;
    }
    throw new ApiError(
        500,
        customMessage || "Terjadi kesalahan tidak terduga"
    );
};

export const taskImageService = {
    /**
     * Get all images from task
     */
    list: async (
        workspace_id: number,
        project_id: number,
        task_id: number
    ): Promise<TaskImageListResponse> => {
        try {
            const url = API_ENDPOINTS.TASKS.IMAGES.LIST(workspace_id, project_id, task_id);
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            throw handleApiError(error, "Gagal memuat gambar task");
        }
    },

    /**
     * Upload image before
     */
    uploadBefore: async (
        workspace_id: number,
        project_id: number,
        task_id: number,
        file: File,
        options?: {
            title?: string;
            onProgress?: (progress: number) => void;
        }
    ): Promise<TaskImageResponse> => {
        try {
            const url = API_ENDPOINTS.TASKS.IMAGES.UPLOAD_BEFORE(workspace_id, project_id, task_id);
            const formData = new FormData();
            formData.append("title", "before");
            // if (options?.title) formData.append("title", options.title);

            const response = await apiClient.post(url, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    if (options?.onProgress && progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        options.onProgress(percent);
                    }
                },
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error, "Gagal upload gambar before");
        }
    },

    /**
     * Upload image after
     */
    uploadAfter: async (
        workspace_id: number,
        project_id: number,
        task_id: number,
        file: File,
        options?: {
            title?: string;
            onProgress?: (progress: number) => void;
        }
    ): Promise<TaskImageResponse> => {
        try {
            const url = API_ENDPOINTS.TASKS.IMAGES.UPLOAD_AFTER(workspace_id, project_id, task_id);
            const formData = new FormData();
            formData.append("image", file);
            // formData.append("title", options?.title || "after");

            const response = await apiClient.post(url, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    if (options?.onProgress && progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        options.onProgress(percent);
                    }
                },
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error, "Gagal upload gambar after");
        }
    },

    /**
     * Upload multiple before/after
     */
    uploadMultipleByType: async (
        workspace_id: number,
        project_id: number,
        task_id: number,
        files: File[],
        type: "before" | "after",
        options?: {
            onProgress?: (progress: number) => void;
            onSingleComplete?: (file: File, result: TaskImageApi) => void;
        }
    ): Promise<TaskImageApi[]> => {
        const results: TaskImageApi[] = [];
        const totalFiles = files.length;
        let completedFiles = 0;

        const uploadFn = type === "before"
            ? taskImageService.uploadBefore
            : taskImageService.uploadAfter;

        for (const file of files) {
            try {
                const response = await uploadFn(workspace_id, project_id, task_id, file, {
                    onProgress: (fileProgress) => {
                        const totalProgress =
                            ((completedFiles + fileProgress / 100) / totalFiles) * 100;
                        options?.onProgress?.(totalProgress);
                    },
                });

                if (response.success && response.data) {
                    results.push(response.data);
                    completedFiles++;
                    options?.onSingleComplete?.(file, response.data);
                }
            } catch {
                completedFiles++;
            }
        }

        return results;
    },

    /**
     * Delete image from task
     */
    delete: async (
        workspace_id: number,
        project_id: number,
        task_id: number,
        image_id: number
    ): Promise<TaskImageResponse> => {
        try {
            const url = API_ENDPOINTS.TASKS.IMAGES.DELETE(
                workspace_id,
                project_id,
                task_id,
                image_id
            );
            const response = await apiClient.delete(url);
            return response.data;
        } catch (error) {
            throw handleApiError(error, "Gagal menghapus gambar");
        }
    },

    /**
     * Validate image file before upload
     */
    validateFile: (file: File): { valid: boolean; error?: string } => {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: "Tipe file tidak didukung. Gunakan: JPEG, PNG, GIF, WebP",
            };
        }

        if (file.size > maxSize) {
            return {
                valid: false,
                error: `Ukuran file terlalu besar. Maksimal: 5MB (file: ${(
                    file.size /
                    1024 /
                    1024
                ).toFixed(2)}MB)`,
            };
        }

        return { valid: true };
    },
};