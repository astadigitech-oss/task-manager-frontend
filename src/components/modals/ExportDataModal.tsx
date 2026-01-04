"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileText, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, addDays, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import type { TaskApi } from "@/types/api/task.api";

interface ExportTasksModalProps {
    projectId: number;
    projectName: string;
    tasks: TaskApi[];
}

type DailyExportData = {
    type: "daily";
    title: string;
    period: string;
    tasks: TaskApi[];
};

type WeeklyExportData = {
    type: "weekly";
    title: string;
    period: string;
    inProgress: TaskApi[];
    completed: TaskApi[];
    overdue: TaskApi[];
};

type AgendaExportData = {
    type: "agenda";
    title: string;
    period: string;
    past: {
        completed: TaskApi[];
        inProgress: TaskApi[];
    };
    upcoming: {
        starting: TaskApi[];
        due: TaskApi[];
    };
};

type ExportData = DailyExportData | WeeklyExportData | AgendaExportData;

export function ExportTasksModal({ projectId, projectName, tasks }: ExportTasksModalProps) {
    const [open, setOpen] = useState(false);
    const [exportType, setExportType] = useState<"daily" | "weekly" | "agenda">("weekly");

    const parseDate = (dateStr: string | undefined): Date | null => {
        if (!dateStr) return null;
        try {
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? null : date;
        } catch {
            return null;
        }
    };

    const getExportData = (): ExportData => {
        const now = new Date();
        const today = startOfDay(now);

        switch (exportType) {
            case "daily": {
                const todayEnd = endOfDay(now);
                return {
                    type: "daily",
                    title: `Daily Report - ${format(now, "MMMM dd, yyyy")}`,
                    tasks: tasks.filter(task => {
                        const dueDate = parseDate(task.due_date);
                        return dueDate && isWithinInterval(dueDate, { start: today, end: todayEnd });
                    }),
                    period: "Today"
                };
            }

            case "weekly": {
                const weekAgo = subDays(today, 7);
                return {
                    type: "weekly",
                    title: `Weekly Report (Last 7 Days)`,
                    period: `${format(weekAgo, "MMM dd")} - ${format(now, "MMM dd, yyyy")}`,
                    inProgress: tasks.filter(task => {
                        const createdAt = parseDate(task.created_at);
                        if (!createdAt) return false;
                        return isWithinInterval(createdAt, { start: weekAgo, end: now }) &&
                            !["done", "canceled"].includes(task.status);
                    }),
                    completed: tasks.filter(task => {
                        if (!task.finished_at) return false;
                        const finishedAt = parseDate(task.finished_at);
                        if (!finishedAt) return false;
                        return isWithinInterval(finishedAt, { start: weekAgo, end: now }) &&
                            task.status === "done";
                    }),
                    overdue: tasks.filter(task => {
                        if (!task.finished_at || !task.is_overdue) return false;
                        const finishedAt = parseDate(task.finished_at);
                        if (!finishedAt) return false;
                        return task.status === "done" && 
                            isWithinInterval(finishedAt, { start: weekAgo, end: now });
                    })
                };
            }

            case "agenda": {
                const weekAgo = subDays(today, 7);
                const weekAhead = addDays(today, 7);

                return {
                    type: "agenda",
                    title: "Agenda Report (2 Weeks View)",
                    period: `${format(weekAgo, "MMM dd")} - ${format(weekAhead, "MMM dd, yyyy")}`,
                    past: {
                        completed: tasks.filter(task => {
                            if (!task.finished_at) return false;
                            const finishedAt = parseDate(task.finished_at);
                            if (!finishedAt) return false;
                            return isWithinInterval(finishedAt, { start: weekAgo, end: now });
                        }),
                        inProgress: tasks.filter(task => {
                            const createdAt = parseDate(task.created_at);
                            if (!createdAt) return false;
                            return isWithinInterval(createdAt, { start: weekAgo, end: now }) &&
                                !["done", "canceled"].includes(task.status);
                        })
                    },
                    upcoming: {
                        starting: tasks.filter(task => {
                            if (!task.start_date) return false;
                            const startDate = parseDate(task.start_date);
                            if (!startDate) return false;
                            return isWithinInterval(startDate, { start: now, end: weekAhead });
                        }),
                        due: tasks.filter(task => {
                            if (!task.due_date) return false;
                            const dueDate = parseDate(task.due_date);
                            if (!dueDate) return false;
                            return isWithinInterval(dueDate, { start: now, end: weekAhead }) &&
                                task.status === "on-progress";
                        })
                    }
                };
            }
        }
    };

    const formatTaskTime = (task: TaskApi) => {
        if (!task.due_date) return "No deadline";
        const dueDate = parseDate(task.due_date);
        if (!dueDate) return "Invalid date";
        
        const dateStr = format(dueDate, "MMM dd, yyyy");
        return task.due_time ? `${dateStr} at ${task.due_time}` : dateStr;
    };

    const exportToText = () => {
        const data = getExportData();

        let text = `PROJECT TASK EXPORT\n${"=".repeat(50)}\n\n`;
        text += `Project: ${projectName}\n`;
        text += `Export Type: ${exportType.toUpperCase()}\n`;
        text += `Period: ${data.period}\n`;
        text += `Generated: ${format(new Date(), "MMMM dd, yyyy 'at' HH:mm")}\n\n`;
        text += `${"=".repeat(50)}\n\n`;

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
                    text += `   Deadline: ${formatTaskTime(task)}\n`;
                    if (task.description) text += `   Description: ${task.description}\n`;
                    text += `\n`;
                });
            }
        }

        if (data.type === "weekly") {
            text += `WEEKLY SUMMARY\n`;
            text += `${"-".repeat(50)}\n\n`;

            text += `IN PROGRESS (${data.inProgress.length} tasks)\n\n`;
            data.inProgress.forEach((task, i) => {
                text += `${i + 1}. ${task.title}\n`;
                text += `   Status: ${task.status.toUpperCase()}\n`;
                text += `   Priority: ${task.priority.toUpperCase()}\n`;
                text += `   Deadline: ${formatTaskTime(task)}\n`;
                text += `\n`;
            });

            text += `\n COMPLETED (${data.completed.length} tasks)\n\n`;
            data.completed.forEach((task, i) => {
                text += `${i + 1}. ${task.title}\n`;
                text += `   Priority: ${task.priority.toUpperCase()}\n`;
                text += `   Deadline: ${formatTaskTime(task)}\n`;
                if (task.finished_at) {
                    const finishedDate = parseDate(task.finished_at);
                    if (finishedDate) {
                        text += `   Finished: ${format(finishedDate, "MMM dd, yyyy 'at' HH:mm")}\n`;
                    }
                }
                if (task.is_overdue) text += `     COMPLETED LATE\n`;
                text += `\n`;
            });

            if (data.overdue.length > 0) {
                text += `\n  OVERDUE COMPLETIONS (${data.overdue.length} tasks)\n\n`;
                data.overdue.forEach((task, i) => {
                    text += `${i + 1}. ${task.title}\n`;
                    text += `   Deadline: ${formatTaskTime(task)}\n`;
                    if (task.finished_at) {
                        const finishedDate = parseDate(task.finished_at);
                        if (finishedDate) {
                            text += `   Finished: ${format(finishedDate, "MMM dd 'at' HH:mm")}\n`;
                        }
                    }
                    text += `\n`;
                });
            }
        }

        if (data.type === "agenda") {
            text += ` AGENDA (2 WEEKS VIEW)\n`;
            text += `${"-".repeat(50)}\n\n`;

            text += ` PAST WEEK\n`;
            text += `${"-".repeat(30)}\n\n`;

            text += `Completed (${data.past.completed.length})\n`;
            data.past.completed.forEach((task, i) => {
                text += `  ${i + 1}. ${task.title}\n`;
                if (task.finished_at) {
                    const finishedDate = parseDate(task.finished_at);
                    if (finishedDate) {
                        text += `     Finished: ${format(finishedDate, "MMM dd 'at' HH:mm")}\n`;
                    }
                }
                if (task.is_overdue) text += `       Late\n`;
            });

            text += `\n In Progress (${data.past.inProgress.length})\n`;
            data.past.inProgress.forEach((task, i) => {
                text += `  ${i + 1}. ${task.title} - ${task.status.toUpperCase()}\n`;
            });

            text += `\n\n UPCOMING WEEK\n`;
            text += `${"-".repeat(30)}\n\n`;

            text += ` Starting Soon (${data.upcoming.starting.length})\n`;
            data.upcoming.starting.forEach((task, i) => {
                text += `  ${i + 1}. ${task.title}\n`;
                if (task.start_date) {
                    const startDate = parseDate(task.start_date);
                    if (startDate) {
                        text += `     Starts: ${format(startDate, "MMM dd, yyyy")}\n`;
                    }
                }
                text += `     Due: ${formatTaskTime(task)}\n`;
            });

            text += `\n Due Soon (${data.upcoming.due.length})\n`;
            data.upcoming.due.forEach((task, i) => {
                text += `  ${i + 1}. ${task.title}\n`;
                text += `     Due: ${formatTaskTime(task)}\n`;
                text += `     Priority: ${task.priority.toUpperCase()}\n`;
            });
        }

        text += `\n${"=".repeat(50)}\n`;
        text += `End of Report\n`;

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${projectName}_${exportType}_export_${format(new Date(), "yyyyMMdd")}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setOpen(false);
    };

    const data = getExportData();

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
                        <Select value={exportType} onValueChange={(v) => setExportType(v as "daily" | "weekly" | "agenda")}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily - Today's Tasks</SelectItem>
                                <SelectItem value="weekly">Weekly - Last 7 Days</SelectItem>
                                <SelectItem value="agenda">Agenda - 2 Weeks (Past & Future)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Preview Section with Dark Mode */}
                    <div className="border rounded-lg p-4 bg-muted/30 dark:bg-muted/10 space-y-3">
                        <h3 className="font-semibold text-sm text-foreground">{data.title}</h3>
                        <p className="text-xs text-muted-foreground">{data.period}</p>

                        {/* Daily Preview */}
                        {data.type === "daily" && (
                            <div className="flex items-center justify-between p-3 bg-card border border-border rounded transition-colors">
                                <span className="text-sm text-foreground">Tasks Due Today</span>
                                <Badge variant="secondary">{data.tasks.length}</Badge>
                            </div>
                        )}

                        {/* Weekly Preview */}
                        {data.type === "weekly" && (
                            <>
                                <div className="flex items-center justify-between p-3 bg-card border border-border rounded transition-colors hover:bg-accent group">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                        <span className="text-sm text-foreground group-hover:text-accent-foreground">In Progress</span>
                                    </div>
                                    <Badge variant="secondary">{data.inProgress.length}</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-card border border-border rounded transition-colors hover:bg-accent group">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        <span className="text-sm text-foreground group-hover:text-accent-foreground">Completed</span>
                                    </div>
                                    <Badge variant="secondary">{data.completed.length}</Badge>
                                </div>
                                {data.overdue.length > 0 && (
                                    <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 px-3 py-2 rounded">
                                        <AlertTriangle className="w-4 h-4" />
                                        <span>{data.overdue.length} task(s) completed late</span>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Agenda Preview */}
                        {data.type === "agenda" && (
                            <div className="space-y-3">
                                <div className="border-t border-border pt-3">
                                    <p className="text-xs font-semibold mb-2 text-foreground">Past Week</p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs p-2 rounded hover:bg-accent transition-colors group">
                                            <span className="text-foreground group-hover:text-accent-foreground">Completed</span>
                                            <Badge variant="outline" className="h-5">{data.past.completed.length}</Badge>
                                        </div>
                                        <div className="flex justify-between text-xs p-2 rounded hover:bg-accent transition-colors group">
                                            <span className="text-foreground group-hover:text-accent-foreground">In Progress</span>
                                            <Badge variant="outline" className="h-5">{data.past.inProgress.length}</Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="border-t border-border pt-3">
                                    <p className="text-xs font-semibold mb-2 text-foreground">Upcoming Week</p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs p-2 rounded hover:bg-accent transition-colors group">
                                            <span className="text-foreground group-hover:text-accent-foreground">Starting Soon</span>
                                            <Badge variant="outline" className="h-5">{data.upcoming.starting.length}</Badge>
                                        </div>
                                        <div className="flex justify-between text-xs p-2 rounded hover:bg-accent transition-colors group">
                                            <span className="text-foreground group-hover:text-accent-foreground">Due Soon</span>
                                            <Badge variant="outline" className="h-5">{data.upcoming.due.length}</Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={exportToText} className="gap-2">
                        <Download className="w-4 h-4" />
                        Download Export
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}