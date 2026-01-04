"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectImageService } from "@/services/projects/projectImage.service";
import { projectKeys } from "@/lib/react-query/projectKeys";

export const useDeleteProjectImage = (project_id: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (image_id: number) => {
            const res = await projectImageService.delete(project_id, image_id);
            if (!res.success) {
                throw new Error("Gagal menghapus gambar");
            }
            return image_id;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: projectKeys.images(project_id),
            });
        },
    });
};
