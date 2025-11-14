// store/useAuthStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Division } from "@/types/index";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: "admin" | "member") => Promise<void>; // ← Tambah param role
  logout: () => void;
  register: (name: string, email: string, password: string, division: Division) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string, role: "admin" | "member") => {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // ✅ Gunakan role yang dipilih user
        const mockUser: User = {
          id: crypto.randomUUID(),
          name: role === "admin" ? "Admin User" : "Member User",
          email: email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          role: role, // ← Pakai role dari parameter
          projectsCount: 0,
          tasksCompleted: 0,
          division: role === "admin" ? "project-management" : "frontend",
          password: ""
        };

        set({ user: mockUser, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
        localStorage.removeItem("auth-storage");
        sessionStorage.clear();
      },

      register: async (name: string, email: string, password: string, division: Division) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const newUser: User = {
          id: crypto.randomUUID(),
          name,
          email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          role: "member", // Default role untuk register
          projectsCount: 0,
          tasksCompleted: 0,
          division: division,
          password: ""
        };

        console.log("User registered:", newUser);
        
        // Setelah register, auto login
        set({ user: newUser, isAuthenticated: true });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);