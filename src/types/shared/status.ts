export type ActivityType =
    | "status_change"
    | "attachment_upload"
    | "assignee_add"
    | "assignee_remove"
    | "date_change"
    | "priority_change"
    | "edit";

export type TaskStatus =
    | "on-board"
    | "on-progress"
    | "pending"
    | "canceled"
    | "done";
