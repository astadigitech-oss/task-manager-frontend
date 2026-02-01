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

    // Tasks yang masih on progress dengan aktivitas dalam 7 hari terakhir
    const onProgress = projectTasks.filter(task => {
        if (task.status === "done" || task.status === "canceled") return false;
        
        // Check due date
        const dueDate = parseDate(task.due_date);
        if (dueDate && isWithinInterval(dueDate, { start: weekAgo, end: now })) {
            return true;
        }
        
        // Check start date
        const startDate = parseDate(task.start_date);
        if (startDate && isWithinInterval(startDate, { start: weekAgo, end: now })) {
            return true;
        }
        
        // Check created date
        const createdAt = parseDate(task.created_at);
        if (createdAt && isWithinInterval(createdAt, { start: weekAgo, end: now })) {
            return true;
        }
        
        return false;
    });

    // Tasks yang completed dalam 7 hari terakhir
    const completed = projectTasks.filter(task => {
        if (task.status !== "done") return false;
        
        const dueDate = parseDate(task.due_date);
        if (dueDate && isWithinInterval(dueDate, { start: weekAgo, end: now })) {
            return true;
        }
        
        const createdAt = parseDate(task.created_at);
        if (createdAt && isWithinInterval(createdAt, { start: weekAgo, end: now })) {
            return true;
        }
        
        return false;
    });

    // Tasks yang completed late
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

    // Tasks yang due dalam 7 hari ke depan dan masih progress
    const onProgress = projectTasks.filter(task => {
        if (task.status === "done" || task.status === "canceled") return false;
        
        const dueDate = parseDate(task.due_date);
        if (!dueDate) return false;
        
        return isWithinInterval(dueDate, { start: now, end: weekAhead });
    });

    // Tasks yang sudah done dengan due date dalam 7 hari ke depan
    const completed = projectTasks.filter(task => {
        if (task.status !== "done") return false;
        
        const dueDate = parseDate(task.due_date);
        if (!dueDate) return false;
        
        return isWithinInterval(dueDate, { start: now, end: weekAhead });
    });

    // Tasks yang overdue dalam periode ini
    const overdue = projectTasks.filter(task => {
        if (task.status === "done" || task.status === "canceled") return false;
        
        const dueDate = parseDate(task.due_date);
        if (!dueDate) return false;
        
        return isWithinInterval(dueDate, { start: now, end: weekAhead }) && 
            isTaskOverdue(task);
    });

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
// AGENDA EXPORT
// ============================================

export interface AgendaExportData {
    type: "agenda";
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

export function getAgendaExportData(
    tasks: TaskApi[],
    projectId: number,
    referenceDate?: Date
): AgendaExportData {
    const now = referenceDate || new Date();
    const today = startOfDay(now);
    const weekAgo = subDays(today, 7);
    const weekAhead = addDays(today, 7);
    
    const projectTasks = filterTasksByProject(tasks, projectId);

    return {
        type: "agenda",
        title: "Agenda Report (2 Weeks View)",
        period: `${format(weekAgo, "MMM dd")} - ${format(weekAhead, "MMM dd, yyyy")}`,
        past: {
            // Completed dalam 7 hari terakhir
            completed: projectTasks.filter(task => {
                if (task.status !== "done") return false;
                
                const dueDate = parseDate(task.due_date);
                if (dueDate && isWithinInterval(dueDate, { start: weekAgo, end: now })) {
                    return true;
                }
                
                const createdAt = parseDate(task.created_at);
                if (createdAt && isWithinInterval(createdAt, { start: weekAgo, end: now })) {
                    return true;
                }
                
                return false;
            }),
            // On progress dengan aktivitas dalam 7 hari terakhir
            onProgress: projectTasks.filter(task => {
                if (task.status === "done" || task.status === "canceled") return false;
                
                const dueDate = parseDate(task.due_date);
                if (dueDate && isWithinInterval(dueDate, { start: weekAgo, end: now })) {
                    return true;
                }
                
                const startDate = parseDate(task.start_date);
                if (startDate && isWithinInterval(startDate, { start: weekAgo, end: now })) {
                    return true;
                }
                
                const createdAt = parseDate(task.created_at);
                if (createdAt && isWithinInterval(createdAt, { start: weekAgo, end: now })) {
                    return true;
                }
                
                return false;
            }),
        },
        upcoming: {
            // show task yang akan mulai dalam 7 hari ke depan
            starting: projectTasks.filter(task => {
                if (task.status === "done" || task.status === "canceled") return false;
                
                const startDate = parseDate(task.start_date);
                if (!startDate) return false;
                
                if (isFuture(startDate) && isWithinInterval(startDate, { start: now, end: weekAhead })) {
                    return true;
                }
                
                if (isPast(startDate)) {
                    const dueDate = parseDate(task.due_date);
                    if (!dueDate) return false;
                    
                    // Due date untuk minggu kedepannya.
                    if (isFuture(dueDate) && isWithinInterval(dueDate, { start: now, end: weekAhead })) {
                        return true;
                    }
                }
                
                return false;
            }),
            
            due: projectTasks.filter(task => {
                
                if (task.status === "done" || task.status === "canceled") return false;
                
                const dueDate = parseDate(task.due_date);
                if (!dueDate) return false;
                
                return isWithinInterval(dueDate, { start: now, end: weekAhead });
            }),
        },
    };
}

// ============================================
// UNIFIED EXPORT DATA GETTER
// ============================================

export type ExportData = DailyExportData | WeeklyExportData | AgendaExportData;
export type ExportType = "daily" | "weekly-forward" | "weekly-backward" | "agenda";

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
        
        case "agenda":
            return getAgendaExportData(tasks, projectId, referenceDate);
        
        default:
            return getDailyExportData(tasks, projectId, referenceDate);
    }
}

// ============================================
// TASK FORMATTING HELPERS
// ============================================

export function formatTaskDeadline(task: TaskApi): string {
    if (!task.due_date) return "No deadline";
    
    const dueDate = parseDate(task.due_date);
    if (!dueDate) return "Invalid date";

    // Parse time dari due_date jika ada (format ISO 8601)
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