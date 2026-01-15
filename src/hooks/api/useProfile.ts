import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileService } from "@/services/profile.service";
import { useAuthStore } from "@/store/useAuthStore";

export function useUpdateProfile() {
    const { updateUser } = useAuthStore();

    return useMutation({
        mutationFn: (formData: FormData) => profileService.updateMyProfile(formData),
        onSuccess: (data) => {
            // Update Zustand store langsung
            updateUser(data);
        },
        onError: (error) => {
            console.error("Profile update error:", error);
        },
    });
}