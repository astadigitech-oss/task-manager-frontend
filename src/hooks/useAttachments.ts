import { useState, useMemo } from "react";
import { isImageFile, isPDFFile, downloadFile } from "@/lib/file-utils";
import { toast } from "sonner";

interface UseAttachmentsProps {
  onChangeCallback?: () => void;
}

export function useAttachments({ onChangeCallback }: UseAttachmentsProps = {}) {
  const [attachments, setAttachments] = useState<File[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfData, setPdfData] = useState<{ url: string; name: string } | null>(null);
  const [restrictDownload, setRestrictDownload] = useState(false);

  // Build array of image URLs only for image lightbox
  const imageAttachments = useMemo(() => {
    return attachments
      .map((file) => ({ file, url: URL.createObjectURL(file) }))
      .filter((f) => isImageFile(f.file))
      .map((f) => f.url);
  }, [attachments]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      // Validasi
      if (newFiles.length === 0) {
        toast.error("Tidak ada file yang dipilih!", {
          description: "Silakan pilih file untuk diupload.",
        });
        return;
      }

      // Validasi ukuran file (max 10MB per file)
      const maxSize = 10 * 1024 * 1024; // 10MB
      const oversizedFiles = newFiles.filter(file => file.size > maxSize);

      if (oversizedFiles.length > 0) {
        toast.error("File terlalu besar!", {
          description: `${oversizedFiles.length} file melebihi batas 10MB.`,
        });
        return;
      }

      setAttachments((prev) => [...prev, ...newFiles]);
      onChangeCallback?.();

      toast.success("File berhasil diupload!", {
        description: `${newFiles.length} file telah ditambahkan.`,
      });
    }
  };

  const removeAttachment = (index: number) => {
    const file = attachments[index];
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    onChangeCallback?.();

    toast.success("File berhasil dihapus!", {
      description: `${file?.name || 'File'} telah dihapus.`,
    });
  };

  const handlePreviewAttachment = (index: number) => {
    const file = attachments[index];
    if (!file) return;

    if (isImageFile(file)) {
      const imagesBefore = attachments.slice(0, index).filter(isImageFile).length;
      setLightboxIndex(imagesBefore);
      setLightboxOpen(true);
      return;
    }

    if (isPDFFile(file)) {
      const pdfUrl = URL.createObjectURL(file);
      setPdfData({ url: pdfUrl, name: file.name });
      setPdfOpen(true);
      return;
    }

    // For other files, fallback: try to open in new tab / trigger download
    const url = URL.createObjectURL(file);
    if (restrictDownload) {
      toast.error("Download dibatasi!", {
        description: "File ini tidak dapat didownload.",
      });
      URL.revokeObjectURL(url);
      return;
    }
    window.open(url, "_blank");
  };

  const handleDownloadAttachment = (file: File) => {
    if (restrictDownload) {
      toast.error("Download dibatasi!", {
        description: "File ini tidak dapat didownload.",
      });
      return;
    }

    try {
      downloadFile(file);
      toast.success("File berhasil didownload!", {
        description: `${file.name} telah didownload.`,
      });
    } catch (error) {
      toast.error("Gagal download file", {
        description: "Terjadi kesalahan saat mendownload file.",
      });
    }
  };

  return {
    attachments,
    setAttachments,
    lightboxOpen,
    setLightboxOpen,
    lightboxIndex,
    setLightboxIndex,
    pdfOpen,
    setPdfOpen,
    pdfData,
    setPdfData,
    restrictDownload,
    setRestrictDownload,
    imageAttachments,
    handleFileUpload,
    removeAttachment,
    handlePreviewAttachment,
    handleDownloadAttachment,
  };
}

