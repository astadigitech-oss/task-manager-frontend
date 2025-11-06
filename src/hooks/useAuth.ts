import { useAuthStore } from "@/store/useAuthStore";

export function useAuth() {
  const { user, isAuthenticated, login, logout, register } = useAuthStore();

  return {
    user,
    isAuthenticated,
    login,
    logout,
    register,
  };
}
