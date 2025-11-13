import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/index";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockUser: User = {
          id: "1",
          name: "John Doe",
          email: email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          role: "admin",
          projectsCount: 0,
          tasksCompleted: 0,
          division: ""
        };

        set({ user: mockUser, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
        localStorage.removeItem("auth-storage"); 
        sessionStorage.clear(); 
      },

      register: async (name: string, email: string, password: string) => {
        
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockUser: User = {
          id: "1",
          name: name,
          email: email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          role: "admin",
          projectsCount: 0,
          tasksCompleted: 0,
          division: ""
        };

        set({ user: mockUser, isAuthenticated: true });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
