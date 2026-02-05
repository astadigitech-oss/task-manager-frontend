import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile } from "@/types/api/user.api";

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  profileBootstrapped?: boolean;
  
  defaultWorkspaceId: number | null;
  
  login: (data: { 
    user: UserProfile; 
    token: string;
    defaultWorkspaceId?: number; 
  }) => void;
  logout: () => void;
  updateUser: (user: Partial<UserProfile>) => void;
  setHydrated: (value: boolean) => void;
  
  setDefaultWorkspaceId: (workspaceId: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,
      defaultWorkspaceId: null,

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

      // NEW: Set default workspace (called when user switches workspace)
      setDefaultWorkspaceId: (workspaceId: number) => {
        set({ defaultWorkspaceId: workspaceId });
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
        }
      },
    }
  )
);