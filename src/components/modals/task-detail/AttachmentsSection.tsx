"use client";

import { Button } from "@/components/ui/button";
import { Download, LayoutGrid, List, Maximize2, MoreVertical, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { File } from "lucide-react";
import type { Task } from "@/types";

interface Props {
  attachments: File[] | any[];
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePreviewAttachment: (index: number) => void;
  handleDownloadAttachment: (file: File) => void;
  removeAttachment: (index: number) => void;
  restrictDownload: boolean;
  setRestrictDownload: (val: boolean) => void;
}

export default function AttachmentsSection({
  attachments,
  handleFileUpload,
  handlePreviewAttachment,
  handleDownloadAttachment,
  removeAttachment,
  restrictDownload,
  setRestrictDownload,
}: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-gray-700">
          <h4 className="text-base font-semibold">Attachments</h4>
          {attachments.length > 0 && <span className="text-sm text-gray-500">{attachments.length}</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Download all">
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
          </Button>
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
          onChange={handleFileUpload}
        />
      </div>

      <div
        className="mb-4 p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-colors text-center cursor-pointer"
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <p className="text-sm text-gray-600">
          Drop your files here to <span className="underline">upload</span>
        </p>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <input type="checkbox" checked={restrictDownload} onChange={(e) => setRestrictDownload(e.target.checked)} />
        <span className="text-sm text-gray-700">Restrict Download</span>
      </div>

      {attachments.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {attachments.map((file: any, index: number) => {
            const isImage = file.type?.startsWith?.("image/");
            const isPDF = file.type === "application/pdf";
            const fileUrl = URL.createObjectURL(file);
            const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
            const timeAgo = "Just now";

            return (
              <div key={index} className="relative group bg-black rounded-lg overflow-hidden border border-gray-800 hover:border-gray-600 transition-all">
                <div className="aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center relative">
                  {isImage ? (
                    <img src={fileUrl} alt={file.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-lg bg-red-900/50 flex items-center justify-center mb-2">
                        <span className="text-3xl">{isPDF ? "📄" : "📎"}</span>
                      </div>
                      <span className="text-white text-xs font-semibold uppercase">{fileExt}</span>
                    </div>
                  )}

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7 rounded-md bg-gray-800/80 hover:bg-gray-700 backdrop-blur-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <MoreVertical className="h-4 w-4 text-white" />
                    </Button>
                  </div>

                  <button
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40"
                    onClick={() => handlePreviewAttachment(index)}
                  >
                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                      <Maximize2 className="w-5 h-5 text-gray-900" />
                    </div>
                  </button>

                  {!isImage && (
                    <div className="absolute bottom-2 right-2">
                      <div className="bg-gray-800/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                        <File className="w-3 h-3" />
                        <span className="uppercase font-semibold">{fileExt}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-gray-900 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-white truncate mb-1">{file.name}</h4>
                    <p className="text-xs text-gray-400">{timeAgo}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={restrictDownload}
                      className={restrictDownload ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-800/80"}
                      onClick={() => !restrictDownload && handleDownloadAttachment(file)}
                      title={restrictDownload ? "Download restricted" : "Download"}
                    >
                      <Download className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-gray-800/80"
                      onClick={() => removeAttachment(index)}
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-sm text-gray-500 py-4">No attachments yet</p>
      )}
    </div>
  );
}
