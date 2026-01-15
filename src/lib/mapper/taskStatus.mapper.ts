import { TaskStatus } from "@/types/shared/status";

export function apiStatusToUi(status?: string | null): TaskStatus {
    if (!status) return "on_board";
    return status.replace(/_/g, "-") as TaskStatus;
}

export function uiStatusToApi(status?: TaskStatus | null): string | null {
    if (!status) return null;
    return status.replace(/-/g, "_");
}
