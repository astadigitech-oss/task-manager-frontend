import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { filesService } from "@/services/task/taskFiles.service";
import { TaskFileApi } from "@/types/api/task.api";
import { showErrorToast } from "@/lib/helpers/toast-helpers";

// ─── query keys ──────────────────────────────────────────────────────────────
// Tambahkan ke @/lib/react-query/taskKeys.ts (atau buat fileKeys tersendiri)
//
//   export const fileKeys = {
//       list: (workspace_id: number, project_id: number, task_id: number) =>
//           ["files", "list", workspace_id, project_id, task_id] as const,
//   };
//
// Di bawah kita inline dulu sebagai referensi.

export const fileKeys = {
    list: (workspace_id: number, project_id: number, task_id: number) =>
        ["files", "list", workspace_id, project_id, task_id] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// useTaskFiles — ambil semua files dari sebuah task
// ─────────────────────────────────────────────────────────────────────────────
export function useTaskFiles(
    workspace_id: number | null,
    project_id: number | null,
    task_id: number | null
) {
    const enabled =
        workspace_id !== null &&
        project_id !== null &&
        task_id !== null &&
        workspace_id > 0 &&
        project_id > 0 &&
        task_id > 0;

    return useQuery({
        queryKey: fileKeys.list(
            workspace_id ?? 0,
            project_id ?? 0,
            task_id ?? 0
        ),
        queryFn: async () => {
            const res = await filesService.list(
                workspace_id!,
                project_id!,
                task_id!
            );
            return res.data; // TaskFileApi[]
        },
        enabled,
        staleTime: 1000 * 60,       // 1 menit
        gcTime: 1000 * 60 * 5,      // 5 menit (ganti cacheTime kalau react-query v4)
        select: (data) => data ?? [],
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// useUploadTaskFiles — upload satu atau lebih file
// ─────────────────────────────────────────────────────────────────────────────
export function useUploadTaskFiles() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            workspaceId,
            projectId,
            taskId,
            files,
            options,
        }: {
            workspaceId: number;
            projectId: number;
            taskId: number;
            files: File[];
            options?: { onProgress?: (progress: number) => void };
        }) => {
            return filesService.upload(workspaceId, projectId, taskId, files, options);
        },
        onSuccess: (_data, variables) => {
            // Invalidate list supaya auto-refetch
            queryClient.invalidateQueries({
                queryKey: fileKeys.list(variables.workspaceId, variables.projectId, variables.taskId),
            });
        },
        onError: (error) => {
            console.error("Upload file failed:", error);
            showErrorToast("Gagal upload file", "Silakan coba lagi.");
        },
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// useDeleteTaskFile — hapus satu file
// ─────────────────────────────────────────────────────────────────────────────
export function useDeleteTaskFile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            workspaceId,
            projectId,
            taskId,
            fileId,
        }: {
            workspaceId: number;
            projectId: number;
            taskId: number;
            fileId: number;
        }) => {
            return filesService.delete(workspaceId, projectId, taskId, fileId);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: fileKeys.list(variables.workspaceId, variables.projectId, variables.taskId),
            });
        },
        onError: (error) => {
            console.error("Delete file failed:", error);
            showErrorToast("Gagal menghapus file", "Silakan coba lagi.");
        },
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// useDownloadTaskFile — trigger download
// (tidak perlu invalidate query, murni side-effect)
// ─────────────────────────────────────────────────────────────────────────────
export function useDownloadTaskFile() {
    return useMutation({
        mutationFn: async ({
            workspaceId,
            projectId,
            taskId,
            fileId,
            filename,
        }: {
            workspaceId: number;
            projectId: number;
            taskId: number;
            fileId: number;
            filename?: string;
        }) => {
            return filesService.download(workspaceId, projectId, taskId, fileId, filename);
        },
        onError: (error) => {
            console.error("Download file failed:", error);
            showErrorToast("Gagal download file", "Silakan coba lagi.");
        },
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// useViewTaskFile — ambil blob URL untuk preview (misal di modal)
// ─────────────────────────────────────────────────────────────────────────────
export function useViewTaskFile() {
    return useMutation({
        mutationFn: async ({
            workspaceId,
            projectId,
            taskId,
            fileId,
        }: {
            workspaceId: number;
            projectId: number;
            taskId: number;
            fileId: number;
        }) => {
            return filesService.view(workspaceId, projectId, taskId, fileId);
            // returns: string (blob URL)
        },
        onError: (error) => {
            console.error("View file failed:", error);
            showErrorToast("Gagal membuka preview", "Silakan coba lagi.");
        },
    });
}