import { useUIStore } from "../store/useUIStore";

export function useModal() {
    const {
        isCreateProjectOpen,
        isCreateTaskOpen,
        isCreateWorkspaceOpen,
        openCreateProject,
        closeCreateProject,
        openCreateTask,
        closeCreateTask,
        openCreateWorkspace,
        closeCreateWorkspace,
    } = useUIStore();

    return {
        createProject: {
            isOpen: isCreateProjectOpen,
            open: openCreateProject,
            close: closeCreateProject,
        },
        createTask: {
            isOpen: isCreateTaskOpen,
            open: openCreateTask,
            close: closeCreateTask,
        },
        createWorkspace: {
            isOpen: isCreateWorkspaceOpen,
            open: openCreateWorkspace,
            close: closeCreateWorkspace,
        },
    };
}
