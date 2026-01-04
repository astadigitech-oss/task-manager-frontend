import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/interceptors";
import {
    ProjectImageApi,
    ProjectImageResponse,
    ProjectImageListResponse,
} from "@/types/api/project.api";

const handleApiError = (error: any, customMessage?: string) => {
    if (error instanceof ApiError) {
        throw error;
    }
    throw new ApiError(500, customMessage || "Terjadi kesalahan tidak terduga");
};

export const projectImageService = {
    /**
     * Get all images from project
     */
    list: async (project_id: number): Promise<ProjectImageListResponse> => {
        try {
            const url = API_ENDPOINTS.PROJECTS.IMAGES.LIST(project_id);
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            throw handleApiError(error, "Gagal memuat gambar project");
        }
    },

    /**
     * Upload single image to project
     */
    upload: async (
        project_id: number,
        file: File,
        options?: {
            title?: string;
            description?: string;
            onProgress?: (progress: number) => void;
        }
    ): Promise<ProjectImageResponse> => {
        try {
            const url = API_ENDPOINTS.PROJECTS.IMAGES.UPLOAD(project_id);

            const formData = new FormData();
            formData.append("image", file);

            if (options?.title) formData.append("title", options.title);
            if (options?.description) formData.append("description", options.description);

            const response = await apiClient.post(url, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    if (options?.onProgress && progressEvent.total) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        options.onProgress(percentCompleted);
                    }
                },
            });

            return response.data;
        } catch (error) {
            throw handleApiError(error, "Gagal upload gambar");
        }
    },

    /**
     * Upload multiple images
     */
    uploadMultiple: async (
        project_id: number,
        files: File[],
        options?: {
            onProgress?: (progress: number) => void;
            onSingleComplete?: (file: File, result: ProjectImageApi) => void;
        }
    ): Promise<ProjectImageApi[]> => {
        const results: ProjectImageApi[] = [];
        const totalFiles = files.length;
        let completedFiles = 0;

        for (const file of files) {
            try {
                const response = await projectImageService.upload(
                    project_id,
                    file,
                    {
                        onProgress: (fileProgress) => {
                            const totalProgress =
                                ((completedFiles + fileProgress / 100) / totalFiles) * 100;
                            options?.onProgress?.(totalProgress);
                        },
                    }
                );

                if (response.success && response.data) {
                    results.push(response.data);
                    completedFiles++;
                    options?.onSingleComplete?.(file, response.data);
                }
            } catch (error) {
                console.error(`Failed to upload ${file.name}:`, error);
                completedFiles++;
            }
        }

        return results;
    },

    /**
     * Delete image from project
     */
    delete: async (
        project_id: number,
        image_id: number
    ): Promise<ProjectImageResponse> => {
        try {
            const url = API_ENDPOINTS.PROJECTS.IMAGES.DELETE(project_id, image_id);
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
                    file.size / 1024 / 1024
                ).toFixed(2)}MB)`,
            };
        }

        return { valid: true };
    },
};