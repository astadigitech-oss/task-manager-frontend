"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

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
          className="w-full h-[80vh] rounded border border-gray-700 bg-white"
          title={fileName}
        />
      );
    }

    // ZIP / RAR – only show basic info
    if (["zip", "rar", "7z"].includes(ext)) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
          <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-4">
            <span className="text-5xl">🗜️</span>
          </div>
          <p className="text-xl font-semibold text-white mb-2">{fileName}</p>
          <p className="text-gray-400 mb-4">
            Preview tidak tersedia untuk file arsip.
          </p>
          {allowDownload && (
            <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
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
        <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-4">
          <span className="text-5xl">📎</span>
        </div>
        <p className="text-xl font-semibold text-white mb-2">{fileName}</p>
        <p className="text-gray-400 mb-1">
          No preview available for this file type.
        </p>
        <p className="text-sm text-gray-500 mb-4">
          File type: {ext.toUpperCase()}
        </p>
        {allowDownload && (
          <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Download File
          </Button>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-none !w-screen !h-screen p-0 overflow-hidden bg-[#0a0a0a] text-white !m-0 !rounded-none">
        <DialogTitle className="sr-only">{fileName}</DialogTitle>
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent">
          <div className="text-white">
            <h3 className="font-semibold text-lg">{fileName}</h3>
            <p className="text-sm text-gray-400">File type: {ext.toUpperCase()}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Download button */}
            {allowDownload && (
              <Button
                variant="secondary"
                size="icon"
                onClick={handleDownload}
                className="bg-gray-800/80 hover:bg-gray-700 backdrop-blur-sm"
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
                  if (confirm(`Delete ${fileName}?`)) {
                    onDelete();
                  }
                }}
                className="bg-red-900/80 hover:bg-red-800 backdrop-blur-sm"
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
              className="text-white hover:bg-white/20"
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
          <p className="text-white text-xs bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
            ESC to close
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}