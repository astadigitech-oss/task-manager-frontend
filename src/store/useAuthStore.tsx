// store/useAuthStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Division } from "@/types/index";
import { showSuccessToast, showErrorToast } from "@/lib/toast-helpers";
import { toast } from "sonner";

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
        try {
          // Validasi
          if (!email.trim()) {
            toast.error("Email wajib diisi!", {
              description: "Silakan masukkan email Anda.",
            });
            throw new Error("Email required");
          }

          if (!password.trim()) {
            toast.error("Password wajib diisi!", {
              description: "Silakan masukkan password Anda.",
            });
            throw new Error("Password required");
          }

          if (password.length < 6) {
            toast.error("Password terlalu pendek!", {
              description: "Password minimal 6 karakter.",
            });
            throw new Error("Password too short");
          }

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

          showSuccessToast("Login berhasil!", `Selamat datang, ${mockUser.name}!`);
        } catch (error) {
          if (error instanceof Error && error.message !== "Email required" && error.message !== "Password required" && error.message !== "Password too short") {
            showErrorToast("Login gagal", "Email atau password salah.");
          }
          throw error;
        }
      },

      logout: () => {
        const userName = useAuthStore.getState().user?.name;
        set({ user: null, isAuthenticated: false });
        localStorage.removeItem("auth-storage");
        sessionStorage.clear();

        showSuccessToast("Logout berhasil!", `Sampai jumpa, ${userName || 'User'}!`);
      },

      register: async (name: string, email: string, password: string, division: Division) => {
        try {
          // Validasi
          if (!name.trim()) {
            toast.error("Nama wajib diisi!", {
              description: "Silakan masukkan nama Anda.",
            });
            throw new Error("Name required");
          }

          if (name.trim().length < 3) {
            toast.error("Nama terlalu pendek!", {
              description: "Nama minimal 3 karakter.",
            });
            throw new Error("Name too short");
          }

          if (!email.trim()) {
            toast.error("Email wajib diisi!", {
              description: "Silakan masukkan email Anda.",
            });
            throw new Error("Email required");
          }

          // Simple email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            showErrorToast("Email tidak valid!", "Silakan masukkan email yang valid.");
            throw new Error("Invalid email");
          }

          if (!password.trim()) {
            showErrorToast("Password wajib diisi!", "Silakan masukkan password Anda.");
            throw new Error("Password required");
          }

          if (password.length < 6) {
            showErrorToast("Password terlalu pendek!", "Password minimal 6 karakter.");
            throw new Error("Password too short");
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));

          const newUser: User = {
            id: crypto.randomUUID(),
            name: name.trim(),
            email: email.trim(),
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

          showSuccessToast("Registrasi berhasil!", `Selamat datang, ${newUser.name}!`);
        } catch (error) {
          if (error instanceof Error &&
              !["Name required", "Name too short", "Email required", "Invalid email", "Password required", "Password too short"].includes(error.message)) {
            showErrorToast("Registrasi gagal", "Terjadi kesalahan saat registrasi.");
          }
          throw error;
        }
      },
    }),
    {
      name: "auth-storage",
    }
  )
);