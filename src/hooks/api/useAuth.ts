import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import type { AuthResponse, LoginRequest } from "@/types/api/user.api";
import { showErrorToast, showSuccessToast } from "@/lib/helpers/toast-helpers";
import { ApiError } from "@/lib/api/interceptors";
import { profileService } from "@/services/profile.service";


export const useLogin = () => {
  const loginStore = useAuthStore.getState().login;
  const updateUser = useAuthStore.getState().updateUser;
  const router = useRouter();

  return useMutation<AuthResponse, ApiError, LoginRequest>({
    mutationFn: async ({ email, password, role }) => {
      return await authService.login(email, password, role);
    },

    onSuccess: async (data, variables) => {
      if (!data.success) {
        showErrorToast(data.message || "Login gagal");
        return;
      }

      const { user, token } = data.data;

      // ============================
      // ROLE GUARD
      // ============================
      if (user.role !== variables.role) {
        showErrorToast(
          `Akun ini bukan ${variables.role}. Silakan pilih role yang sesuai.`
        );
        return;
      }
      loginStore({ user, token });

      showSuccessToast("Login berhasil!");
      router.replace(`/${user.role}/dashboard`);
    },

    onError: (error) => {
      showErrorToast(error.message);
    },
  });
};
