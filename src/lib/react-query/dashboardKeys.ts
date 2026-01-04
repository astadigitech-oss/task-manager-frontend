export const dashboardKeys = {
    all: ["dashboard"] as const,
    workspace: (workspaceId: number) =>
        ["dashboard", "workspace", workspaceId] as const,
};
