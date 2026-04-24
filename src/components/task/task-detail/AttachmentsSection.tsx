import { useRef, useState } from "react";
import {
  Download,
  Plus,
  MoreVertical,
  Trash2,
  Maximize2,
  Loader2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { TaskImageApi } from "@/types/api/task.api";
import { resolveImageUrl } from "@/lib/helpers/imageUrlHelper";
import { cn } from "@/lib/utils/utils";
import { toast } from "sonner";

interface AttachmentsSectionProps {
  label?: string;
  images: TaskImageApi[];
  restrictDownload?: boolean;
  onRestrictDownloadChange?: (value: boolean) => void;
  onFileUpload: (files: File[]) => Promise<void>;
  onPreviewImage: (index: number) => void;
  onDownloadImage: (image: TaskImageApi) => void;
  onRemoveImage: (imageId: number) => void;
  readOnly?: boolean;
  isUploading?: boolean;
  uploadProgress?: number;
}

export function AttachmentsSection({
  label = "Images",
  images,
  restrictDownload = false,
  onRestrictDownloadChange = () => {},
  onFileUpload,
  onPreviewImage,
  onDownloadImage,
  onRemoveImage,
  readOnly = false,
  isUploading = false,
  uploadProgress = 0,
}: AttachmentsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // ================= PROCESS FILES =================
  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const maxSize = 5 * 1024 * 1024;

    fileArray.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} bukan file gambar`, {
          description: "Hanya file gambar yang diperbolehkan",
        });
        return;
      }

      if (file.size > maxSize) {
        toast.error(`${file.name} terlalu besar`, {
          description: "Ukuran maksimal file adalah 5MB",
        });
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length === 0) return;

    await onFileUpload(validFiles);
  };

  // ================= FILE SELECT =================
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    await processFiles(files);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ================= DRAG & DROP HANDLERS =================
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!readOnly && !isUploading) {
      setIsDragging(true);
    }
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (readOnly || isUploading) return;

    const files = e.dataTransfer.files;
    if (!files?.length) return;

    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
      toast.error("Tidak ada gambar", {
        description: "Silakan drop file gambar (JPEG, PNG, GIF, WebP)",
      });
      return;
    }

    if (imageFiles.length < files.length) {
      toast.warning("Beberapa file diabaikan", {
        description: "Hanya file gambar yang akan diproses",
      });
    }

    await processFiles(imageFiles);
  };

  const handleUploadClick = () => {
    if (!isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-foreground">
          <Label className="text-sm font-semibold">{label}</Label>
          {images.length > 0 && (
            <span className="text-sm text-muted-foreground">({images.length})</span>
          )}
        </div>
        <div className="flex items-center gap-2">
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
        </div>

        <input
          ref={fileInputRef}
          id="image-upload"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFileSelect}
          disabled={readOnly || isUploading}
        />
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Uploading images...</span>
            <span className="font-medium">{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Upload Drop Zone with Drag & Drop */}
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
                <span className="font-medium text-primary">Drop gambar di sini</span>
              ) : (
                <>
                  Drag & drop atau{" "}
                  <span className="underline font-medium">klik untuk upload</span>
                </>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supported: JPEG, PNG, GIF, WebP (Max 5MB)
            </p>
          </div>
        </div>
      )}

      {!readOnly && images.length > 0 && (
        <div className="flex items-center gap-2">
          <Switch
            checked={restrictDownload}
            onCheckedChange={onRestrictDownloadChange}
            disabled={isUploading}
          />
          <Label className="text-sm text-muted-foreground cursor-pointer">
            Restrict Download
          </Label>
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {images.map((image, index) => {
            if (!image.url) {
              console.warn("Image has no URL:", image);
              return null;
            }

            const imageUrl = resolveImageUrl(image.url);

            if (!imageUrl) {
              console.warn("Failed to resolve image URL:", image.url);
              return null;
            }

            const timeAgo = image.created_at
              ? new Date(image.created_at).toLocaleDateString()
              : "Just now";

            return (
              <div
                key={image.id}
                className="relative group bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all"
              >
                {/* Preview Image */}
                <div className="aspect-video bg-muted flex items-center justify-center relative">
                  <img
                    src={imageUrl}
                    alt={image.title || `Image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error("Failed to load image:", imageUrl);
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML =
                          '<div class="flex items-center justify-center text-muted-foreground"><p class="text-sm">Image not found</p></div>';
                      }
                    }}
                  />

                  {/* Hover Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7 rounded-md"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Fullscreen / Preview Icon */}
                  <button
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40"
                    onClick={() => onPreviewImage(index)}
                  >
                    <div className="w-10 h-10 rounded-full bg-card/90 flex items-center justify-center">
                      <Maximize2 className="w-5 h-5" />
                    </div>
                  </button>
                </div>

                {/* Image Info */}
                <div className="p-3 bg-card flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-foreground truncate mb-1">
                      {image.title || `Image ${index + 1}`}
                    </h4>
                    <p className="text-xs text-muted-foreground">{timeAgo}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Download button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={restrictDownload || isUploading}
                      onClick={() => !restrictDownload && onDownloadImage(image)}
                      title={restrictDownload ? "Download restricted" : "Download"}
                    >
                      <Download className="w-4 h-4" />
                    </Button>

                    {/* Delete button */}
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-destructive"
                        onClick={() => onRemoveImage(image.id)}
                        title="Remove"
                        disabled={isUploading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          }).filter(Boolean)}
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground py-4 border rounded-lg">
          No images yet
        </p>
      )}
    </div>
  );
}