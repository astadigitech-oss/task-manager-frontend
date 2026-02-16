import { 
    format, 
    subDays, 
    addDays, 
    startOfDay, 
    endOfDay, 
    isWithinInterval,
    isPast,
    isFuture
} from "date-fns";
import type { TaskApi } from "@/types/api/task.api";

/**
 * Parse date string dengan error handling
 */
function parseDate(dateStr: string | undefined | null): Date | null {
    if (!dateStr) return null;
    try {
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date;
    } catch {
        return null;
    }
}

/**
 * Check if task is overdue
 */
function isTaskOverdue(task: TaskApi): boolean {
    if (task.status === "done") return false;
    const dueDate = parseDate(task.due_date);
    if (!dueDate) return false;
    return isPast(dueDate);
}

/**
 * Check if task was completed late
 */
function isCompletedLate(task: TaskApi): boolean {
    if (task.status !== "done") return false;
    
    if (task.overdue_duration && task.overdue_duration > 0) return true;
    
    const dueDate = parseDate(task.due_date);
    if (!dueDate) return false;
    return isPast(dueDate);
}

/**
 * Filter tasks by project_id
 */
export function filterTasksByProject(tasks: TaskApi[], projectId: number): TaskApi[] {
    return tasks.filter(task => task.project_id === projectId);
}

/**
 * Format task notes untuk display
 */
export function formatTaskNotes(task: TaskApi): string {
    if (!task.notes || task.notes.trim() === '') {
        return '-';
    }
    return task.notes.trim();
}

// ============================================
// DAILY EXPORT
// ============================================

export interface DailyExportData {
    type: "daily";
    title: string;
    period: string;
    tasks: TaskApi[];
}

export function getDailyExportData(
    tasks: TaskApi[],
    projectId: number,
    referenceDate?: Date
): DailyExportData {
    const now = referenceDate || new Date();
    const today = startOfDay(now);
    const todayEnd = endOfDay(now);
    
    const projectTasks = filterTasksByProject(tasks, projectId);
    
    const todayTasks = projectTasks.filter(task => {
        const dueDate = parseDate(task.due_date);
        return dueDate && isWithinInterval(dueDate, { start: today, end: todayEnd });
    });

    return {
        type: "daily",
        title: `Daily Report - ${format(now, "MMMM dd, yyyy")}`,
        period: format(now, "MMMM dd, yyyy"),
        tasks: todayTasks,
    };
}

// ============================================
// WEEKLY EXPORT
// ============================================

export interface WeeklyExportData {
    type: "weekly";
    title: string;
    period: string;
    onProgress: TaskApi[];
    completed: TaskApi[];
    overdue: TaskApi[];
}

export function getWeeklyBackwardExportData(
    tasks: TaskApi[],
    projectId: number,
    referenceDate?: Date
): WeeklyExportData {
    const now = referenceDate || new Date();
    const today = startOfDay(now);
    const weekAgo = subDays(today, 7);
    
    const projectTasks = filterTasksByProject(tasks, projectId);

    // Filter based on start_date, exclude on_board status
    const filteredTasks = projectTasks.filter(task => {
        if (task.status === "on_board") return false;
        
        const startDate = parseDate(task.start_date);
        if (!startDate) return false;
        
        return isWithinInterval(startDate, { start: weekAgo, end: today });
    });

    const completed = filteredTasks.filter(task => task.status === "done");
    const completedIds = new Set(completed.map(t => t.id));

    const onProgress = filteredTasks.filter(task => {
        if (completedIds.has(task.id)) return false;
        return task.status !== "done";
    });

    const overdue = completed.filter(task => isCompletedLate(task));

    return {
        type: "weekly",
        title: "Weekly Report (Last 7 Days)",
        period: `${format(weekAgo, "MMM dd")} - ${format(now, "MMM dd, yyyy")}`,
        onProgress,
        completed,
        overdue,
    };
}

export function getWeeklyForwardExportData(
    tasks: TaskApi[],
    projectId: number,
    referenceDate?: Date
): WeeklyExportData {
    const now = referenceDate || new Date();
    const today = startOfDay(now);
    const weekAhead = addDays(today, 7);
    
    const projectTasks = filterTasksByProject(tasks, projectId);

    // Filter based on start_date, exclude done status
    const filteredTasks = projectTasks.filter(task => {
        if (task.status === "done") return false;
        
        const startDate = parseDate(task.start_date);
        if (!startDate) return false;
        
        return isWithinInterval(startDate, { start: today, end: weekAhead });
    });

    const onProgress = filteredTasks.filter(task => task.status !== "canceled");

    const completed: TaskApi[] = [];
    const overdue: TaskApi[] = [];

    return {
        type: "weekly",
        title: "Weekly Report (Next 7 Days)",
        period: `${format(now, "MMM dd")} - ${format(weekAhead, "MMM dd, yyyy")}`,
        onProgress,
        completed,
        overdue,
    };
}

// ============================================
// MONITORING EXPORT
// ============================================

export interface MonitoringExportData {
    type: "monitoring";
    title: string;
    period: string;
    past: {
        completed: TaskApi[];
        onProgress: TaskApi[];
    };
    upcoming: {
        starting: TaskApi[];
        due: TaskApi[];
    };
}

export function getMonitoringExportData(
    tasks: TaskApi[],
    projectId: number,
    referenceDate?: Date
): MonitoringExportData {
    const now = referenceDate || new Date();
    const today = startOfDay(now);
    const weekAgo = subDays(today, 7);
    
    const projectTasks = filterTasksByProject(tasks, projectId);

    // Filter all tasks based on start_date within 7 days backward, all statuses
    const allTasksInRange = projectTasks.filter(task => {
        const startDate = parseDate(task.start_date);
        if (!startDate) return false;
        
        return isWithinInterval(startDate, { start: weekAgo, end: today });
    });

    // Separate by status
    const completed = allTasksInRange.filter(task => task.status === "done");
    const onProgress = allTasksInRange.filter(task => task.status !== "done");

    return {
        type: "monitoring",
        title: "Monitoring Report (7 Days Backward)",
        period: `${format(weekAgo, "MMM dd")} - ${format(now, "MMM dd, yyyy")}`,
        past: {
            completed: completed,
            onProgress: onProgress,
        },
        upcoming: {
            starting: [],
            due: [],
        },
    };
}

// ============================================
// UNIFIED EXPORT DATA GETTER
// ============================================

export type ExportData = DailyExportData | WeeklyExportData | MonitoringExportData;
export type ExportType = "daily" | "weekly-forward" | "weekly-backward" | "monitoring";

export function getExportData(
    exportType: ExportType,
    tasks: TaskApi[],
    projectId: number,
    referenceDate?: Date
): ExportData {
    switch (exportType) {
        case "daily":
            return getDailyExportData(tasks, projectId, referenceDate);
        
        case "weekly-backward":
            return getWeeklyBackwardExportData(tasks, projectId, referenceDate);
        
        case "weekly-forward":
            return getWeeklyForwardExportData(tasks, projectId, referenceDate);
        
        case "monitoring":
            return getMonitoringExportData(tasks, projectId, referenceDate);
        
        default:
            return getDailyExportData(tasks, projectId, referenceDate);
    }
}

// ============================================y
// TASK FORMATTING HELPERS
// ============================================

export function formatTaskDeadline(task: TaskApi): string {
    if (!task.due_date) return "No deadline";
    
    const dueDate = parseDate(task.due_date);
    if (!dueDate) return "Invalid date";

    const hasTime = task.due_date.includes('T');
    
    if (hasTime) {
        return format(dueDate, "MMM dd, yyyy 'at' HH:mm");
    } else {
        return format(dueDate, "MMM dd, yyyy");
    }
}

export function getTaskStatusInfo(task: TaskApi) {
    return {
        isDone: task.status === "done",
        isOverdue: isTaskOverdue(task),
        isCompletedLate: isCompletedLate(task),
        overdueDuration: task.overdue_duration || 0,
    };
}