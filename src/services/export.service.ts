import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/interceptors";
import { 
    validatePDFBlob, 
    downloadBlob, 
    generateExportFilename,
    formatExportError 
} from "@/lib/utils/export.utils";

export type ExportType = "daily" | "weekly-forward" | "weekly-backward" | "agenda";

export interface ExportPDFParams {
    project_id: number;
    export_type: ExportType;
    date?: string;
}

export interface DownloadResult {
    success: boolean;
    filename?: string;
    error?: {
        message: string;
        code?: number;
    };
}

/**
 * Export Service - Handle PDF generation from backend
 */
export const exportService = {
    /**
     * Export Daily PDF
     */
    exportDaily: async (project_id: number, date?: string): Promise<Blob> => {
        try {
            const response = await apiClient.get(
                API_ENDPOINTS.EXPORT.DAILY(project_id),
                {
                    params: date ? { date } : undefined,
                    responseType: "blob",
                    headers: {
                        'Accept': 'application/pdf',
                    },
                }
            );

            await validatePDFBlob(response.data);
            return response.data;
        } catch (err) {
            console.error('Export Daily failed:', err);
            throw new ApiError(
                (err as any).status || 500, 
                formatExportError(err)
            );
        }
    },

    /**
     * Export Weekly Forward PDF
     */
    exportWeeklyForward: async (project_id: number, date?: string): Promise<Blob> => {
        try {
            const response = await apiClient.get(
                API_ENDPOINTS.EXPORT.WEEKLY_FORWARD(project_id),
                {
                    params: date ? { date } : undefined,
                    responseType: "blob",
                    headers: {
                        'Accept': 'application/pdf',
                    },
                }
            );

            await validatePDFBlob(response.data);
            return response.data;
        } catch (err) {
            console.error('Export Weekly Forward failed:', err);
            throw new ApiError(
                (err as any).status || 500,
                formatExportError(err)
            );
        }
    },

    /**
     * Export Weekly Backward PDF
     */
    exportWeeklyBackward: async (project_id: number, date?: string): Promise<Blob> => {
        try {
            const response = await apiClient.get(
                API_ENDPOINTS.EXPORT.WEEKLY_BACKWARD(project_id),
                {
                    params: date ? { date } : undefined,
                    responseType: "blob",
                    headers: {
                        'Accept': 'application/pdf',
                    },
                }
            );

            await validatePDFBlob(response.data);
            return response.data;
        } catch (err) {
            console.error('Export Weekly Backward failed:', err);
            throw new ApiError(
                (err as any).status || 500,
                formatExportError(err)
            );
        }
    },

    /**
     * Export Agenda PDF
     */
    exportAgenda: async (project_id: number, date?: string): Promise<Blob> => {
        try {
            const response = await apiClient.get(
                API_ENDPOINTS.EXPORT.AGENDA(project_id),
                {
                    params: date ? { date } : undefined,
                    responseType: "blob",
                    headers: {
                        'Accept': 'application/pdf',
                    },
                }
            );

            await validatePDFBlob(response.data);
            return response.data;
        } catch (err) {
            console.error('Export Agenda failed:', err);
            throw new ApiError(
                (err as any).status || 500,
                formatExportError(err)
            );
        }
    },

    /**
     * Generic export - Route ke method yang sesuai
     */
    exportToPDF: async (params: ExportPDFParams): Promise<Blob> => {
        const { project_id, export_type, date } = params;

        switch (export_type) {
            case "daily":
                return exportService.exportDaily(project_id, date);
            
            case "weekly-forward":
                return exportService.exportWeeklyForward(project_id, date);
            
            case "weekly-backward":
                return exportService.exportWeeklyBackward(project_id, date);
            
            case "agenda":
                return exportService.exportAgenda(project_id, date);
            
            default:
                throw new ApiError(400, "Invalid export type");
        }
    },

    /**
     * Download PDF dengan auto-generate filename
     */
    downloadPDF: async (
        params: ExportPDFParams,
        projectName?: string
    ): Promise<DownloadResult> => {
        try {
            // Get PDF blob dari backend
            const blob = await exportService.exportToPDF(params);
            
            // Generate filename
            const filename = generateExportFilename(
                projectName || `Project_${params.project_id}`,
                params.export_type,
                params.date
            );
            
            // Download
            downloadBlob(blob, filename);
            
            return {
                success: true,
                filename,
            };
        } catch (err) {
            console.error('Download PDF failed:', err);
            
            const error = err as ApiError;
            return {
                success: false,
                error: {
                    message: formatExportError(err),
                    code: error.status,
                },
            };
        }
    },
};