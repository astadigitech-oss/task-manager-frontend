"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  file?: File;
  url?: string;
  name?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allowDownload?: boolean;
  canDelete?: boolean;
  onDelete?: () => void;
}

export function UniversalAttachmentViewer({ 
  file, 
  url, 
  name, 
  open, 
  onOpenChange,
  allowDownload = true,
  canDelete = false,
  onDelete
}: Props) {
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");

  // Handle File or URL-string attachment
  useEffect(() => {
    if (file instanceof File) {
      const objUrl = URL.createObjectURL(file);
      setFileUrl(objUrl);
      setFileName(file.name);
      return () => URL.revokeObjectURL(objUrl);
    } else if (url && name) {
      setFileUrl(url);
      setFileName(name);
    }
  }, [file, url, name]);

  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  const handleDownload = () => {
    if (!allowDownload) {
      alert("Download is restricted for this file.");
      return;
    }
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileName;
    a.click();
  };

  const renderPreview = () => {
    // IMAGE PREVIEW
    if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) {
      return (
        <div className="flex items-center justify-center h-full">
          <img
            src={fileUrl}
            alt={fileName}
            className="max-h-[80vh] max-w-full object-contain"
          />
        </div>
      );
    }

    // PDF PREVIEW
    if (ext === "pdf") {
      return (
        <iframe
          src={`${fileUrl}#toolbar=1`}
          className="w-full h-[80vh] rounded border border-gray-700"
          title={fileName}
        />
      );
    }

    // TXT PREVIEW
    if (ext === "txt") {
      return (
        <iframe
          src={fileUrl}
          className="w-full h-[80vh] bg-gray-900 text-white rounded border border-gray-700 font-mono text-sm p-4"
          title={fileName}
        />
      );
    }

    // DOC / DOCX / XLS / XLSX — Office Web Viewer
    if (["doc", "docx", "xls", "xlsx"].includes(ext)) {
      const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        fileUrl
      )}`;

      return (
        <iframe
          src={officeUrl}
          className="w-full h-[80vh] rounded border border-border surface-elevated"
          title={fileName}
        />
      );
    }

    // ZIP / RAR – only show basic info
    if (["zip", "rar", "7z"].includes(ext)) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
          <div className="w-24 h-24 rounded-full surface-elevated flex items-center justify-center mb-4">
            <span className="text-5xl">🗜️</span>
          </div>
          <p className="text-xl font-semibold text-foreground mb-2">{fileName}</p>
          <p className="text-muted mb-4">
            Preview tidak tersedia untuk file arsip.
          </p>
          {allowDownload && (
            <Button onClick={handleDownload} className="button-primary">
              <Download className="w-4 h-4 mr-2" />
              Download File
            </Button>
          )}
        </div>
      );
    }

    // FALLBACK for unknown file types
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <div className="w-24 h-24 rounded-full surface-elevated flex items-center justify-center mb-4">
          <span className="text-5xl">📎</span>
        </div>
        <p className="text-xl font-semibold text-foreground mb-2">{fileName}</p>
        <p className="text-muted mb-1">
          No preview available for this file type.
        </p>
        <p className="text-sm text-muted mb-4">
          File type: {ext.toUpperCase()}
        </p>
        {allowDownload && (
          <Button onClick={handleDownload} className="button-primary">
            <Download className="w-4 h-4 mr-2" />
            Download File
          </Button>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-none !w-screen !h-screen p-0 overflow-hidden overlay !m-0 !rounded-none">
        <DialogTitle className="sr-only">{fileName}</DialogTitle>
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6 overlay-strong">
          <div className="text-card-foreground">
            <h3 className="font-semibold text-lg">{fileName}</h3>
            <p className="text-sm text-muted">File type: {ext.toUpperCase()}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Download button */}
            {allowDownload && (
              <Button
                variant="secondary"
                size="icon"
                onClick={handleDownload}
                className="overlay-btn"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </Button>
            )}

            {/* Delete button */}
            {canDelete && onDelete && (
              <Button
                variant="secondary"
                size="icon"
                onClick={() => {
                  toast.custom(
                    (t) => (
                      <div className="bg-card border border-border rounded-lg shadow-lg p-4 min-w-[320px] max-w-md">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                            <svg className="w-5 h-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1">
                              Hapus file "{fileName}"?
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              File yang dihapus tidak dapat dikembalikan.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => {
                              toast.dismiss(t);
                            }}
                            className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors"
                          >
                            Batal
                          </button>
                          <button
                            onClick={() => {
                              onDelete();
                              toast.dismiss(t);
                            }}
                            className="px-4 py-2 text-sm font-medium text-destructive-foreground bg-destructive hover:bg-destructive/90 rounded-md transition-colors"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ),
                    {
                      duration: 10000,
                    }
                  );
                }}
                className="overlay-btn text-destructive"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}

            {/* Close */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onOpenChange(false)}
              className="overlay-btn"
              title="Close"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="w-full h-full flex items-center justify-center p-20 pt-24">
          {renderPreview()}
        </div>

        {/* Keyboard Hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 opacity-50 hover:opacity-100 transition-opacity">
          <p className="text-card-foreground text-xs overlay-strong px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
            ESC to close
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}