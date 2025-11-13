import { create } from "zustand";

interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Modal states
  isCreateProjectOpen: boolean;
  isCreateTaskOpen: boolean;
  isCreateMemberOpen: boolean;
  isCreateWorkspaceOpen: boolean;
  
  openCreateProject: () => void;
  closeCreateProject: () => void;
  
  openCreateTask: () => void;
  closeCreateTask: () => void;
  
  openCreateMember: () => void;
  closeCreateMember: () => void;
  
  openCreateWorkspace: () => void;
  closeCreateWorkspace: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  
  isCreateProjectOpen: false,
  isCreateTaskOpen: false,
  isCreateMemberOpen: false,
  isCreateWorkspaceOpen: false,
  
  openCreateProject: () => set({ isCreateProjectOpen: true }),
  closeCreateProject: () => set({ isCreateProjectOpen: false }),
  
  openCreateTask: () => set({ isCreateTaskOpen: true }),
  closeCreateTask: () => set({ isCreateTaskOpen: false }),
  
  openCreateMember: () => set({ isCreateMemberOpen: true }),
  closeCreateMember: () => set({ isCreateMemberOpen: false }),
  
  openCreateWorkspace: () => set({ isCreateWorkspaceOpen: true }),
  closeCreateWorkspace: () => set({ isCreateWorkspaceOpen: false }),
}));
