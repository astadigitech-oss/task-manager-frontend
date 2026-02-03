import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileService } from "@/services/profile.service";
import { useAuthStore } from "@/store/useAuthStore";
import { showSuccessToast, showErrorToast } from "@/lib/helpers/toast-helpers";

export function useGetProfile() {
    const { user, updateUser } = useAuthStore();

    return useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const profile = await profileService.getMyProfile(user ?? undefined);
            updateUser(profile);
            return profile;
        },
        enabled: !!user,
        staleTime: 5 * 60 * 1000,
    });
}

export function useUpdateProfile() {
    const { updateUser } = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData: FormData) => profileService.updateMyProfile(formData),
        onSuccess: (data) => {
            updateUser(data);
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            showSuccessToast("Profile berhasil diupdate");
        },
        onError: (error) => {
            console.error("Profile update error:", error);
            showErrorToast("Gagal mengupdate profile");
        },
    });
}