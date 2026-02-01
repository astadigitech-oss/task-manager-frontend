import { TaskApi } from "@/types/api/task.api";

/**
 * =========================
 * HELPER: Calculate Overdue Duration (FRONTEND AUTHORITY)
 * =========================
 */
export function calculateOverdueDuration(task: TaskApi): {
    overdue_duration: number;
    is_overdue: boolean;
} {
    if (task.status === "done" || task.status === "canceled") {
        return { overdue_duration: 0, is_overdue: false };
    }


    if (!task.due_date) {
        return { overdue_duration: 0, is_overdue: false };
    }

    try {
        const now = new Date();
        
        let dueDate: Date;
        
        if (task.due_date.includes('T') || task.due_date.includes(' ')) {

            dueDate = new Date(task.due_date.replace(' ', 'T'));
        } else {
            const [year, month, day] = task.due_date.split('-').map(Number);
            dueDate = new Date(year, month - 1, day);
            
            if (!task.due_time) {
                dueDate.setHours(23, 59, 59, 999);
            }
        }
        
        if (task.due_time) {
            const [hours, minutes] = task.due_time.split(':').map(Number);
            dueDate.setHours(hours, minutes, 0, 0);
        }

        const diffMs = now.getTime() - dueDate.getTime();

        if (diffMs > 0) {
            const overdueMins = Math.floor(diffMs / (1000 * 60));
            return { overdue_duration: overdueMins, is_overdue: true };
        }

        return { overdue_duration: 0, is_overdue: false };
    } catch (error) {
        console.error('Error calculating overdue:', error, task);
        return { overdue_duration: 0, is_overdue: false };
    }
}

/**
 * =========================
 * HELPER: Apply Overdue to Task
 * =========================
 */
export function applyOverdueCalculation(task: TaskApi): TaskApi {
    const overdueData = calculateOverdueDuration(task);
    return {
        ...task,
        overdue_duration: overdueData.overdue_duration,
        is_overdue: overdueData.is_overdue
    };
}