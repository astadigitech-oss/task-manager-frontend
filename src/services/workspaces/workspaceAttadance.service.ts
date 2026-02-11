import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/interceptors';
import { AttendanceRequest, AttendanceResponse } from '@/types/api/workspace.api';
import { ApiResponse } from '@/types/api/user.api';

const handleApiError = (error: any, customMessage?: string) => {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, customMessage || "Terjadi kesalahan tidak terduga");
};

export const workspaceAttendanceService = {
    /**
     * Submit attendance for a workspace
     * FIXED: Menggunakan FormData untuk mengirim data absensi
     */
    submit: async (
        workspace_id: number,
        payload: Omit<AttendanceRequest, 'workspace_id'>,
        images?: File[]
    ): Promise<AttendanceResponse> => {
        try {
            const formData = new FormData();
            
            // Tambahkan data absensi
            formData.append('activity', payload.activity);
            formData.append('obstacle', payload.obstacle || '');
            
            // Tambahkan gambar jika ada
            if (images && images.length > 0) {
                images.forEach((file) => {
                    formData.append('images', file);
                });
            }

            const response = await apiClient.post(
                API_ENDPOINTS.WORKSPACE.ATTENDANCE.ABSENSI(workspace_id),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error: any) {
            // Pass-through the original error untuk component handle
            // Jangan wrap dengan handleApiError agar error message dari backend tetap utuh
            throw error;
        }
    },

    /**
     * Upload attendance images (Deprecated - sekarang langsung di submit)
     * Kept for backward compatibility
     */
    uploadImages: async (
        workspace_id: number,
        attendance_id: number,
        files: File[],
        onProgress?: (progress: number) => void
    ): Promise<ApiResponse<{ uploaded: number }>> => {
        try {
            const formData = new FormData();
            files.forEach((file) => formData.append('images', file));

            const response = await apiClient.post(
                `${API_ENDPOINTS.WORKSPACE.ATTENDANCE.ABSENSI(workspace_id)}/${attendance_id}/images`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        if (onProgress && progressEvent.total) {
                            const pct = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                            onProgress(pct);
                        }
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw handleApiError(error, "Gagal upload gambar absensi");
        }
    },

    /**
     * Export attendance PDF for a specific date (admin only)
     * Endpoint: GET /api/workspaces/:id/attendances/export?date=YYYY-MM-DD
     */
    export: async (workspace_id: number, date: string): Promise<Blob> => {
        try {
            const response = await apiClient.get(
                `${API_ENDPOINTS.WORKSPACE.ATTENDANCE.EXPORT(workspace_id)}?date=${date}`,
                { responseType: 'blob' }
            );

            // Validasi blob
            if (!response.data || response.data.size === 0) {
                throw new Error('PDF file is empty');
            }

            // Validasi header PDF
            const previewSize = Math.min(response.data.size, 1024);
            const previewBuffer = await response.data.slice(0, previewSize).arrayBuffer();
            const previewText = new TextDecoder('utf-8', { fatal: false }).decode(previewBuffer);
            
            if (!previewText.startsWith('%PDF')) {
                console.error('Invalid PDF header. First bytes:', previewText.substring(0, 100));
                throw new Error('File is not a valid PDF');
            }

            if (previewText.includes('<!DOCTYPE') || previewText.includes('<html')) {
                throw new Error('Received HTML instead of PDF');
            }

            return response.data;
        } catch (error: any) {
            // Enhanced error handling
            if (error?.response?.status === 404) {
                throw new ApiError(404, "Data absensi tidak ditemukan untuk tanggal tersebut");
            }
            if (error?.response?.status === 403) {
                throw new ApiError(403, "Anda tidak memiliki akses untuk mengekspor laporan");
            }
            throw handleApiError(error, "Gagal mengekspor laporan absensi");
        }
    },
};