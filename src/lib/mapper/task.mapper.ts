import { TaskApi, TaskRequest } from "@/types/api/task.api";
import { TaskStatus } from "@/types/shared/status";
import { TaskPriority } from "@/types/shared/priority";

// ============================================
// 1. Task Mapper - UNIFIED VERSION
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
            if (dateTimeStr.includes('T')) {

                const datePart = dateTimeStr.split('T')[0];


                const timePart = dateTimeStr.split('T')[1];
                if (!timePart) {
                    return { date: datePart, time: undefined };
                }

                const timeMatch = timePart.match(/^(\d{2}):(\d{2})/);
                if (!timeMatch) {
                    return { date: datePart, time: undefined };
                }

                const hours = timeMatch[1];
                const minutes = timeMatch[2];

                if (hours === '00' && minutes === '00') {
                    return { date: datePart, time: undefined };
                }

                return { date: datePart, time: `${hours}:${minutes}` };
            }

            if (dateTimeStr.includes(' ')) {
                const [datePart, timePart] = dateTimeStr.split(' ');

                if (!timePart) {
                    return { date: datePart, time: undefined };
                }

                const timeMatch = timePart.match(/^(\d{2}):(\d{2})/);
                if (!timeMatch) {
                    return { date: datePart, time: undefined };
                }

                const hours = timeMatch[1];
                const minutes = timeMatch[2];

                if (hours === '00' && minutes === '00') {
                    return { date: datePart, time: undefined };
                }

                return { date: datePart, time: `${hours}:${minutes}` };
            }

            return { date: dateTimeStr, time: undefined };

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

        overdue_duration: api.overdue_duration ? Math.floor(api.overdue_duration / 60) : 0,
        is_overdue: (api.overdue_duration ?? 0) > 0,
        order_index: (api.order),

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
        status_durations: normalizeStatusDurations(api.status_durations),
        has_been_pending: deriveHasBeenPending(api),
    };
}

// ============================================
// STATUS PENDING HELPERS
// ============================================

function deriveHasBeenPending(api: any): boolean {
    // 1. Jika backend sudah kirim field ini, pakai langsung
    if (typeof api.has_been_pending === "boolean") {
        return api.has_been_pending;
    }

    // 2. Cek dari status_durations
    const durations = api.status_durations;
    if (durations && typeof durations === "object") {
        const pendingData = durations["pending"];
        if (pendingData) {
            // Format: { total_minutes: number } atau number (ms)
            const minutes = typeof pendingData === "number"
                ? Math.floor(pendingData / 1000 / 60)
                : (pendingData.total_minutes ?? 0);
            if (minutes > 0) return true;
        }
    }

    // 3. Fallback: status saat ini adalah pending
    return api.status === "pending";
}

/**
 * Cek apakah task pernah masuk status pending
 */
export function taskHasBeenPending(task: TaskApi): boolean {
    return task.has_been_pending === true;
}

/**
 * Cek apakah task sedang pending saat ini
 */
export function isCurrentlyPending(task: TaskApi): boolean {
    return task.status === "pending";
}

/**
 * Hitung berapa lama task sudah/pernah di status pending (menit)
 */
export function getPendingDurationMinutes(task: TaskApi): number {
    return getStatusTotalDuration(
        task.status_durations,
        "pending",
        task.status === "pending"   // live jika sedang pending
    );
}

// ============================================



// ============================================
// STATUS DURATION HELPERS
// ============================================

/**
 * Format menit ke string readable
 * 90 -> "1h 30m" | 1440 -> "1d" | 30 -> "30m"
 */
export function formatStatusDuration(minutes: number): string {
    if (minutes <= 0) return "< 1m";
    if (minutes < 60) return `${minutes}m`;

    const days = Math.floor(minutes / (60 * 24));
    const hours = Math.floor((minutes % (60 * 24)) / 60);
    const mins = minutes % 60;

    if (days > 0 && hours > 0) return `${days}d ${hours}h`;
    if (days > 0) return `${days}d`;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    return `${hours}h`;
}

/**
 * Hitung live duration untuk status yang sedang aktif
 * (last_entered_at sampai sekarang)
 */
export function getLiveStatusDuration(enteredAt: string): number {
    try {
        const entered = new Date(enteredAt).getTime();
        if (isNaN(entered)) return 0;
        return Math.floor((Date.now() - entered) / (1000 * 60));
    } catch {
        return 0;
    }
}

/**
 * Ambil total durasi suatu status dari status_durations.
 * Jika ini status aktif saat ini, tambahkan live duration.
 */
export function getStatusTotalDuration(
    statusDurations: Record<string, any> | undefined,
    status: string,
    isCurrentStatus: boolean
): number {
    if (!statusDurations?.[status]) return 0;

    const data = statusDurations[status];

    // data sekarang adalah { total_minutes: number } setelah dinormalize
    let total: number = data.total_minutes ?? 0;

    if (isCurrentStatus && data.last_entered_at) {
        total += getLiveStatusDuration(data.last_entered_at);
    }

    return total;
}

function normalizeStatusDurations(
    raw: Record<string, any> | undefined
): Record<string, { total_minutes: number }> {
    if (!raw) return {};

    const result: Record<string, { total_minutes: number }> = {};

    for (const [status, value] of Object.entries(raw)) {
        if (typeof value === "number") {
            // Backend kirim dalam milidetik
            result[status] = {
                total_minutes: Math.floor(value / 1000 / 60)
            };
        } else if (typeof value === "object" && value !== null) {
            result[status] = value;
        }
    }

    return result;
}

// ============================================
// HELPER: Build Due Date Object
// ============================================

function buildDueDate(date: string | undefined, time?: string | null): Date | null {
    if (!date) return null;

    // Parse date parts TANPA timezone conversion
    const [year, month, day] = date.split('-').map(Number);

    // Buat date di LOCAL timezone (bukan UTC)
    const dueDate = new Date(year, month - 1, day);

    if (time) {
        const [hours, minutes] = time.split(':').map(Number);
        dueDate.setHours(hours, minutes, 0, 0);
    } else {
        dueDate.setHours(23, 59, 59, 999);
    }

    return dueDate;
}
// ============================================
// OVERDUE HELPERS - REAL-TIME (Untuk Task Aktif)
// ============================================

/**
 * Check apakah task SAAT INI overdue (real-time)
 */
export function isCurrentlyOverdue(task: TaskApi): boolean {

    if (task.status === "done" || task.status === "canceled") {
        return false;
    }

    if (!task.due_date) return false;

    const now = new Date();
    const dueDate = buildDueDate(task.due_date, task.due_time);

    if (!dueDate) return false;

    return now > dueDate;
}

/**
 * Hitung berapa menit task SAAT INI overdue (real-time)
 * Gunakan untuk: Display "5h overdue" pada task aktif
 */
export function getCurrentOverdueMinutes(task: TaskApi): number {
    if (!isCurrentlyOverdue(task)) return 0;

    if (!task.due_date) return 0;

    const now = new Date();
    const dueDate = buildDueDate(task.due_date, task.due_time);

    if (!dueDate) return 0;

    return Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60));
}

// ============================================
// OVERDUE HELPERS - HISTORICAL (Untuk Task Done)
// ============================================

export function getHistoricalOverdueMinutes(task: TaskApi): number {
    if (task.status !== "done") return 0;
    return task.overdue_duration ?? 0;
}

/**
 * Gunakan isCurrentlyOverdue() untuk task aktif
 * atau task.overdue_duration untuk task done
 */
export function isTaskOverdue(task: TaskApi): boolean {
    if (task.status === "done" || task.status === "canceled") {
        return false;
    }

    return isCurrentlyOverdue(task);
}

// ============================================
// FORMAT HELPERS
// ============================================

/**
 * Format overdue duration to human readable
 */
export function formatOverdueDuration(minutes: number): string {
    if (minutes === 0) return '';

    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (days > 0) {
        if (remainingHours > 0) {
            return `${days}d ${remainingHours}h overdue`;
        }
        return `${days} day${days > 1 ? 's' : ''} overdue`;
    }

    if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} overdue`;
    }

    return `${minutes} minute${minutes > 1 ? 's' : ''} overdue`;
}

/**
 *  Format overdue untuk display - auto detect task status
 */
export function formatOverdueDisplay(task: TaskApi): string {
    if (task.status === "done") {

        return formatOverdueDuration(task.overdue_duration ?? 0);
    }

    return formatOverdueDuration(getCurrentOverdueMinutes(task));
}

export function isCompletedLate(task: TaskApi): boolean {
    if (task.status !== "done") return false;

    return (task.overdue_duration ?? 0) > 0;
}

/**
 * Get task deadline status with overdue duration
 */
export function getTaskDeadlineStatus(task: TaskApi): {
    status: 'completed-on-time' | 'completed-late' | 'overdue' | 'upcoming' | 'no-deadline';
    message: string;
    variant: 'success' | 'warning' | 'destructive' | 'default';
    overdueDuration?: string;
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

    if (isCurrentlyOverdue(task)) {
        const minutes = getCurrentOverdueMinutes(task);
        return {
            status: 'overdue',
            message: formatOverdueDuration(minutes),
            variant: 'destructive',
            overdueDuration: formatOverdueDuration(minutes)
        };
    }

    return {
        status: 'upcoming',
        message: 'Active',
        variant: 'default'
    };
}

// ============================================
// FINISHED_AT HELPERS
// ============================================

/**
 * Format finished_at timestamp
 */
export function formatFinishedAt(finishedAt: string | undefined): string {
    if (!finishedAt) return '';

    try {
        const date = new Date(finishedAt);
        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    } catch {
        return '';
    }
}

/**
 * Auto-set finished_at when status changes to done
 */
export function prepareTaskForStatusUpdate(
    currentTask: TaskApi,
    newStatus: TaskStatus
): Partial<TaskRequest> {
    const updates: Partial<TaskRequest> = { status: newStatus };

    if (newStatus === "done" && currentTask.status !== "done") {
        updates.finished_at = new Date().toISOString();
    }

    if (currentTask.status === "done" && newStatus !== "done") {
        updates.finished_at = null;
    }

    return updates;
}

// ============================================
// 2. BUILD PAYLOAD FOR CREATE/UPDATE - UNIFIED WITH MODE
// ============================================

export function buildTaskPayload(
    formData: {
        title: string;
        description?: string;
        notes?: string;
        status?: TaskStatus | null;
        priority?: TaskPriority | null;
        startDate?: string;
        dueDate?: string;
        dueTime?: string;
    },
    mode: 'create' | 'update' = 'create'
): TaskRequest {
    const payload: TaskRequest = {
        title: formData.title,
        description: formData.description || "",
        notes: formData.notes || "",
        status: formData.status || null,
        priority: formData.priority || null,
    };

    const timezone = '+07:00';

    // START DATE
    if (formData.startDate && formData.startDate.trim() !== '') {
        if (mode === 'create') {

            payload.start_date = `${formData.startDate}T00:00:00${timezone}`;
        } else {

            payload.start_date = `${formData.startDate} 00:00:00`;
        }
    } else {
        const fallbackDate = formData.dueDate || new Date().toISOString().split('T')[0];
        if (mode === 'create') {
            payload.start_date = `${fallbackDate}T00:00:00${timezone}`;
        } else {
            payload.start_date = `${fallbackDate} 00:00:00`;
        }
    }

    // DUE DATE
    if (formData.dueDate && formData.dueDate.trim() !== '') {
        if (formData.dueTime && formData.dueTime.trim() !== '') {

            if (mode === 'create') {
                payload.due_date = `${formData.dueDate}T${formData.dueTime}:00${timezone}`;
            } else {
                payload.due_date = `${formData.dueDate} ${formData.dueTime}:00`;
            }
        } else {

            if (mode === 'create') {
                payload.due_date = `${formData.dueDate}T00:00:00${timezone}`;
            } else {
                payload.due_date = `${formData.dueDate} 00:00:00`;
            }
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
    const dueDate = buildDueDate(task.due_date, task.due_time);

    if (!dueDate) {
        return {
            isOverdue: false,
            isPastDue: false,
            daysRemaining: 999,
            hoursRemaining: 999,
            label: 'Invalid date'
        };
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