import { TaskApi } from "./task.api";

export type ExportType = "daily" | "weekly-forward" | "weekly-backward" | "agenda";

export interface ExportPDFParams {
    project_id: number;
    export_type: ExportType;
    date?: string;

    data?: {
        projectName: string;
        period: string;
        tasks: TaskApi[];
        onProgress?: TaskApi[];
        completed?: TaskApi[];
        overdue?: TaskApi[];
        past?: {
            completed: TaskApi[];
            onProgress: TaskApi[];
        };
        upcoming?: {
            starting: TaskApi[];
            due: TaskApi[];
        };
    };
}

export interface ExportResponse {
    success: boolean;
    message?: string;
    filename?: string;
}