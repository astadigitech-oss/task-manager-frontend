import { TaskApi, TaskRequest } from "@/types/api/task.api";
import { TaskStatus } from "@/types/shared/status";
import { TaskPriority } from "@/types/shared/priority";

// ============================================
// 1. Task Mapper - FIXED
// ============================================

export function mapTask(api: any): TaskApi {
    
    const parseDateTime = (dateStr: string | undefined | null): string | undefined => {
        if (!dateStr) return undefined;
        try {
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? undefined : date.toISOString();
        } catch {
            return undefined;
        }
    };

    const splitDateTime = (dateTimeStr: string | undefined | null): {
        date: string | undefined;
        time: string | undefined;
    } => {
        if (!dateTimeStr) return { date: undefined, time: undefined };

        try {
            if (!dateTimeStr.includes('T')) {
                return { date: dateTimeStr, time: undefined };
            }

            // Split manual untuk preserve timezone accuracy
            const [datePart, timePart] = dateTimeStr.split('T');
            
            if (!timePart) {
                return { date: datePart, time: undefined };
            }

            // Extract HH:MM dari "17:00:00+07:00" atau "17:00:00"
            const timeMatch = timePart.match(/^(\d{2}):(\d{2})/);
            
            if (!timeMatch) {
                return { date: datePart, time: undefined };
            }

            const hours = timeMatch[1];
            const minutes = timeMatch[2];
            
            // Jika waktu adalah 00:00, anggap tidak ada waktu spesifik
            if (hours === '00' && minutes === '00') {
                return { date: datePart, time: undefined };
            }

            const time = `${hours}:${minutes}`;
            return { date: datePart, time };
        } catch (error) {
            console.error('Error parsing datetime:', dateTimeStr, error);
            return { date: undefined, time: undefined };
        }
    };

    const startDateTime = splitDateTime(api.start_date);
    const dueDateTime = splitDateTime(api.due_date);

    const normalizePriority = (priority: string): TaskPriority => {
        if (!priority) return "normal";
        const normalized = priority.replace(/_/g, '-');
        return normalized as TaskPriority;
    };

    return {
        id: Number(api.id),
        title: api.title ?? "",
        description: api.description ?? "",
        status: api.status as TaskStatus,
        priority: normalizePriority(api.priority),
        project_id: Number(api.project_id),

        members: Array.isArray(api.members) ? api.members : [],
        member_count: api.member_count ?? 0,
        images: api.images || null,

        start_date: startDateTime.date,
        due_date: dueDateTime.date,
        
        due_time: api.due_time || dueDateTime.time,

        finished_at: parseDateTime(api.finished_at),
        is_overdue: api.is_overdue ?? false,

        notes: api.notes ?? "",
        created_at: parseDateTime(api.created_at) ?? new Date().toISOString(),
        updated_at: parseDateTime(api.updated_at) ?? new Date().toISOString(),

        task_members: Array.isArray(api.members)
            ? api.members.map((m: any) => ({
                id: m.user_id,
                user_id: m.user_id,
                name: m.user_name,
                user_email: m.user_email,
                role_in_task: m.role_in_task || "",
                position: null,
                joinedAt: m.assigned_at,
                avatar: m.user_profile_image || null,
                profile_img: m.user_profile_image || null,
                profile_image: m.user_profile_image || null,
                task_id: Number(api.id),
                project_id: Number(api.project_id),
            }))
            : [],

        workspace_id: 0,
    };
}

// ============================================
// 2. BUILD PAYLOAD FOR CREATE/UPDATE
// ============================================

export function buildTaskPayload(formData: {
    title: string;
    description?: string;
    notes?: string;
    status?: TaskStatus | null;
    priority?: TaskPriority | null;
    startDate?: string;
    dueDate?: string;
    dueTime?: string;
}): TaskRequest {
    const payload: TaskRequest = {
        title: formData.title,
        description: formData.description || "",
        notes: formData.notes || "",
        status: formData.status || null,
        priority: formData.priority || null,
    };
    
    // Start date
    if (formData.startDate && formData.startDate.trim() !== '') {
        // Format: "2025-11-03 00:00:00"
        payload.start_date = `${formData.startDate} 00:00:00`;
    } else {
        const fallbackDate = formData.dueDate || new Date().toISOString().split('T')[0];
        payload.start_date = `${fallbackDate} 00:00:00`;
    }

    // Due date & time
    if (formData.dueDate && formData.dueDate.trim() !== '') {
        if (formData.dueTime && formData.dueTime.trim() !== '') {
            payload.due_date = `${formData.dueDate} ${formData.dueTime}:00`;
        } else {
            payload.due_date = `${formData.dueDate} 00:00:00`;
        }
    }

    return payload;
}

// ============================================
// 3. DISPLAY & FORMATTING HELPERS
// ============================================

export function formatDeadline(date: string, time?: string | null): string {
    const d = new Date(date);
    const dateStr = d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    if (time) {
        return `${dateStr} at ${time}`;
    }
    return dateStr;
}

// ============================================
// 4. VALIDATION HELPERS
// ============================================

export function isTaskOverdue(task: TaskApi): boolean {
    if (task.status === "done" || task.status === "canceled") {
        return false;
    }

    if (!task.due_date) return false;

    const now = new Date();

    const [year, month, day] = task.due_date.split('-').map(Number);
    const dueDate = new Date(year, month - 1, day);

    if (task.due_time) {
        const [hours, minutes] = task.due_time.split(':').map(Number);
        dueDate.setHours(hours, minutes, 0, 0);
    } else {
        dueDate.setHours(23, 59, 59, 999);
    }

    return now > dueDate;
}

export function isCompletedLate(task: TaskApi): boolean {
    if (task.status !== "done") return false;

    if (!task.finished_at || !task.due_date) return false;

    const finishedDate = new Date(task.finished_at);

    const [year, month, day] = task.due_date.split('-').map(Number);
    const dueDate = new Date(year, month - 1, day);

    if (task.due_time) {
        const [hours, minutes] = task.due_time.split(':').map(Number);
        dueDate.setHours(hours, minutes, 0, 0);
    } else {
        dueDate.setHours(23, 59, 59, 999);
    }

    return finishedDate > dueDate;
}

export function getTaskDeadlineStatus(task: TaskApi): {
    status: 'completed-on-time' | 'completed-late' | 'overdue' | 'upcoming' | 'no-deadline';
    message: string;
    variant: 'success' | 'warning' | 'destructive' | 'default';
} {
    if (!task.due_date) {
        return {
            status: 'no-deadline',
            message: 'No deadline',
            variant: 'default'
        };
    }

    if (task.status === "done") {
        const completedLate = isCompletedLate(task);

        if (completedLate) {
            return {
                status: 'completed-late',
                message: 'Completed Late',
                variant: 'warning'
            };
        }
        return {
            status: 'completed-on-time',
            message: 'Completed On Time',
            variant: 'success'
        };
    }

    if (task.status === "canceled") {
        return {
            status: 'no-deadline',
            message: 'Canceled',
            variant: 'default'
        };
    }

    if (isTaskOverdue(task)) {
        return {
            status: 'overdue',
            message: 'Overdue',
            variant: 'destructive'
        };
    }

    return {
        status: 'upcoming',
        message: 'Active',
        variant: 'default'
    };
}

export function getTimeRemaining(task: TaskApi): {
    isOverdue: boolean;
    isPastDue: boolean;
    daysRemaining: number;
    hoursRemaining: number;
    label: string;
} {
    if (!task.due_date) {
        return {
            isOverdue: false,
            isPastDue: false,
            daysRemaining: 999,
            hoursRemaining: 999,
            label: 'No deadline'
        };
    }

    if (task.status === "done" || task.status === "canceled") {
        return {
            isOverdue: false,
            isPastDue: false,
            daysRemaining: 0,
            hoursRemaining: 0,
            label: task.status === "done" ? 'Completed' : 'Canceled'
        };
    }

    const now = new Date();

    const [year, month, day] = task.due_date.split('-').map(Number);
    const dueDate = new Date(year, month - 1, day);

    if (task.due_time) {
        const [hours, minutes] = task.due_time.split(':').map(Number);
        dueDate.setHours(hours, minutes, 0, 0);
    } else {
        dueDate.setHours(23, 59, 59, 999);
    }

    const diffMs = dueDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    const isPastDue = diffMs < 0;

    if (isPastDue) {
        return {
            isOverdue: true,
            isPastDue: true,
            daysRemaining: diffDays,
            hoursRemaining: diffHours,
            label: `${Math.abs(diffDays)} days overdue`
        };
    }

    if (diffDays === 0) {
        return {
            isOverdue: false,
            isPastDue: false,
            daysRemaining: 0,
            hoursRemaining: diffHours,
            label: diffHours > 0 ? `${diffHours}h remaining` : 'Due now'
        };
    }

    if (diffDays === 1) {
        return {
            isOverdue: false,
            isPastDue: false,
            daysRemaining: 1,
            hoursRemaining: diffHours,
            label: 'Due tomorrow'
        };
    }

    return {
        isOverdue: false,
        isPastDue: false,
        daysRemaining: diffDays,
        hoursRemaining: diffHours,
        label: `${diffDays} days remaining`
    };
}