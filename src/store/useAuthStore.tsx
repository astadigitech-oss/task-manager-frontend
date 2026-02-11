import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile } from "@/types/api/user.api";

export interface AttendanceFormData {
  activity: string;
  obstacle: string;
  images: File[];
  previews: string[];
  submittedAt: string; // ISO timestamp
  workspaceId: number;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  profileBootstrapped?: boolean;
  
  defaultWorkspaceId: number | null;
  
  // Attendance state
  todayAttendance: Record<number, AttendanceFormData>; // key: workspaceId
  
  login: (data: { 
    user: UserProfile; 
    token: string;
    defaultWorkspaceId?: number; 
  }) => void;
  logout: () => void;
  updateUser: (user: Partial<UserProfile>) => void;
  setHydrated: (value: boolean) => void;
  
  setDefaultWorkspaceId: (workspaceId: number) => void;
  
  // Attendance actions
  saveAttendance: (workspaceId: number, data: Omit<AttendanceFormData, 'submittedAt' | 'workspaceId'>) => void;
  getAttendance: (workspaceId: number) => AttendanceFormData | null;
  hasSubmittedToday: (workspaceId: number) => boolean;
  clearExpiredAttendance: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,
      defaultWorkspaceId: null,
      todayAttendance: {},

      setHydrated: (value: boolean) => set({ isHydrated: value }),

      login: ({ user, token, defaultWorkspaceId }) => {
        set({
          user,
          token,
          isAuthenticated: true,
          defaultWorkspaceId: defaultWorkspaceId ?? null,
        });

        if (typeof window !== "undefined") {
          document.cookie = `token=Bearer ${token}; path=/; max-age=${60 * 60 * 24}; SameSite=Strict`;
          document.cookie = `role=${user.role}; path=/; max-age=${60 * 60 * 24}; SameSite=Strict`;
          window.dispatchEvent(new Event('user-logged-in'));
        }
      },

      updateUser: (updatedFields) => {
        set((state) => {
          if (!state.user) return state;
          
          const hasChanges = Object.keys(updatedFields).some(
            key => updatedFields[key as keyof typeof updatedFields] !== state.user![key as keyof UserProfile]
          );
          
          if (!hasChanges) return state;
          
          return {
            user: { ...state.user, ...updatedFields }
          };
        });
      },

      setDefaultWorkspaceId: (workspaceId: number) => {
        set({ defaultWorkspaceId: workspaceId });
      },

      // Save attendance after successful submission
      saveAttendance: (workspaceId, data) => {
        set((state) => ({
          todayAttendance: {
            ...state.todayAttendance,
            [workspaceId]: {
              ...data,
              submittedAt: new Date().toISOString(),
              workspaceId,
            }
          }
        }));
      },

      // Get attendance for specific workspace
      getAttendance: (workspaceId) => {
        const attendance = get().todayAttendance[workspaceId];
        if (!attendance) return null;

        // Check if attendance is from today
        const submittedDate = new Date(attendance.submittedAt);
        const today = new Date();
        
        const isSameDay = 
          submittedDate.getDate() === today.getDate() &&
          submittedDate.getMonth() === today.getMonth() &&
          submittedDate.getFullYear() === today.getFullYear();

        return isSameDay ? attendance : null;
      },

      // Check if user has submitted attendance today
      hasSubmittedToday: (workspaceId) => {
        const attendance = get().getAttendance(workspaceId);
        return attendance !== null;
      },

      // Clear expired attendance (called on mount/midnight)
      clearExpiredAttendance: () => {
        const today = new Date();
        const filtered: Record<number, AttendanceFormData> = {};

        Object.entries(get().todayAttendance).forEach(([workspaceId, attendance]) => {
          const submittedDate = new Date(attendance.submittedAt);
          
          const isSameDay = 
            submittedDate.getDate() === today.getDate() &&
            submittedDate.getMonth() === today.getMonth() &&
            submittedDate.getFullYear() === today.getFullYear();

          if (isSameDay) {
            filtered[Number(workspaceId)] = attendance;
          }
        });

        set({ todayAttendance: filtered });
      },

      logout: () => {
        if (typeof window !== "undefined") {
          document.cookie = `token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
          document.cookie = `role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
        }

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          defaultWorkspaceId: null,
          todayAttendance: {},
        });

        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("auth-storage");
            window.dispatchEvent(new Event('user-logged-out'));
          } catch (e) {
            console.error("Error during logout cleanup:", e);
          }
        }
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);

          if (state.token && typeof window !== "undefined") {
            document.cookie = `token=Bearer ${state.token}; path=/; max-age=${60 * 60 * 24}; SameSite=Strict`;
          }

          // Clear expired attendance on rehydration
          state.clearExpiredAttendance();
        }
      },
    }
  )
);