import { TaskStatus } from '@/types/shared/status';
import { TaskPriority } from "@/types/shared/priority";

export const statusConfig: Record<
  TaskStatus,
  { label: string; className: string }
> = {
  on_board: {
    label: "On Board",
    className: "status-on-board",
  },
  on_progress: {
    label: "On Progress",
    className: "status-on-progress",
  },
  pending: {
    label: "Pending",
    className: "status-pending",
  },
  canceled: {
    label: "Canceled",
    className: "status-canceled",
  },
  done: {
    label: "Done",
    className: "status-done",
  },
};


export const priorityConfig: Record<
  TaskPriority,
  { label: string; className: string; color: string }
> = {
  low: {
    label: "Low",
    className: "badge-low",
    color: "#10b981"
  },
  normal: {
    label: "Normal",
    className: "badge-normal",
    color: "#0ea5e9"
  },
  high: {
    label: "High",
    className: "badge-high",
    color: "#f59e0b"
  },
  urgent: {
    label: "Urgent",
    className: "badge-urgent",
    color: "#ea580c"
  },
  critical: {
    label: "Critical",
    className: "badge-critical",
    color: "#dc2626"
  },
  tbd: {
    label: "TBD",
    className: "badge-tbd",
    color: "#64748b"
  },
};

