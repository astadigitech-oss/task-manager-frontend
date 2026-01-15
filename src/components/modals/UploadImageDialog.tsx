"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Upload,
  Trash2,
} from "lucide-react";
import { ImageLightBoxModal } from "@/components/modals/ImageLightBoxModal";
import { projectImageService } from "@/services/projects/projectImage.service";
import { useUploadProjectImage } from "@/hooks/project/useUploadProjectImages";
import { cn } from "@/lib/utils/utils";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast
} from "@/lib/helpers/toast-helpers";

interface UploadImageDialogProps {
  project_id: number;
  existingImages?: string[];
  onUpload?: () => void;
}

export function UploadImageDialog({
  project_id,
  existingImages = [],
  onUpload,
}: UploadImageDialogProps) {
  const [open, setOpen] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadProjectImage(project_id);

  // ================= PROCESS FILES =================
  const processFiles = (files: FileList | File[]) => {
    const validFiles: File[] = [];
    const fileArray = Array.from(files);

    fileArray.forEach((file) => {
      const validation = projectImageService.validateFile(file);
      if (!validation.valid) {
        showErrorToast(file.name, validation.error);
      } else {
        validFiles.push(file);
      }
    });

    if (!validFiles.length) return;

    setSelectedFiles((prev) => [...prev, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setPreviews((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    showSuccessToast(
      `${validFiles.length} gambar siap diupload`,
      "File telah ditambahkan ke daftar upload"
    );
  };

  // ================= FILE SELECT =================
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    processFiles(files);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ================= DRAG & DROP HANDLERS =================
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (
      x <= rect.left ||
      x >= rect.right ||
      y <= rect.top ||
      y >= rect.bottom
    ) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files?.length) return;

    const imageFiles = Array.from(files).filter(file =>
      file.type.startsWith('image/')
    );

    if (imageFiles.length === 0) {
      showErrorToast(
        "Tidak ada gambar",
        "Silakan drop file gambar (JPEG, PNG, GIF, WebP)"
      );
      return;
    }

    if (imageFiles.length < files.length) {
      showWarningToast(
        "Beberapa file diabaikan",
        "Hanya file gambar yang akan diproses"
      );
    }

    processFiles(imageFiles);
  };

  // ================= REMOVE =================
  const handleRemoveImage = (index: number) => {
    const fileName = selectedFiles[index]?.name || `Gambar ${index + 1}`;

    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setCurrentIndex((prev) => Math.max(0, prev - 1));

    showSuccessToast(
      "File dihapus",
      `${fileName} telah dihapus dari daftar upload`
    );
  };

  // ================= UPLOAD =================
  const handleUpload = async () => {
    if (!selectedFiles.length) return;

    setIsUploading(true);
    setProgress(0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        await uploadMutation.mutateAsync(selectedFiles[i]);
        setProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      }

      showSuccessToast(
        "Upload selesai!",
        `${selectedFiles.length} gambar berhasil diupload`
      );

      onUpload?.();
      setOpen(false);
      setSelectedFiles([]);
      setPreviews([]);
      setCurrentIndex(0);
    } catch (error) {
      showErrorToast(
        "Upload gagal",
        "Terjadi kesalahan saat mengupload gambar"
      );
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const visiblePreviews = previews.slice(currentIndex, currentIndex + 4);
  const allImages = [...existingImages, ...previews];

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-1" /> Image
          </Button>
        </DialogTrigger>

        <DialogContent
          className="max-w-xl sm:max-w-300 flex flex-col p-0"
          style={{ height: '640px' }}
        >
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Upload Project Images</DialogTitle>
          </DialogHeader>

          <div className="flex-1 p-4 space-y-4 overflow-hidden">
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isUploading}
            />

            {/* Upload Area with Drag & Drop */}
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                isDragging && "border-primary bg-primary/5",
                isUploading && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className={cn(
                "mx-auto mb-2 transition-transform",
                isDragging && "scale-110 text-primary"
              )} />
              <p className="font-medium">
                {isUploading
                  ? `Uploading... ${progress}%`
                  : isDragging
                    ? "Drop gambar di sini"
                    : "Drag & drop atau klik untuk upload"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPEG, PNG, GIF, WebP • Max 5MB
              </p>
            </div>
            
            {/* Preview */}
            {previews.length > 0 && (
              <div className="relative flex items-center gap-4">
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((p) => Math.max(0, p - 4))}
                >
                  <ChevronLeft />
                </Button>

                <div className="grid grid-cols-4 gap-4 flex-1">
                  {visiblePreviews.map((img, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded overflow-hidden"
                    >
                      <img
                        src={img}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => {
                          setLightboxIndex(currentIndex + i);
                          setLightboxOpen(true);
                        }}
                        alt={`Preview ${currentIndex + i + 1}`}
                      />
                      {!isUploading && (
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-1 right-1"
                          onClick={() =>
                            handleRemoveImage(currentIndex + i)
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  disabled={currentIndex + 4 >= previews.length}
                  onClick={() =>
                    setCurrentIndex((p) => Math.min(previews.length - 1, p + 4))
                  }
                >
                  <ChevronRight />
                </Button>
              </div>
            )}
          </div>

          <div className="border-t p-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFiles.length || isUploading}
            >
              {isUploading
                ? `Uploading ${progress}%`
                : `Upload (${selectedFiles.length})`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ImageLightBoxModal
        images={allImages}
        open={lightboxOpen}
        initialIndex={lightboxIndex}
        onOpenChange={setLightboxOpen}
        canDelete={false}
      />
    </>
  );
}