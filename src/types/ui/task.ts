import { TaskStatus } from './../shared/status';
import { TaskPriority } from "../shared/priority";
import { ActivityType } from "../shared/status";
// ======================== Task Interface =================== //

export interface TaskActivity {
    id: number;
    type: ActivityType;
    user_id: number;
    timestamp: string;
    data?: any;
}

export interface Task {
    // notes: string;
    id: number;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    project_id: number;
    assignTo: number[];
    startDate?: string;
    dueDate: string;
    createdAt: string;
    updatedAt: string;
    attachments?: string[];
    activities?: TaskActivity[];
}