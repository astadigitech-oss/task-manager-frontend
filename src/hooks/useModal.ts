import { useUIStore } from "../store/useUIStore";

export function useModal() {
  const {
    isCreateProjectOpen,
    isCreateTaskOpen,
    isCreateMemberOpen,
    isCreateWorkspaceOpen,
    openCreateProject,
    closeCreateProject,
    openCreateTask,
    closeCreateTask,
    openCreateMember,
    closeCreateMember,
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
    createMember: {
      isOpen: isCreateMemberOpen,
      open: openCreateMember,
      close: closeCreateMember,
    },
    createWorkspace: {
      isOpen: isCreateWorkspaceOpen,
      open: openCreateWorkspace,
      close: closeCreateWorkspace,
    },
  };
}
