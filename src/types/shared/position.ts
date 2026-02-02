export type Position =
    // | "frontend"
    // | "backend"
    // | "fullstack"
    | "ui_ux"
    // | "project_management"
    // | "devops"
    | "pic_bulky_web"
    | "backend_bulky_web"
    | "pic_bulky_mobile"
    | "pic_wms_maintenance"
    | "frontend_wms"
    | "backend_wms_development"
    | "backend_wms_maintenance"
    | "pic_ai"
    | "pic_erp"
    | "server_administrator"
    | "management"
    | "top_management";

export const positionConfig: Record<
    Position,
    { label: string; color: string }
> = {
    // "frontend": {
    //     label: "Frontend Developer",
    //     color: "position-frontend",
    // },
    // "backend": {
    //     label: "Backend Developer",
    //     color: "position-backend",
    // },
    // "fullstack": {
    //     label: "Full Stack Developer",
    //     color: "position-fullstack",
    // },
    "ui_ux": {
        label: "UI/UX Designer",
        color: "position-ui-ux",
    },
    // "project_management": {
    //     label: "Project Manager",
    //     color: "position-project-management",
    // },
    // "devops": {
    //     label: "DevOps Engineer",
    //     color: "position-devops",
    // },
    "management": {
        label: "Management",
        color: "position-management",
    },
    "top_management": {
        label: "Top Management",
        color: "position-top-management",
    },
    "pic_bulky_web": {
        label: "PIC Bulky Web",
        color: "position-pic-bulky-web",
    },
    "backend_bulky_web": {
        label: "Backend Bulky Web",
        color: "position-backend-bulky-web",
    },
    "pic_bulky_mobile": {
        label: "PIC Bulky Mobile",
        color: "position-pic-bulky-mobile",
    },
    "pic_wms_maintenance": {
        label: "PIC WMS Dev & Maintenance",
        color: "position-pic-wms-maintenance",
    },
    "frontend_wms": {
        label: "Frontend WMS",
        color: "position-frontend-wms"
    },
    "backend_wms_development": {
        label: "Backend WMS Development",
        color: "position-backend-wms-development"
    },
    "backend_wms_maintenance": {
        label: "Backend WMS Maintenance",
        color: "position-backend-wms-maintenance"
    },
    "pic_ai": {
        label: "PIC AI And Automation",
        color: "position-pic-ai"
    },
    "pic_erp": {
        label: "PIC ERP",
        color: "position-pic-erp"
    },
    "server_administrator": {
        label: "Server Administrator",
        color: "position-server-admin"
    }
};
