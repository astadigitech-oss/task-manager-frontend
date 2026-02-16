"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils/utils";
import { showErrorToast, showSuccessToast } from "@/lib/helpers/toast-helpers";
import { workspaceAttendanceService } from "@/services/workspaces/workspaceAttadance.service";
import {
  Upload,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Download,
  Calendar,
  CheckCircle2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AbsensiDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DRAFT_DEBOUNCE_MS = 600; // simpan draft 600ms setelah user berhenti mengetik

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function msUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

function formatDateForFilename(date: string): string {
  return date.replace(/-/g, "");
}

function extractErrorMessage(error: any): string {
  console.error("Full error object:", error);

  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (typeof error?.response?.data === "string") return error.response.data;
  if (error?.message && !error.message.toLowerCase().includes("request failed"))
    return error.message;

  return "Anda Sudah Melakukan Absensi Hari Ini.";
}

// ─── Component ────────────────────────────────────────────────────────────────
export function AbsensiDialog({ isOpen, onClose }: AbsensiDialogProps) {
  const { selectedWorkspaceId, selectedWorkspace } = useWorkspace();
  const {
    user,
    saveAttendance,
    getAttendance,
    hasSubmittedToday,
    clearExpiredAttendance,
    saveDraft,
    getDraft,
    clearDraft,
    clearExpiredDrafts,
  } = useAuthStore();

  const isAdmin = user?.role === "admin";

  const hasSubmitted = selectedWorkspaceId
    ? hasSubmittedToday(selectedWorkspaceId)
    : false;
  const savedAttendance = selectedWorkspaceId
    ? getAttendance(selectedWorkspaceId)
    : null;

  // ── Form state ───────────────────────────────────────────────────────────────
  const [activity, setActivity] = useState("");
  const [obstacle, setObstacle] = useState("");

  // ── Export state (admin only) ─────────────────────────────────────────────────
  const [exportDate, setExportDate] = useState<string>(getTodayDateString());
  const [isExporting, setIsExporting] = useState(false);

  // ── Image state ──────────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // ── Submit state ─────────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // ── Draft auto-save (debounced) ───────────────────────────────────────────────
  // Ref untuk debounce timer
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Dipanggil setiap kali activity/obstacle/previews berubah.
   * Hanya simpan jika belum submit dan workspace sudah dipilih.
   */
  const scheduleDraftSave = useCallback(
    (newActivity: string, newObstacle: string, newPreviews: string[]) => {
      if (!selectedWorkspaceId || hasSubmitted) return;

      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);

      draftTimerRef.current = setTimeout(() => {
        saveDraft(selectedWorkspaceId, {
          activity: newActivity,
          obstacle: newObstacle,
          previews: newPreviews,
        });
      }, DRAFT_DEBOUNCE_MS);
    },
    [selectedWorkspaceId, hasSubmitted, saveDraft]
  );

  // Cleanup timer saat unmount
  useEffect(() => {
    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, []);

  // ── Load state saat dialog dibuka ────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !selectedWorkspaceId) return;

    if (hasSubmitted && savedAttendance) {
      // Tampilkan data yang sudah disubmit (read-only)
      setActivity(savedAttendance.activity);
      setObstacle(savedAttendance.obstacle);
      setPreviews(savedAttendance.previews || []);
    } else if (!hasSubmitted) {
      // Coba load draft hari ini
      const draft = getDraft(selectedWorkspaceId);
      if (draft) {
        setActivity(draft.activity);
        setObstacle(draft.obstacle);
        setPreviews(draft.previews || []);
        // File[] tidak bisa di-restore dari storage, hanya preview-nya
        // selectedFiles tetap kosong → user perlu upload ulang jika perlu foto
      } else {
        resetFormFields();
      }
    }
  }, [isOpen, selectedWorkspaceId, hasSubmitted]);

  // ── Midnight auto-reset ──────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      clearExpiredAttendance();
      clearExpiredDrafts();
      resetFormFields();
    }, msUntilMidnight());
    return () => clearTimeout(timer);
  }, [clearExpiredAttendance, clearExpiredDrafts]);

  // ── Field change handlers (trigger draft auto-save) ──────────────────────────
  const handleActivityChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setActivity(val);
    scheduleDraftSave(val, obstacle, previews);
  };

  const handleObstacleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setObstacle(val);
    scheduleDraftSave(activity, val, previews);
  };

  // ── File helpers ──────────────────────────────────────────────────────────────
  const validateAndAdd = useCallback(
    (files: File[]) => {
      if (hasSubmitted) {
        showErrorToast("Anda sudah melakukan absensi hari ini");
        return;
      }

      if (selectedFiles.length > 0) {
        showErrorToast("Hanya 1 file gambar yang diperbolehkan");
        return;
      }

      if (files.length > 1) {
        showErrorToast("Hanya 1 file gambar yang diperbolehkan");
        return;
      }

      const valid: File[] = [];
      files.forEach((f) => {
        if (!ACCEPTED_TYPES.includes(f.type)) {
          showErrorToast(`${f.name} bukan format yang didukung (JPEG/PNG/WebP)`);
          return;
        }
        if (f.size > MAX_FILE_SIZE) {
          showErrorToast(`${f.name} melebihi batas 1MB`);
          return;
        }
        valid.push(f);
      });

      if (!valid.length) return;

      setSelectedFiles((p) => [...p, ...valid]);

      valid.forEach((f) => {
        const r = new FileReader();
        r.onload = () => {
          if (r.result) {
            const newPreview = r.result as string;
            setPreviews((p) => {
              const updated = [...p, newPreview];
              // Simpan draft dengan preview baru
              scheduleDraftSave(activity, obstacle, updated);
              return updated;
            });
          }
        };
        r.readAsDataURL(f);
      });
    },
    [hasSubmitted, selectedFiles.length, activity, obstacle, scheduleDraftSave]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) validateAndAdd(Array.from(e.target.files));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (idx: number) => {
    if (hasSubmitted) return;
    setSelectedFiles((p) => p.filter((_, i) => i !== idx));
    setPreviews((p) => {
      const updated = p.filter((_, i) => i !== idx);

      scheduleDraftSave(activity, obstacle, updated);
      return updated;
    });
    setCurrentIndex((p) => Math.max(0, Math.min(p, selectedFiles.length - 2)));
  };

  // ── Drag & drop ───────────────────────────────────────────────────────────────
  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSubmitting && !hasSubmitted && selectedFiles.length === 0)
      setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const r = e.currentTarget.getBoundingClientRect();
    if (
      e.clientX <= r.left ||
      e.clientX >= r.right ||
      e.clientY <= r.top ||
      e.clientY >= r.bottom
    )
      setIsDragging(false);
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isSubmitting || hasSubmitted || selectedFiles.length > 0) return;
    const imgs = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (!imgs.length) {
      showErrorToast("Tidak ada gambar yang valid");
      return;
    }
    validateAndAdd(imgs);
  };

  // ── Reset & close ─────────────────────────────────────────────────────────────
  const resetFormFields = () => {
    setActivity("");
    setObstacle("");
    setSelectedFiles([]);
    setPreviews([]);
    setCurrentIndex(0);
    setUploadProgress(0);
    setExportDate(getTodayDateString());
  };

  const handleClose = () => {
    if (!isSubmitting && !isExporting) {
      // Draft sudah tersimpan otomatis di Zustand → tidak perlu reset
      // Hanya reset kalau belum submit DAN form kosong total
      if (!hasSubmitted && !activity.trim() && !obstacle.trim() && previews.length === 0) {
        if (selectedWorkspaceId) clearDraft(selectedWorkspaceId);
      }
      onClose();
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasSubmitted) {
      showErrorToast("Anda sudah melakukan absensi hari ini");
      return;
    }

    if (!selectedWorkspaceId) {
      showErrorToast("Workspace belum dipilih");
      return;
    }
    if (!activity.trim()) {
      showErrorToast("Kegiatan tidak boleh kosong");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const res = await workspaceAttendanceService.submit(
        selectedWorkspaceId,
        {
          activity: activity.trim(),
          obstacle: obstacle.trim(),
        },
        selectedFiles.length > 0 ? selectedFiles : undefined
      );

      if (!res.success || !res.data) {
        throw new Error(res.message || "Gagal absensi");
      }

      if (selectedFiles.length > 0) {
        setUploadProgress(100);
      }

      // Simpan ke submitted store (sekaligus hapus draft otomatis)
      saveAttendance(selectedWorkspaceId, {
        activity: activity.trim(),
        obstacle: obstacle.trim(),
        images: selectedFiles,
        previews: previews,
      });

      showSuccessToast(`Absensi berhasil! Selamat bekerja, ${user?.name ?? ""}!`);
      onClose();
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      showErrorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Export PDF (admin only) ───────────────────────────────────────────────────
  const handleExportPdf = async () => {
    if (!selectedWorkspaceId) {
      showErrorToast("Workspace belum dipilih");
      return;
    }
    if (!exportDate) {
      showErrorToast("Pilih tanggal export terlebih dahulu");
      return;
    }

    setIsExporting(true);
    try {
      const blob = await workspaceAttendanceService.export(
        selectedWorkspaceId,
        exportDate
      );

      const workspaceName = selectedWorkspace?.name || "workspace";
      const sanitizedName = workspaceName
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .substring(0, 30);
      const dateFormatted = formatDateForFilename(exportDate);
      const filename = `${sanitizedName}_absensi_${dateFormatted}.pdf`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.style.display = "none";

      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      showSuccessToast(`Laporan absensi ${exportDate} berhasil diunduh!`);
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      showErrorToast(errorMessage || "Gagal mengekspor laporan absensi.");
    } finally {
      setIsExporting(false);
    }
  };

  // ── Pagination ────────────────────────────────────────────────────────────────
  const visible = previews.slice(currentIndex, currentIndex + 4);
  const canPrev = currentIndex > 0;
  const canNext = currentIndex + 4 < previews.length;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(o) => {
        if (!o) handleClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl p-0 gap-0 overflow-hidden max-h-[92vh] flex flex-col"
        aria-describedby="absensi-desc"
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            Daily Attendance
            {hasSubmitted && (
              <span className="ml-auto flex items-center gap-1.5 text-sm font-normal text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                Sudah Absen
              </span>
            )}
            {/* Indikator draft tersimpan */}
            {!hasSubmitted && selectedWorkspaceId && getDraft(selectedWorkspaceId) && (
              <span className="ml-auto text-xs text-muted-foreground font-normal">
                Draft tersimpan
              </span>
            )}
          </DialogTitle>
          <DialogDescription id="absensi-desc">
            {selectedWorkspace?.name
              ? `Workspace: ${selectedWorkspace.name}`
              : "Isi form untuk melakukan absensi hari ini"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="space-y-5 py-5 px-6 overflow-y-auto flex-1">

            {/* Daily Limit Alert */}
            <div className=" flex items-start">
              <p className="text-xs text-mudted-foreground">
                <span className="font-semibold">Note:</span> Absensi hanya dapat dilakukan <span className="font-semibold">1 kali per hari</span>
              </p>
            </div>

            {/* Success Message */}
            {hasSubmitted && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">
                    Absensi Hari Ini Sudah Tercatat
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Anda sudah melakukan absensi untuk workspace ini. Silakan
                    coba lagi besok.
                  </p>
                </div>
              </div>
            )}

            {/* Draft info banner */}
            {!hasSubmitted && selectedWorkspaceId && getDraft(selectedWorkspaceId) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between gap-3">
                <p className="text-xs text-blue-700">
                  Draft ditemukan dan sudah dimuat. Form akan tersimpan otomatis
                  saat Anda mengetik.
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-blue-600 hover:text-blue-800 shrink-0 px-2"
                  onClick={() => {
                    if (selectedWorkspaceId) clearDraft(selectedWorkspaceId);
                    resetFormFields();
                  }}
                >
                  Reset
                </Button>
              </div>
            )}

            {/* Nama – readonly */}
            <div className="space-y-2">
              <Label htmlFor="nama">Nama</Label>
              <Input
                id="nama"
                value={user?.name ?? ""}
                readOnly
                disabled
                className="bg-muted text-muted-foreground cursor-not-allowed"
              />
            </div>

            {/* Kegiatan */}
            <div className="space-y-2">
              <Label htmlFor="activity">
                Kegiatan yang Dilakukan{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="activity"
                value={activity}
                onChange={handleActivityChange}
                placeholder="Deskripsikan kegiatan yang dilakukan hari ini..."
                rows={3}
                disabled={isSubmitting || hasSubmitted}
                className="min-h-20 resize-none"
                required
                readOnly={hasSubmitted}
              />
            </div>

            {/* Kendala */}
            <div className="space-y-2">
              <Label htmlFor="obstacle">Kendala yang Dihadapi</Label>
              <Textarea
                id="obstacle"
                value={obstacle}
                onChange={handleObstacleChange}
                placeholder="Deskripsikan kendala yang dihadapi (opsional)..."
                rows={3}
                disabled={isSubmitting || hasSubmitted}
                className="min-h-20 resize-none"
                readOnly={hasSubmitted}
              />
            </div>

            {/* Bukti Foto */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>
                  Bukti Foto{" "}
                  <span className="text-destructive">*</span>
                  {previews.length > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground font-normal">
                      ({previews.length} foto)
                    </span>
                  )}
                </Label>
                {previews.length > 0 && !hasSubmitted && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground"
                    onClick={() => {
                      setSelectedFiles([]);
                      setPreviews([]);
                      setCurrentIndex(0);
                      // Update draft tanpa foto
                      if (selectedWorkspaceId) {
                        saveDraft(selectedWorkspaceId, {
                          activity,
                          obstacle,
                          previews: [],
                        });
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    Hapus semua
                  </Button>
                )}
              </div>

              {/* Drop Zone */}
              {!hasSubmitted && (
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center transition-all",
                    isDragging
                      ? "border-primary bg-primary/5 scale-[1.01]"
                      : "border-border bg-muted/30 hover:bg-muted/50",
                    isSubmitting || selectedFiles.length > 0
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  )}
                  onClick={() =>
                    !isSubmitting &&
                    selectedFiles.length === 0 &&
                    fileInputRef.current?.click()
                  }
                  onDragEnter={
                    selectedFiles.length === 0 ? onDragEnter : undefined
                  }
                  onDragOver={
                    selectedFiles.length === 0 ? onDragOver : undefined
                  }
                  onDragLeave={
                    selectedFiles.length === 0 ? onDragLeave : undefined
                  }
                  onDrop={selectedFiles.length === 0 ? onDrop : undefined}
                >
                  <Upload
                    className={cn(
                      "w-7 h-7 mx-auto mb-2 text-muted-foreground transition-transform",
                      isDragging && "scale-110 text-primary"
                    )}
                  />
                  <p className="text-sm text-muted-foreground">
                    {isDragging ? (
                      <span className="font-medium text-primary">
                        Drop gambar di sini
                      </span>
                    ) : (
                      <>
                        Drag & drop atau{" "}
                        <span className="underline font-medium">
                          klik untuk upload
                        </span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPEG, PNG, WebP • Maks 1MB per file
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                className="hidden"
                onChange={handleFileSelect}
                disabled={
                  isSubmitting || hasSubmitted || selectedFiles.length > 0
                }
              />

              {/* Upload progress */}
              {isSubmitting && uploadProgress > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Mengupload foto...</span>
                    <span className="font-medium">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-1.5" />
                </div>
              )}

              {/* Preview grid */}
              {previews.length > 0 && (
                <div className="space-y-2">
                  <div className="relative flex items-center gap-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 shrink-0"
                      disabled={!canPrev || isSubmitting || hasSubmitted}
                      onClick={() =>
                        setCurrentIndex((p) => Math.max(0, p - 4))
                      }
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <div className="grid grid-cols-4 gap-2 flex-1">
                      {visible.map((src, i) => {
                        const ri = currentIndex + i;
                        return (
                          <div
                            key={ri}
                            className="relative aspect-square rounded-md overflow-hidden border border-border group"
                          >
                            <img
                              src={src}
                              alt={`Preview ${ri + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {!isSubmitting && !hasSubmitted && (
                              <button
                                type="button"
                                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeImage(ri)}
                              >
                                <div className="w-8 h-8 rounded-full bg-destructive/90 flex items-center justify-center">
                                  <Trash2 className="w-4 h-4 text-white" />
                                </div>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 shrink-0"
                      disabled={!canNext || isSubmitting || hasSubmitted}
                      onClick={() =>
                        setCurrentIndex((p) =>
                          Math.min(previews.length - 1, p + 4)
                        )
                      }
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {previews.length > 4 && (
                    <p className="text-xs text-center text-muted-foreground">
                      {currentIndex + 1}–
                      {Math.min(currentIndex + 4, previews.length)} dari{" "}
                      {previews.length} foto
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ── Export PDF – Admin Only ── */}
            {isAdmin && (
              <div className="space-y-3 pt-2 border-t">
                <div>
                  <Label className="text-sm font-semibold">
                    Export PDF Laporan Absensi
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Download laporan absensi seluruh anggota berdasarkan
                    tanggal.
                  </p>
                </div>

                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="date"
                      value={exportDate}
                      onChange={(e) => setExportDate(e.target.value)}
                      max={getTodayDateString()}
                      disabled={isExporting || isSubmitting}
                      className="pl-9 bg-background"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleExportPdf}
                    disabled={isExporting || isSubmitting || !exportDate}
                    className="shrink-0 gap-1.5"
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {isExporting ? "Memproses..." : "Export PDF"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 border-t mt-0 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting || isExporting}
            >
              {hasSubmitted ? "Tutup" : "Batal"}
            </Button>
            {!hasSubmitted && (
              <Button
                type="submit"
                disabled={isSubmitting || !activity.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    Save
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}