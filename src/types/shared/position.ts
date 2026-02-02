export type Position =
    | "frontend"
    | "backend"
    | "fullstack"
    | "ui_ux"
    | "project_management"
    | "devops"
    | "management"
    | "top_management";

export const positionConfig: Record<
    Position,
    { label: string; color: string }
> = {
    "frontend": {
        label: "Frontend Developer",
        color: "position-frontend",
    },
    "backend": {
        label: "Backend Developer",
        color: "position-backend",
    },
    "fullstack": {
        label: "Full Stack Developer",
        color: "position-fullstack",
    },
    "ui_ux": {
        label: "UI/UX Designer",
        color: "position-ui-ux",
    },
    "project_management": {
        label: "Project Manager",
        color: "position-project-management",
    },
    "devops": {
        label: "DevOps Engineer",
        color: "position-devops",
    },
    "management": {
        label: "Management",
        color: "position-management",
    },
    "top_management": {
        label: "Top Management",
        color: "position-top-management",
    },
};
