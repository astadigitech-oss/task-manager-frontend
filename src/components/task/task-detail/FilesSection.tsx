"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
    Plus,
    Trash2,
    Download,
    FileText,
    FileSpreadsheet,
    File,
    Image,
    Loader2,
    Upload,
    Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils/utils";
import { toast } from "sonner";
import { TaskFileApi, formatFileSize, getFileExtension } from "@/types/api/task.api";
import { UniversalAttachmentViewer } from "@/components/modals/UniversalAttachmentViewer";
import { filesService } from "@/services/task/taskFiles.service";

// ─── mime / ext yang diizinkan ────────────────────────────────────────────────
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "pdf", "doc", "docx", "xls", "xlsx"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// ─── Props ────────────────────────────────────────────────────────────────────
interface FilesSectionProps {
    files: TaskFileApi[];
    onFileUpload: (files: File[]) => Promise<void>;
    onDownloadFile: (file: TaskFileApi) => void;
    onRemoveFile: (fileId: number) => void;
    readOnly?: boolean;
    isUploading?: boolean;
    uploadProgress?: number;
    workspaceId: number;
    projectId: number;
    taskId: number;
}

// ─── Icon resolver berdasarkan mime ──────────────────────────────────────────
function FileIcon({ mimeType, className }: { mimeType: string; className?: string }) {
    if (mimeType.startsWith("image/"))
        return <Image className={className} />;
    if (mimeType === "application/pdf")
        return <FileText className={className} />;
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
        return <FileSpreadsheet className={className} />;
    if (mimeType.includes("word") || mimeType === "application/msword")
        return <FileText className={className} />;
    return <File className={className} />;
}

// ─── Badge color berdasarkan ext ─────────────────────────────────────────────
function getExtBadgeClass(ext: string): string {
    switch (ext) {
        case "pdf":
            return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
        case "doc":
        case "docx":
            return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
        case "xls":
        case "xlsx":
            return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
        case "webp":
            return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300";
        default:
            return "bg-muted text-muted-foreground";
    }
}

// ─── Component ────────────────────────────────────────────────────────────────
export function FilesSection({
    files,
    onFileUpload,
    onDownloadFile,
    onRemoveFile,
    readOnly = false,
    isUploading = false,
    uploadProgress = 0,
    workspaceId,
    projectId,
    taskId,
}: FilesSectionProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    // ── Viewer state ─────────────────────────────────────────────────────────
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerFile, setViewerFile] = useState<TaskFileApi | null>(null);
    // ini yang SEHARUSNYA dikasih ke viewer — blob URL dari authenticated fetch
    const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);

    // ── cleanup blob URL kalau viewer ditutup atau component unmount ──────────
    useEffect(() => {
        return () => {
            if (previewBlobUrl?.startsWith("blob:")) {
                URL.revokeObjectURL(previewBlobUrl);
            }
        };
    }, [previewBlobUrl]);

    // ── cleanup saat viewer ditutup ──────────────────────────────────────────
    useEffect(() => {
        if (!viewerOpen && previewBlobUrl?.startsWith("blob:")) {
            URL.revokeObjectURL(previewBlobUrl);
            setPreviewBlobUrl(null);
        }
    }, [viewerOpen, previewBlobUrl]);

    // ─── validasi files ──────────────────────────────────────────────────────
    const processFiles = useCallback(async (fileList: FileList | File[]) => {
        const arr = Array.from(fileList);
        const valid: File[] = [];

        arr.forEach((file) => {
            const ext = getFileExtension(file.name);

            if (!ALLOWED_EXTENSIONS.includes(ext)) {
                toast.error(`Format "${ext}" tidak didukung`, {
                    description: "Diizinkan: PDF, DOC, DOCX, XLS, XLSX, dan gambar.",
                });
                return;
            }

            if (file.size > MAX_FILE_SIZE) {
                toast.error(`${file.name} terlalu besar`, {
                    description: `Maksimal ukuran file adalah ${formatFileSize(MAX_FILE_SIZE)}.`,
                });
                return;
            }

            valid.push(file);
        });

        if (valid.length === 0) return;
        await onFileUpload(valid);
    }, [onFileUpload]);

    // ─── handlers ────────────────────────────────────────────────────────────
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files?.length) return;
        await processFiles(files);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!readOnly && !isUploading) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        if (
            e.clientX <= rect.left ||
            e.clientX >= rect.right ||
            e.clientY <= rect.top ||
            e.clientY >= rect.bottom
        ) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (readOnly || isUploading) return;

        const dropped = e.dataTransfer.files;
        if (!dropped?.length) return;
        await processFiles(dropped);
    };

    const handleUploadClick = () => {
        if (!isUploading && fileInputRef.current) fileInputRef.current.click();
    };

    // ── PREVIEW: fetch lewat service (sudah berauth) → set blob URL ke viewer ─
    const handleOpenViewer = async (file: TaskFileApi) => {
        setIsLoadingPreview(true);
        try {
            // filesService.view() sudah pakai apiClient yang punya interceptor auth
            // → returns blob URL yang bisa langsung di-render
            const blobUrl = await filesService.view(
                workspaceId,
                projectId,
                taskId,
                file.id
            );

            setPreviewBlobUrl(blobUrl);   // ← ini yang dikasih ke viewer
            setViewerFile(file);
            setViewerOpen(true);
        } catch (err) {
            toast.error("Gagal membuka preview file");
            console.error(err);
        } finally {
            setIsLoadingPreview(false);
        }
    };

    // ── close viewer: cleanup blob ──────────────────────────────────────────
    const handleViewerClose = (open: boolean) => {
        if (!open) {
            if (previewBlobUrl?.startsWith("blob:")) {
                URL.revokeObjectURL(previewBlobUrl);
                setPreviewBlobUrl(null);
            }
            setViewerFile(null);
        }
        setViewerOpen(open);
    };

    return (
        <div className="space-y-4">
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Label className="text-sm font-semibold">Documents & Files</Label>
                    {files.length > 0 && (
                        <span className="text-sm text-muted-foreground">({files.length})</span>
                    )}
                </div>

                {!readOnly && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5"
                        type="button"
                        disabled={isUploading}
                        onClick={handleUploadClick}
                    >
                        {isUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Plus className="w-4 h-4" />
                        )}
                        Upload
                    </Button>
                )}

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={readOnly || isUploading}
                />
            </div>

            {/* ── Upload Progress ─────────────────────────────────────────── */}
            {isUploading && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Uploading...</span>
                        <span className="font-medium">{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                </div>
            )}

            {/* ── Drop Zone ───────────────────────────────────────────────── */}
            {!readOnly && (
                <div
                    className={cn(
                        "p-8 border-2 border-dashed rounded-lg transition-all",
                        isDragging
                            ? "border-primary bg-primary/10 scale-[1.02]"
                            : "border-border bg-muted/30 hover:bg-muted/50",
                        isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                    )}
                    onClick={handleUploadClick}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className="text-center">
                        <Upload
                            className={cn(
                                "w-8 h-8 mx-auto mb-2 transition-transform",
                                isDragging && "scale-110 text-primary"
                            )}
                        />
                        <p className="text-sm text-muted-foreground">
                            {isDragging ? (
                                <span className="font-medium text-primary">Drop file di sini</span>
                            ) : (
                                <>
                                    Drag & drop atau{" "}
                                    <span className="underline font-medium">klik untuk upload</span>
                                </>
                            )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            PDF, DOC, DOCX, XLS, XLSX, dan gambar (Max 10MB)
                        </p>
                    </div>
                </div>
            )}

            {/* ── File List ───────────────────────────────────────────────── */}
            {files.length > 0 ? (
                <div className="space-y-2">
                    {files.map((file) => {
                        const ext = getFileExtension(file.filename);

                        return (
                            <div
                                key={file.id}
                                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors group"
                            >
                                {/* Icon */}
                                <div className="shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                    <FileIcon mimeType={file.mime_type} className="w-5 h-5 text-muted-foreground" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-sm font-medium text-foreground truncate">
                                            {file.filename}
                                        </p>
                                        <span className={cn(
                                            "text-xs font-semibold px-1.5 py-0.5 rounded",
                                            getExtBadgeClass(ext)
                                        )}>
                                            {ext.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-xs text-muted-foreground">
                                            {formatFileSize(file.file_size)}
                                        </p>
                                        {file.user?.name && (
                                            <>
                                                <span className="text-xs text-muted-foreground">•</span>
                                                <p className="text-xs text-muted-foreground">
                                                    {file.user.name}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Actions — muncul on hover */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {/* Preview */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleOpenViewer(file)}
                                        disabled={isLoadingPreview}
                                        title="Preview"
                                    >
                                        {isLoadingPreview ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </Button>

                                    {/* Download */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => onDownloadFile(file)}
                                        title="Download"
                                    >
                                        <Download className="w-4 h-4" />
                                    </Button>

                                    {/* Delete */}
                                    {!readOnly && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 hover:text-destructive"
                                            onClick={() => onRemoveFile(file.id)}
                                            title="Hapus"
                                            disabled={isUploading}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-center text-sm text-muted-foreground py-4 border rounded-lg">
                    Belum ada file
                </p>
            )}

            {/* ── UniversalAttachmentViewer Modal ─────────────────────────── */}
            {/*
                CRITICAL: url dikasih dari previewBlobUrl (hasil authenticated fetch),
                BUKAN dari file.url langsung.
                file.url adalah path absolut di server yang butuh auth dan
                tidak bisa di-load langsung di browser.
            */}
            {viewerOpen && viewerFile && previewBlobUrl && (
                <UniversalAttachmentViewer
                    open={viewerOpen}
                    onOpenChange={handleViewerClose}
                    url={previewBlobUrl}
                    name={viewerFile.filename}
                    allowDownload={true}
                    canDelete={!readOnly}
                    onDelete={() => {
                        onRemoveFile(viewerFile.id);
                        handleViewerClose(false);
                    }}
                />
            )}
        </div>
    );
}