import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileService } from "@/services/profile.service";
import { useAuthStore } from "@/store/useAuthStore";

export function useUpdateProfile() {
    const queryClient = useQueryClient();
    const { updateUser } = useAuthStore();

    return useMutation({
        mutationFn: (formData: FormData) => profileService.updateMyProfile(formData),
        onSuccess: (data) => {

            const updatedData = {
                ...data,
                avatar: data.avatar ? `${data.avatar}?t=${Date.now()}` : data.avatar,
            };

            updateUser(updatedData);

            queryClient.invalidateQueries({ queryKey: ["profile"] });
            queryClient.invalidateQueries({ queryKey: ["user"] });
            
            queryClient.refetchQueries({ queryKey: ["profile"] });
        },
        onError: (error) => {
            console.error("❌ Profile update error:", error);
        },
    });
}