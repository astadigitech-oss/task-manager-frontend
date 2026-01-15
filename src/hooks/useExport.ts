"use client";

import { useState } from "react";
import { ExportType, ExportPDFParams } from "@/types/api/export.api";
import { exportService, DownloadResult } from "@/services/export.service";

export function useExportPDF() {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<Error | null>(null);

    const downloadPDF = async (
        params: ExportPDFParams,
        customFilename?: string
    ): Promise<DownloadResult> => {
        setLoading(true);
        setError(null);
        setProgress(0);

        try {

            // Simulasi progress
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 10;
                });
            }, 200);

            // Download menggunakan exportService
            const result = await exportService.downloadPDF(params);

            clearInterval(progressInterval);
            setProgress(100);

            if (!result.success) {
                throw new Error(result.error?.message || "Gagal mengekspor PDF");
            }


            return {
                success: true,
                filename: customFilename || result.filename,
            };

        } catch (err) {
            console.error('Export error:', err);

            let errorMessage = "Gagal mengekspor PDF";

            if (err instanceof Error) {
                errorMessage = err.message;

                // Enhanced error messages
                if (errorMessage.includes('404')) {
                    errorMessage = "Endpoint export tidak ditemukan di backend. Update backend terlebih dahulu.";
                } else if (errorMessage.includes('400')) {
                    errorMessage = "Request format tidak valid. Periksa backend requirements.";
                } else if (errorMessage.includes('500')) {
                    errorMessage = "Server error saat generate PDF. Cek backend logs.";
                } else if (errorMessage.includes('Network Error')) {
                    errorMessage = "Network error: Tidak dapat terhubung ke server";
                } else if (errorMessage.includes('timeout')) {
                    errorMessage = "Request timeout: Server tidak merespons";
                }
            }

            const error = new Error(errorMessage);
            setError(error);

            return {
                success: false,
                error: {
                    message: errorMessage,
                },
            };

        } finally {
            setLoading(false);
            setTimeout(() => setProgress(0), 500);
        }
    };

    const reset = () => {
        setLoading(false);
        setProgress(0);
        setError(null);
    };

    return {
        downloadPDF,
        loading,
        progress,
        error,
        reset,
    };
}

export type { ExportType };