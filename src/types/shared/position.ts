export type Position =
    | "frontend"
    | "backend"
    | "fullstack"
    | "ui_ux"
    | "project_management"
    | "devops";

export const positionConfig: Record<
    Position,
    { label: string; color: string }
> = {
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
