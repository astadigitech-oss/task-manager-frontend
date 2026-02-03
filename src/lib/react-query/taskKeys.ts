
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
            queryKey: taskKeys.images(workspaceId, projectId, taskId)
        });
    },

    taskFiles: (queryClient: any, workspaceId: number, projectId: number, taskId: number) => {
        queryClient.invalidateQueries({
            queryKey: taskKeys.images(workspaceId, projectId, taskId)
        });
    },
    
};