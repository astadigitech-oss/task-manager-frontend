export type Role = "admin" | "member" | "management";
export type Division = "frontend" | "backend" | "fullstack" | "ui_ux" | "project_management" | "devops";


// ======================== User Interface =================== //

export interface User {
    // position: string;
    id: number;
    name: string;
    email: string;
    password: string;
    role: Role;
    division: string;
    avatar: string;
    projectsCount: number;
    tasksCompleted: number;
}

export interface TeamMember extends User {
    projectsCount: number;
    tasksCompleted: number;
    joinedAt?: string;
}

// Division Config untuk UI
export const divisionConfig: Record<Division, { label: string; color: string; }> = {
    "frontend": {
        label: "Frontend Developer",
        color: "division-frontend",
    },
    "backend": {
        label: "Backend Developer",
        color: "division-backend",
    },
    "fullstack": {
        label: "Full Stack Developer",
        color: "division-fullstack",
    },
    "ui_ux": {
        label: "UI/UX Designer",
        color: "division-ui-ux",
    },
    "project_management": {
        label: "Project Manager",
        color: "division-project-management",

    },
    "devops": {
        label: "DevOps Engineer",
        color: "division-devops",
    },
};