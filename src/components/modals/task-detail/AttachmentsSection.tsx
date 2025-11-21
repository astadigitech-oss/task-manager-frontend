import {
  Download,
  LayoutGrid,
  List,
  Maximize2,
  Plus,
  MoreVertical,
  File,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { getFileIcon } from "@/lib/file-utils";

interface AttachmentsSectionProps {
  attachments: File[];
  restrictDownload: boolean;
  onRestrictDownloadChange: (value: boolean) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPreviewAttachment: (index: number) => void;
  onDownloadAttachment: (file: File) => void;
  onRemoveAttachment: (index: number) => void;
  readOnly?: boolean;
}

export function AttachmentsSection({
  attachments,
  restrictDownload,
  onRestrictDownloadChange,
  onFileUpload,
  onPreviewAttachment,
  onDownloadAttachment,
  onRemoveAttachment,
  readOnly = false,
}: AttachmentsSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-foreground">
          <h4 className="text-base font-semibold">Attachments</h4>
          {attachments.length > 0 && (
            <span className="text-sm text-muted">{attachments.length}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* <Button variant="ghost" size="icon" className="h-8 w-8" title="Download all">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Grid view">
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="List view">
            <List className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Fullscreen">
            <Maximize2 className="w-4 h-4" />
          </Button> */}
          <label htmlFor="file-upload">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              type="button"
              onClick={() => document.getElementById("file-upload")?.click()}
              title="Upload"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </label>
        </div>
        <input
          id="file-upload"
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
          className="hidden"
          onChange={onFileUpload}
        />
      </div>

      {/* Upload Drop Zone */}
      <div
        className="mb-4 p-8 border-2 border-dashed border-border rounded-lg surface hover:surface-hover transition-colors text-center cursor-pointer"
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <p className="text-sm text-muted">
          Drop your files here to <span className="underline">upload</span>
        </p>
      </div>

      {/* Restrict Download Toggle - Only for Admin */}
      {!readOnly && (
        <div className="flex items-center gap-2 mb-3">
          <Switch checked={restrictDownload} onCheckedChange={onRestrictDownloadChange} />
          <span className="text-sm text-muted">Restrict Download</span>
        </div>
      )}

      {/* Attachments Grid */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {attachments.map((file, index) => {
            const isImage = file.type.startsWith("image/");
            const isPDF = file.type === "application/pdf";
            const fileUrl = URL.createObjectURL(file);
            const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
            const timeAgo = "Just now";

            return (
              <div
                key={index}
                className="relative group surface-elevated rounded-lg overflow-hidden border border-border hover:border-border transition-all"
              >
                {/* Preview Image/Icon */}
                <div className="aspect-video bg-surface flex items-center justify-center relative">
                  {isImage ? (
                    <img
                      src={fileUrl}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-lg bg-destructive/20 flex items-center justify-center mb-2">
                        <span className="text-3xl">
                          {isPDF ? "📄" : getFileIcon(file.name)}
                        </span>
                      </div>
                      <span className="text-foreground text-xs font-semibold uppercase">
                        {fileExt}
                      </span>
                    </div>
                  )}

                  {/* Hover Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7 rounded-md button-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <MoreVertical className="h-4 w-4 text-foreground" />
                    </Button>
                  </div>

                  {/* Fullscreen / Preview Icon */}
                  <button
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40"
                    onClick={() => onPreviewAttachment(index)}
                  >
                    <div className="w-10 h-10 rounded-full bg-card/90 flex items-center justify-center">
                      <Maximize2 className="w-5 h-5 text-foreground" />
                    </div>
                  </button>

                  {/* File Type Badge (for non-images) */}
                  {!isImage && (
                    <div className="absolute bottom-2 right-2">
                      <div className="bg-card text-card-foreground text-xs px-2 py-1 rounded flex items-center gap-1">
                        <File className="w-3 h-3" />
                        <span className="uppercase font-semibold">{fileExt}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="p-3 surface-elevated flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-foreground truncate mb-1">
                      {file.name}
                    </h4>
                    <p className="text-xs text-muted">{timeAgo}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Download button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={restrictDownload}
                      className={
                        restrictDownload
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:surface-hover"
                      }
                      onClick={() => !restrictDownload && onDownloadAttachment(file)}
                      title={restrictDownload ? "Download restricted" : "Download"}
                    >
                      <Download className="w-4 h-4" />
                    </Button>

                    {/* Delete button - Only for Admin */}
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:surface-hover"
                        onClick={() => onRemoveAttachment(index)}
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {attachments.length === 0 && (
        <p className="text-center text-sm text-gray-500 py-4">No attachments yet</p>
      )}
    </div>
  );
}

