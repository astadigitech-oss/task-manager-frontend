export type ActivityType =
    | "status_change"
    | "attachment_upload"
    | "assignee_add"
    | "assignee_remove"
    | "date_change"
    | "priority_change"
    | "edit";

export type TaskStatus =
    | "on_board"
    | "on_progress"
    | "pending"
    | "canceled"
    | "done";
