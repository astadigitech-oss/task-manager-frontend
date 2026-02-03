import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/interceptors";
import {
    TaskFileListResponse,
} from "@/types/api/task.api";

// ─── shared error handler ────────────────────────────────────────────────────
const handleApiError = (error: any, customMessage?: string) => {
    if (error instanceof ApiError) {
        throw error;
    }
    throw new ApiError(
        500,
        customMessage || "Terjadi kesalahan tidak terduga"
    );
};


export const filesService = {
    // ───────────────────────────────────────────────────────────────────────────
    // LIST
    // ───────────────────────────────────────────────────────────────────────────
    list: async (
        workspace_id: number,
        project_id: number,
        task_id: number
    ): Promise<TaskFileListResponse> => {
        try {
            const url = API_ENDPOINTS.FILES.LIST(workspace_id, project_id, task_id);
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            if (error instanceof ApiError && error.status === 403) {
                const errorMessage = error.data?.error || error.message || "";
                if (
                    errorMessage.toLowerCase().includes("tidak ditemukan") ||
                    errorMessage.toLowerCase().includes("not found")
                ) {
                    return {
                        success: true,
                        code: 200,
                        data: [],
                        message: "Tidak ada file",
                    };
                }
                throw error;
            }
            throw handleApiError(error, "Gagal memuat daftar file");
        }
    },

    // ───────────────────────────────────────────────────────────────────────────
    // UPLOAD
    // ───────────────────────────────────────────────────────────────────────────
    upload: async (
        workspace_id: number,
        project_id: number,
        task_id: number,
        files: File[],
        options?: { onProgress?: (progress: number) => void }
    ): Promise<TaskFileListResponse> => {
        try {
            const url = API_ENDPOINTS.FILES.UPLOAD(workspace_id, project_id, task_id);
            const results: any[] = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append("file", file);

                const response = await apiClient.post(url, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    onUploadProgress: (e) => {
                        if (!options?.onProgress || !e.total) return;

                        const base = (i / files.length) * 100;
                        const current = (e.loaded / e.total) * (100 / files.length);
                        options.onProgress(Math.round(base + current));
                    },
                });

                if (response.data?.data) {
                    results.push(response.data.data);
                }
            }

            return {
                success: true,
                code: 200,
                data: results,
                message: "Upload berhasil",
            };
        } catch (error) {
            throw handleApiError(error, "Gagal upload file");
        }
    },

    // ───────────────────────────────────────────────────────────────────────────
    // VIEW
    // ───────────────────────────────────────────────────────────────────────────
    view: async (
        workspace_id: number,
        project_id: number,
        task_id: number,
        file_id: number
    ): Promise<string> => {
        try {
            const url = API_ENDPOINTS.FILES.VIEW(workspace_id, project_id, task_id, file_id);

            const response = await apiClient.get(url, {
                params: { file_id },
                responseType: "blob",
            });

            const blobUrl = URL.createObjectURL(response.data);
            return blobUrl;
        } catch (error) {
            throw handleApiError(error, "Gagal membuka file");
        }
    },

    // ───────────────────────────────────────────────────────────────────────────
    // DOWNLOAD
    // ───────────────────────────────────────────────────────────────────────────
    download: async (
        workspace_id: number,
        project_id: number,
        task_id: number,
        file_id: number,
        filename?: string
    ): Promise<void> => {
        try {
            const url = API_ENDPOINTS.FILES.DOWNLOAD(workspace_id, project_id, task_id, file_id);

            const response = await apiClient.get(url, {
                params: { file_id },
                responseType: "blob",
            });

            const resolvedFilename =
                filename ||
                getFilenameFromContentDisposition(response.data.headers) ||
                `file-${file_id}`;

            triggerBrowserDownload(response.data, resolvedFilename);
        } catch (error) {
            throw handleApiError(error, "Gagal download file");
        }
    },

    // ───────────────────────────────────────────────────────────────────────────
    // DELETE
    // ───────────────────────────────────────────────────────────────────────────
    delete: async (
        workspace_id: number,
        project_id: number,
        task_id: number,
        file_id: number
    ): Promise<void> => {
        try {
            const url = API_ENDPOINTS.FILES.DELETE(workspace_id, project_id, task_id, file_id);
            await apiClient.delete(url);
        } catch (error) {
            throw handleApiError(error, "Gagal menghapus file");
        }
    },
};

// ─── internal helpers ────────────────────────────────────────────────────────

function getFilenameFromContentDisposition(
    headers: Record<string, string> | undefined
): string | null {
    const cd = headers?.["content-disposition"];
    if (!cd) return null;
    const match = cd.match(/filename="?([^";]+)"?/i);
    return match?.[1] ?? null;
}

function triggerBrowserDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(url), 100);
}


export async function fetchFileAsBlobUrl(
    url: string,
    token: string
): Promise<string> {
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch file: ${res.status}`);
    }

    const blob = await res.blob();
    return URL.createObjectURL(blob);
}