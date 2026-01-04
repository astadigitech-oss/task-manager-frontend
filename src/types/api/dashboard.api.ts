import { TaskApi } from "./task.api";

export interface DashboardData {
    tasks: TaskApi[];
}

export interface DashboardResponse {
    success: boolean;
    code: number;
    message: string;
    data: DashboardData;
}
