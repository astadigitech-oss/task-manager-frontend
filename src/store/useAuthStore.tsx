import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile } from "@/types/api/user.api";

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  profileBootstrapped?: boolean;
  login: (data: { user: UserProfile; token: string }) => void;
  logout: () => void;
  updateUser: (user: Partial<UserProfile>) => void;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,

      setHydrated: (value: boolean) => set({ isHydrated: value }),

      login: ({ user, token }) => {
        set({
          user,
          token,
          isAuthenticated: true,
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
          
          // Cek apakah ada perubahan sebenarnya
          const hasChanges = Object.keys(updatedFields).some(
            key => updatedFields[key as keyof typeof updatedFields] !== state.user![key as keyof UserProfile]
          );
          
          // Hanya update jika ada perubahan
          if (!hasChanges) return state;
          
          return {
            user: { ...state.user, ...updatedFields }
          };
        });
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