export function validateWorkspaceProject(
    workspaceId: number | null,
    projectId: number | null
): { valid: boolean; error?: string } {
    if (!workspaceId) {
        return {
            valid: false,
            error: "Workspace ID tidak valid"
        };
    }

    if (!projectId) {
        return {
            valid: false,
            error: "Project ID tidak valid"
        };
    }

    return { valid: true };
}


export function logValidationError(
    context: string,
    workspaceId: number | null,
    projectId: number | null
) {
    console.error(`⚠️ [${context}] Invalid IDs:`, {
        workspaceId,
        projectId,
        timestamp: new Date().toISOString()
    });
}