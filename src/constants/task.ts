import { TaskStatus } from '@/types/shared/status';
import { TaskPriority } from "@/types/shared/priority";
import { TaskSortConfig } from '@/types/api/task.api';
import { ArrowUpDown, Calendar, Clock, Flag, ArrowUpAZ, ArrowDownAZ } from 'lucide-react';

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


export const TASK_SORT_OPTIONS: TaskSortConfig[] = [
  // {
  //   value: 'manual',
  //   label: 'Manual Order',
  //   icon: ArrowUpDown
  // },
  {
    value: 'priority-high-low',
    label: 'Priority: High to Low',
    icon: Flag
  },
  {
    value: 'priority-low-high',
    label: 'Priority: Low to High',
    icon: Flag
  },
  {
    value: 'due-date-asc',
    label: 'Due Date: Earliest First',
    icon: Calendar
  },
  {
    value: 'due-date-desc',
    label: 'Due Date: Latest First',
    icon: Calendar
  },
  {
    value: 'created-asc',
    label: 'Created: Oldest First',
    icon: Clock
  },
  {
    value: 'created-desc',
    label: 'Created: Newest First',
    icon: Clock
  },
  {
    value: 'title-asc',
    label: 'Title: A to Z',
    icon: ArrowDownAZ
  },
  {
    value: 'title-desc',
    label: 'Title: Z to A',
    icon: ArrowUpAZ
  },
];

export const PRIORITY_WEIGHT = {
  'critical': 5,
  'urgent': 4,
  'high': 3,
  'normal': 2,
  'low': 1,
  'tbd': 0
};