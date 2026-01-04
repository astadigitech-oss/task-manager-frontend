// ======================== Project Interface =================== //

export interface Project {
    id: number;
    name: string;
    description: string | null;
    progress: number;
    member: number[];
    tasksCompleted: number;
    tasksTotal: number;
    workspace_id: number;
}