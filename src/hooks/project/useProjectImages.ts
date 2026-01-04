"use client";

import { useQuery } from "@tanstack/react-query";
import { projectImageService } from "@/services/projects/projectImage.service";
import { projectKeys } from "@/lib/react-query/projectKeys";
import { ProjectImageApi } from "@/types/api/project.api";

export const useProjectImages = (project_id: number) => {
    return useQuery<ProjectImageApi[]>({
        queryKey: projectKeys.images(project_id),
        queryFn: async () => {
            const res = await projectImageService.list(project_id);

            if (!res.success || !res.data) {
                throw new Error("Gagal memuat gambar project");
            }

            return res.data;
        },
        enabled: !!project_id,
        staleTime: 5 * 60 * 1000,
    });
};
