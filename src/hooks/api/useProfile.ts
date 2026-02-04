import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileService } from "@/services/profile.service";
import { useAuthStore } from "@/store/useAuthStore";
import { showSuccessToast, showErrorToast } from "@/lib/helpers/toast-helpers";

export function useGetProfile() {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: ["profile", user?.id],
        queryFn: async () => {
            const profile = await profileService.getMyProfile(user ?? undefined);
            return profile;
        },
        enabled: !!user,
        staleTime: 10 * 60 * 1000, 
        gcTime: 15 * 60 * 1000, 
        refetchOnWindowFocus: false,
        refetchOnMount: false, 

    });
}

export function useUpdateProfile() {
    const { updateUser } = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData: FormData) => profileService.updateMyProfile(formData),
        onSuccess: (updatedProfile) => {
            queryClient.setQueryData(
                ["profile", updatedProfile.id], 
                updatedProfile
            );

            updateUser({
                name: updatedProfile.name,
                avatar: updatedProfile.avatar,
                position: updatedProfile.position,
                updated_at: updatedProfile.updated_at,
            });

            queryClient.invalidateQueries({ 
                queryKey: ["profile"],
                refetchType: 'none'
            });
            
            showSuccessToast("Profile berhasil diupdate");
        },
        onError: (error: any) => {
            console.error("Profile update error:", error);
            const message = error.response?.data?.message || "Gagal mengupdate profile";
            showErrorToast(message);
        },
    });
}