import { 
    format, 
    subDays, 
    addDays, 
    startOfDay, 
    endOfDay, 
    isWithinInterval 
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
 * Filter tasks by project_id
 */
export function filterTasksByProject(tasks: TaskApi[], projectId: number): TaskApi[] {
    return tasks.filter(task => task.project_id === projectId);
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
    inProgress: TaskApi[];
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

    const inProgress = projectTasks.filter(task => {
        const createdAt = parseDate(task.created_at);
        if (!createdAt) return false;
        return isWithinInterval(createdAt, { start: weekAgo, end: now }) &&
            !["done", "canceled"].includes(task.status);
    });

    const completed = projectTasks.filter(task => {
        if (!task.finished_at) return false;
        const finishedAt = parseDate(task.finished_at);
        if (!finishedAt) return false;
        return isWithinInterval(finishedAt, { start: weekAgo, end: now }) &&
            task.status === "done";
    });

    const overdue = projectTasks.filter(task => {
        if (!task.finished_at || !task.is_overdue) return false;
        const finishedAt = parseDate(task.finished_at);
        if (!finishedAt) return false;
        return task.status === "done" &&
            isWithinInterval(finishedAt, { start: weekAgo, end: now });
    });

    return {
        type: "weekly",
        title: "Weekly Report (Last 7 Days)",
        period: `${format(weekAgo, "MMM dd")} - ${format(now, "MMM dd, yyyy")}`,
        inProgress,
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
    
    // PENTING: Filter by project_id terlebih dahulu
    const projectTasks = filterTasksByProject(tasks, projectId);

    const inProgress = projectTasks.filter(task => {
        const dueDate = parseDate(task.due_date);
        if (!dueDate) return false;
        return isWithinInterval(dueDate, { start: now, end: weekAhead }) &&
            !["done", "canceled"].includes(task.status);
    });

    const completed = projectTasks.filter(task => {
        if (!task.finished_at) return false;
        const finishedAt = parseDate(task.finished_at);
        if (!finishedAt) return false;
        return isWithinInterval(finishedAt, { start: now, end: weekAhead }) &&
            task.status === "done";
    });

    const overdue = projectTasks.filter(task => {
        if (!task.is_overdue) return false;
        const dueDate = parseDate(task.due_date);
        if (!dueDate) return false;
        return isWithinInterval(dueDate, { start: now, end: weekAhead });
    });

    return {
        type: "weekly",
        title: "Weekly Report (Next 7 Days)",
        period: `${format(now, "MMM dd")} - ${format(weekAhead, "MMM dd, yyyy")}`,
        inProgress,
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
        inProgress: TaskApi[];
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
    
    // PENTING: Filter by project_id terlebih dahulu
    const projectTasks = filterTasksByProject(tasks, projectId);

    return {
        type: "agenda",
        title: "Agenda Report (2 Weeks View)",
        period: `${format(weekAgo, "MMM dd")} - ${format(weekAhead, "MMM dd, yyyy")}`,
        past: {
            completed: projectTasks.filter(task => {
                if (!task.finished_at) return false;
                const finishedAt = parseDate(task.finished_at);
                if (!finishedAt) return false;
                return isWithinInterval(finishedAt, { start: weekAgo, end: now });
            }),
            inProgress: projectTasks.filter(task => {
                const createdAt = parseDate(task.created_at);
                if (!createdAt) return false;
                return isWithinInterval(createdAt, { start: weekAgo, end: now }) &&
                    !["done", "canceled"].includes(task.status);
            }),
        },
        upcoming: {
            starting: projectTasks.filter(task => {
                if (!task.start_date) return false;
                const startDate = parseDate(task.start_date);
                if (!startDate) return false;
                return isWithinInterval(startDate, { start: now, end: weekAhead });
            }),
            due: projectTasks.filter(task => {
                if (!task.due_date) return false;
                const dueDate = parseDate(task.due_date);
                if (!dueDate) return false;
                return isWithinInterval(dueDate, { start: now, end: weekAhead }) &&
                    task.status === "on_progress";
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

    const dateStr = format(dueDate, "MMM dd, yyyy");
    return task.due_time ? `${dateStr} at ${task.due_time}` : dateStr;
}