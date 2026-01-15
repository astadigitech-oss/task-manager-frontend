import { format } from "date-fns";
import type { ExportType } from "@/types/api/export.api";

/**
 * Generate filename untuk export PDF
 */
export function generateExportFilename(
    projectName: string,
    exportType: ExportType,
    date?: string
): string {
    const sanitizedProjectName = projectName
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 50);
    
    const dateStr = date 
        ? format(new Date(date), "yyyyMMdd")
        : format(new Date(), "yyyyMMdd_HHmmss");
    
    return `${sanitizedProjectName}_${exportType}_${dateStr}.pdf`;
}

/**
 * Validasi apakah blob adalah PDF yang valid
 */
export async function validatePDFBlob(blob: Blob): Promise<void> {
    if (blob.size === 0) {
        throw new Error('PDF file is empty');
    }

    if (blob.size < 100) {
        throw new Error('PDF file too small to be valid');
    }

    const previewSize = Math.min(blob.size, 1024);
    const previewBuffer = await blob.slice(0, previewSize).arrayBuffer();
    const previewText = new TextDecoder('utf-8', { fatal: false }).decode(previewBuffer);
    
    if (!previewText.startsWith('%PDF')) {
        console.error('Invalid PDF header. First bytes:', previewText.substring(0, 100));
        throw new Error('File is not a valid PDF');
    }

    if (previewText.includes('<!DOCTYPE') || previewText.includes('<html')) {
        throw new Error('Received HTML instead of PDF. Server might have returned an error page.');
    }
}

/**
 * Download blob sebagai file
 */
export function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
}

/**
 * Extract filename dari Content-Disposition header
 */
export function extractFilenameFromHeader(contentDisposition: string | null): string | null {
    if (!contentDisposition) return null;
    
    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match && utf8Match[1]) {
        return decodeURIComponent(utf8Match[1]);
    }
    
    const filenameMatch = contentDisposition.match(/filename=['"]?([^'";]+)['"]?/i);
    if (filenameMatch && filenameMatch[1]) {
        return decodeURIComponent(filenameMatch[1]);
    }
    
    return null;
}

export function formatExportError(error: unknown): string {
    if (error instanceof Error) {
        const message = error.message;
        
        if (message.includes('404')) {
            return "Endpoint export tidak tersedia. Hubungi administrator.";
        }
        if (message.includes('400')) {
            return "Format request tidak valid. Coba lagi.";
        }
        if (message.includes('401') || message.includes('403')) {
            return "Anda tidak memiliki akses untuk export. Login kembali.";
        }
        if (message.includes('500')) {
            return "Server error saat generate PDF. Coba beberapa saat lagi.";
        }
        if (message.includes('Network Error') || message.includes('fetch')) {
            return "Tidak dapat terhubung ke server. Periksa koneksi internet.";
        }
        if (message.includes('timeout')) {
            return "Request timeout. Server membutuhkan waktu terlalu lama.";
        }
        
        return message;
    }
    
    return "Gagal mengekspor PDF. Silakan coba lagi.";
}