
export const taskKeys = {
    all: ['tasks'] as const,

    lists: () => [...taskKeys.all, 'list'] as const,
    list: (workspaceId: number, projectId: number) =>
        [...taskKeys.lists(), { workspaceId, projectId }] as const,

    details: () => [...taskKeys.all, 'detail'] as const,
    detail: (workspaceId: number, projectId: number, taskId: number) =>
        [...taskKeys.details(), { workspaceId, projectId, taskId }] as const,

    members: (workspaceId: number, projectId: number, taskId: number) =>
        [...taskKeys.all, 'members', { workspaceId, projectId, taskId }] as const,

    images: (workspaceId: number, projectId: number, taskId: number) =>
        [...taskKeys.all, 'images', { workspaceId, projectId, taskId }] as const,

    imagesBefore: (workspaceId: number, projectId: number, taskId: number) =>
        [...taskKeys.all, 'images', 'before', { workspaceId, projectId, taskId }] as const,

    imagesAfter: (workspaceId: number, projectId: number, taskId: number) =>
        [...taskKeys.all, 'images', 'after', { workspaceId, projectId, taskId }] as const,

};

export const invalidateTaskQueries = {

    allInProject: (queryClient: any, workspaceId: number, projectId: number) => {
        queryClient.invalidateQueries({
            queryKey: taskKeys.list(workspaceId, projectId)
        });
    },

    taskDetail: (queryClient: any, workspaceId: number, projectId: number, taskId: number) => {
        queryClient.invalidateQueries({
            queryKey: taskKeys.detail(workspaceId, projectId, taskId)
        });
    },

    taskMembers: (queryClient: any, workspaceId: number, projectId: number, taskId: number) => {
        queryClient.invalidateQueries({
            queryKey: taskKeys.members(workspaceId, projectId, taskId)
        });
    },

    taskImages: (queryClient: any, workspaceId: number, projectId: number, taskId: number) => {
        queryClient.invalidateQueries({
            queryKey: [...taskKeys.all, 'images']
        });
    },

    taskImagesBefore: (queryClient: any, workspaceId: number, projectId: number, taskId: number) => {
        queryClient.invalidateQueries({
            queryKey: taskKeys.imagesBefore(workspaceId, projectId, taskId)
        });
    },

    taskImagesAfter: (queryClient: any, workspaceId: number, projectId: number, taskId: number) => {
        queryClient.invalidateQueries({
            queryKey: taskKeys.imagesAfter(workspaceId, projectId, taskId)
        });
    },

    taskFiles: (queryClient: any, workspaceId: number, projectId: number, taskId: number) => {
        queryClient.invalidateQueries({
            queryKey: taskKeys.images(workspaceId, projectId, taskId)
        });
    },
};

export const fileKeys = {
    list: (workspace_id: number, project_id: number, task_id: number) =>
        ["files", "list", workspace_id, project_id, task_id] as const,
};
