"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectImageService } from "@/services/projects/projectImage.service";
import { projectKeys } from "@/lib/react-query/projectKeys";

export const useUploadProjectImage = (project_id: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (file: File) => {
            const res = await projectImageService.upload(project_id, file);
            if (!res.success || !res.data) {
                throw new Error("Upload gagal");
            }
            return res.data;
        },

        onSuccess: () => {
            // ini yang bikin image langsung muncul
            queryClient.invalidateQueries({
                queryKey: projectKeys.images(project_id),
            });
        },
    });
};
