"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileText, CheckCircle2, Clock, AlertTriangle, FileDown } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import type { TaskApi } from "@/types/api/task.api";
import { useExportPDF } from "@/hooks/useExport";
import { showSuccessToast, showErrorToast } from "@/lib/helpers/toast-helpers";
import type { ExportType } from "@/hooks/useExport";
import {
    getExportData,
    formatTaskDeadline
} from "@/lib/helpers/export_data.helpers";

interface ExportTasksModalProps {
    projectId: number;
    projectName: string;
    tasks: TaskApi[];
}

export function ExportTasksModal({ projectId, projectName, tasks }: ExportTasksModalProps) {
    const [open, setOpen] = useState(false);
    const [exportType, setExportType] = useState<ExportType>("weekly-backward");
    const { downloadPDF, loading, progress, error } = useExportPDF();

    // ============================================
    // HANDLERS
    // ============================================

    const handleExportPDF = async () => {

        const result = await downloadPDF(
            {
                project_id: projectId,
                export_type: exportType,
                date: exportType === "daily" ? format(new Date(), "yyyy-MM-dd") : undefined,
            },
            projectName // Pass projectName untuk generate filename
        );

        if (result.success) {
            showSuccessToast(`PDF "${result.filename}" berhasil diunduh.`);
            setOpen(false);
        } else {
            showErrorToast(result.error?.message || "Gagal mengekspor PDF");
        }
    };

    const handleExportText = () => {
        const data = getExportData(exportType, tasks, projectId);

        let text = `PROJECT TASK EXPORT\n${"=".repeat(50)}\n\n`;
        text += `Project: ${projectName}\n`;
        text += `Export Type: ${exportType.toUpperCase()}\n`;
        text += `Period: ${data.period}\n`;
        text += `Generated: ${format(new Date(), "MMMM dd, yyyy 'at' HH:mm")}\n\n`;
        text += `${"=".repeat(50)}\n\n`;

        // Daily Format
        if (data.type === "daily") {
            text += `TODAY'S TASKS (${data.tasks.length})\n`;
            text += `${"-".repeat(50)}\n\n`;

            if (data.tasks.length === 0) {
                text += `No tasks due today.\n\n`;
            } else {
                data.tasks.forEach((task, i) => {
                    text += `${i + 1}. ${task.title}\n`;
                    text += `   Status: ${task.status.toUpperCase()}\n`;
                    text += `   Priority: ${task.priority.toUpperCase()}\n`;
                    text += `   Deadline: ${formatTaskDeadline(task)}\n`;
                    if (task.description) text += `   Description: ${task.description}\n`;
                    text += `\n`;
                });
            }
        }

        // Weekly Format
        if (data.type === "weekly") {
            text += `WEEKLY SUMMARY\n`;
            text += `${"-".repeat(50)}\n\n`;

            text += `IN PROGRESS (${data.inProgress.length} tasks)\n\n`;
            data.inProgress.forEach((task, i) => {
                text += `${i + 1}. ${task.title}\n`;
                text += `   Status: ${task.status.toUpperCase()}\n`;
                text += `   Priority: ${task.priority.toUpperCase()}\n`;
                text += `   Deadline: ${formatTaskDeadline(task)}\n`;
                text += `\n`;
            });

            text += `\nCOMPLETED (${data.completed.length} tasks)\n\n`;
            data.completed.forEach((task, i) => {
                text += `${i + 1}. ${task.title}\n`;
                text += `   Priority: ${task.priority.toUpperCase()}\n`;
                text += `   Deadline: ${formatTaskDeadline(task)}\n`;
                if (task.finished_at) {
                    text += `   Finished: ${format(new Date(task.finished_at), "MMM dd, yyyy 'at' HH:mm")}\n`;
                }
                if (task.is_overdue) text += `   ⚠ COMPLETED LATE\n`;
                text += `\n`;
            });

            if (data.overdue.length > 0) {
                text += `\nOVERDUE COMPLETIONS (${data.overdue.length} tasks)\n\n`;
                data.overdue.forEach((task, i) => {
                    text += `${i + 1}. ${task.title}\n`;
                    text += `   Deadline: ${formatTaskDeadline(task)}\n`;
                    if (task.finished_at) {
                        text += `   Finished: ${format(new Date(task.finished_at), "MMM dd 'at' HH:mm")}\n`;
                    }
                    text += `\n`;
                });
            }
        }

        // Agenda Format
        if (data.type === "agenda") {
            text += `AGENDA (2 WEEKS VIEW)\n`;
            text += `${"-".repeat(50)}\n\n`;

            text += `PAST WEEK\n${"-".repeat(30)}\n\n`;
            text += `Completed (${data.past.completed.length})\n`;
            data.past.completed.forEach((task, i) => {
                text += `  ${i + 1}. ${task.title}\n`;
                if (task.finished_at) {
                    text += `     Finished: ${format(new Date(task.finished_at), "MMM dd 'at' HH:mm")}\n`;
                }
                if (task.is_overdue) text += `     ⚠ Late\n`;
            });

            text += `\nIn Progress (${data.past.inProgress.length})\n`;
            data.past.inProgress.forEach((task, i) => {
                text += `  ${i + 1}. ${task.title} - ${task.status.toUpperCase()}\n`;
            });

            text += `\n\nUPCOMING WEEK\n${"-".repeat(30)}\n\n`;
            text += `Starting Soon (${data.upcoming.starting.length})\n`;
            data.upcoming.starting.forEach((task, i) => {
                text += `  ${i + 1}. ${task.title}\n`;
                if (task.start_date) {
                    text += `     Starts: ${format(new Date(task.start_date), "MMM dd, yyyy")}\n`;
                }
                text += `     Due: ${formatTaskDeadline(task)}\n`;
            });

            text += `\nDue Soon (${data.upcoming.due.length})\n`;
            data.upcoming.due.forEach((task, i) => {
                text += `  ${i + 1}. ${task.title}\n`;
                text += `     Due: ${formatTaskDeadline(task)}\n`;
                text += `     Priority: ${task.priority.toUpperCase()}\n`;
            });
        }

        text += `\n${"=".repeat(50)}\nEnd of Report\n`;

        // Download text file
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${projectName}_${exportType}_${format(new Date(), "yyyyMMdd")}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showSuccessToast("Text file berhasil diunduh");
        setOpen(false);
    };

    // Get preview data (gunakan helper yang sama)
    const previewData = getExportData(exportType, tasks, projectId);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export Tasks
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Export Project Tasks
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    {/* Export Type Selector */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">Export Type</label>
                        <Select
                            value={exportType}
                            onValueChange={(v) => setExportType(v as ExportType)}
                            disabled={loading}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily - Today's Tasks</SelectItem>
                                <SelectItem value="weekly-forward">Weekly Forward - Next 7 Days</SelectItem>
                                <SelectItem value="weekly-backward">Weekly Backward - Last 7 Days</SelectItem>
                                <SelectItem value="agenda">Agenda - 2 Weeks (Past & Future)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Progress Bar */}
                    {loading && progress > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Mengunduh PDF...</span>
                                <span className="font-medium">{progress}%</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-primary h-full transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <p className="text-sm text-destructive">{error.message}</p>
                        </div>
                    )}

                    {/* Preview Section */}
                    <div className="border rounded-lg p-4 bg-muted/30 dark:bg-muted/10 space-y-3">
                        <h3 className="font-semibold text-sm text-foreground">{previewData.title}</h3>
                        <p className="text-xs text-muted-foreground">{previewData.period}</p>

                        {/* Daily Preview */}
                        {previewData.type === "daily" && (
                            <div className="flex items-center justify-between p-3 bg-card border border-border rounded">
                                <span className="text-sm text-foreground">Tasks Due Today</span>
                                <Badge variant="secondary">{previewData.tasks.length}</Badge>
                            </div>
                        )}

                        {/* Weekly Preview */}
                        {previewData.type === "weekly" && (
                            <>
                                <div className="flex items-center justify-between p-3 bg-card border border-border rounded hover:bg-accent group">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                        <span className="text-sm text-foreground">In Progress</span>
                                    </div>
                                    <Badge variant="secondary">{previewData.inProgress.length}</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-card border border-border rounded hover:bg-accent group">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        <span className="text-sm text-foreground">Completed</span>
                                    </div>
                                    <Badge variant="secondary">{previewData.completed.length}</Badge>
                                </div>
                                {previewData.overdue.length > 0 && (
                                    <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 px-3 py-2 rounded">
                                        <AlertTriangle className="w-4 h-4" />
                                        <span>{previewData.overdue.length} task(s) completed late</span>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Agenda Preview */}
                        {previewData.type === "agenda" && (
                            <div className="space-y-3">
                                <div className="border-t border-border pt-3">
                                    <p className="text-xs font-semibold mb-2">Past Week</p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs p-2 rounded hover:bg-accent">
                                            <span>Completed</span>
                                            <Badge variant="outline" className="h-5">{previewData.past.completed.length}</Badge>
                                        </div>
                                        <div className="flex justify-between text-xs p-2 rounded hover:bg-accent">
                                            <span>In Progress</span>
                                            <Badge variant="outline" className="h-5">{previewData.past.inProgress.length}</Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="border-t border-border pt-3">
                                    <p className="text-xs font-semibold mb-2">Upcoming Week</p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs p-2 rounded hover:bg-accent">
                                            <span>Starting Soon</span>
                                            <Badge variant="outline" className="h-5">{previewData.upcoming.starting.length}</Badge>
                                        </div>
                                        <div className="flex justify-between text-xs p-2 rounded hover:bg-accent">
                                            <span>Due Soon</span>
                                            <Badge variant="outline" className="h-5">{previewData.upcoming.due.length}</Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleExportText}
                        className="gap-2"
                        disabled={loading}
                    >
                        <FileText className="w-4 h-4" />
                        Export as Text
                    </Button>

                    <Button
                        onClick={handleExportPDF}
                        className="gap-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <FileDown className="w-4 h-4" />
                                Export as PDF
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}