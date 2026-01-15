"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/UserAvatar"; // ✅ Import UserAvatar
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDashboardTasks, useAdminDashboardTasks } from "@/hooks/useDashboardTask";
import { useAuthStore } from "@/store/useAuthStore";
import { selectUpcomingReminders } from "@/lib/selectors/reminder.selector";
import { Bell, Calendar, Clock, AlertCircle } from "lucide-react";
import { priorityConfig } from "@/constants/task";
import type { TaskApi } from "@/types/api/task.api";

interface ReminderGroup {
    date: string;
    dateLabel: string;
    tasks: TaskApi[];
    isOverdue?: boolean;
}

interface TaskReminderWidgetProps {
    isAdmin?: boolean;
}

export function TaskReminderWidget({ isAdmin = false }: TaskReminderWidgetProps) {
    const { data: userTasks = [], isLoading: isLoadingUser } = useDashboardTasks();
    const { data: adminTasks = [], isLoading: isLoadingAdmin } = useAdminDashboardTasks();
    const { user } = useAuthStore();

    const dashboardTasks = isAdmin ? adminTasks : userTasks;
    const isLoading = isAdmin ? isLoadingAdmin : isLoadingUser;

    const reminderGroups = useMemo<ReminderGroup[]>(() => {
        const formatDateLabel = (date: Date, isOverdue: boolean = false) => {
            if (isOverdue) return "Overdue";

            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

            if (dateOnly.getTime() === today.getTime()) {
                return "Today";
            } else if (dateOnly.getTime() === tomorrow.getTime()) {
                return "Tomorrow";
            } else {
                return date.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                });
            }
        };

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        let upcomingTasks: TaskApi[];
        let overdueTasks: TaskApi[];

        if (isAdmin) {
            const sevenDaysFromNow = new Date(today);
            sevenDaysFromNow.setDate(today.getDate() + 7);

            upcomingTasks = dashboardTasks.filter((task) => {
                if (!task.due_date) return false;
                if (task.status === "done" || task.status === "canceled") return false;

                const dueDate = new Date(task.due_date);
                const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

                return dueDateOnly >= today && dueDateOnly <= sevenDaysFromNow;
            });

            overdueTasks = dashboardTasks.filter((task) => {
                if (!task.due_date) return false;
                if (task.status === "done" || task.status === "canceled") return false;

                const dueDate = new Date(task.due_date);
                const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
                return dueDateOnly < today;
            });
        } else {
            upcomingTasks = selectUpcomingReminders(dashboardTasks, user?.id);

            overdueTasks = dashboardTasks.filter((task) => {
                if (!task.due_date) return false;
                if (task.status === "done" || task.status === "canceled") return false;

                const members = task.task_members || task.members || [];
                if (!members.some(m => m.user_id === user?.id)) return false;

                const dueDate = new Date(task.due_date);
                const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
                return dueDateOnly < today;
            });
        }

        const allTasks = [...overdueTasks, ...upcomingTasks].sort((a, b) => {
            const dateA = new Date(a.due_date!).getTime();
            const dateB = new Date(b.due_date!).getTime();
            return dateA - dateB;
        });

        const groups = allTasks.reduce((acc, task) => {
            const dueDate = new Date(task.due_date!);
            const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
            const isOverdue = dueDateOnly < today;
            const dateKey = isOverdue ? "overdue" : dueDate.toISOString().split("T")[0];

            if (!acc[dateKey]) {
                acc[dateKey] = {
                    date: dateKey,
                    dateLabel: formatDateLabel(dueDate, isOverdue),
                    tasks: [],
                    isOverdue,
                };
            }
            acc[dateKey].tasks.push(task);
            return acc;
        }, {} as Record<string, ReminderGroup>);

        return Object.values(groups);
    }, [dashboardTasks, user?.id, isAdmin]);

    const getPriorityColor = (priority: string) => {
        const colorMap: Record<string, string> = {
            low: "border-l-green-500",
            normal: "border-l-blue-500",
            high: "border-l-yellow-500",
            urgent: "border-l-orange-500",
            critical: "border-l-red-500",
            tbd: "border-l-slate-400",
        };
        return colorMap[priority] || "border-l-slate-300";
    };

    const renderTask = (task: TaskApi, isOverdue: boolean = false) => {
        const displayMembers = task.task_members ?? [];

        return (
            <div
                key={task.id}
                className={`p-3 rounded-lg border-l-4 ${isOverdue
                        ? "bg-red-50 dark:bg-red-900/20 border-l-red-500"
                        : "bg-white dark:bg-slate-800"
                    } hover:shadow-sm transition-shadow ${!isOverdue && getPriorityColor(task.priority)}`}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                            {task.title}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="text-xs capitalize">
                                {task.status.replace("-", " ")}
                            </Badge>
                            <Badge
                                variant="secondary"
                                className={`text-xs font-medium ${priorityConfig[task.priority]?.className || 'badge-normal'}`}
                            >
                                {priorityConfig[task.priority]?.label || task.priority}
                            </Badge>
                            {isOverdue && (
                                <Badge variant="destructive" className="text-xs">
                                    Overdue
                                </Badge>
                            )}
                        </div>
                    </div>

                    {displayMembers.length > 0 && (
                        <div className="flex flex-col gap-1 shrink-0">
                            {displayMembers.slice(0, 2).map((member) => (
                                <div key={member.user_id} className="flex items-center gap-2">
                                    <UserAvatar
                                        name={member.name}
                                        avatar={member.avatar}
                                        size="sm"
                                        className="size-6"
                                    />
                                    <span className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-25">
                                        {member.name}
                                    </span>
                                </div>
                            ))}
                            {displayMembers.length > 2 && (
                                <span className="text-xs text-slate-500 dark:text-slate-400 ml-8">
                                    +{displayMembers.length - 2} more
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const totalReminders = reminderGroups.reduce(
        (sum, group) => sum + group.tasks.length,
        0
    );

    const overdueCount = reminderGroups.find(g => g.isOverdue)?.tasks.length || 0;

    if (isLoading) {
        return (
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                        <Bell className="size-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                            {isAdmin ? "All Task Reminders" : "Task Reminders"}
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Loading...</p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <Bell className="size-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {isAdmin ? "All Task Reminders" : "Task Reminders"}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {isAdmin ? "All team tasks - upcoming & overdue" : "Upcoming & overdue tasks"}
                    </p>
                </div>
                <div className="flex gap-2">
                    {overdueCount > 0 && (
                        <Badge variant="destructive" className="text-base px-3 py-1 font-bold">
                            {overdueCount} Overdue
                        </Badge>
                    )}
                    <Badge variant="secondary" className="text-base px-3 py-1 font-bold">
                        {totalReminders} Total
                    </Badge>
                </div>
            </div>

            {overdueCount > 0 && (
                <Alert className="mb-4 border-red-200 bg-red-50 dark:bg-red-900/20">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-sm text-red-800 dark:text-red-200">
                        {isAdmin
                            ? `There are ${overdueCount} overdue ${overdueCount === 1 ? "task" : "tasks"} across all teams!`
                            : `You have ${overdueCount} overdue ${overdueCount === 1 ? "task" : "tasks"} that need attention!`
                        }
                    </AlertDescription>
                </Alert>
            )}

            <div className="space-y-6 max-h-125 overflow-y-auto">
                {reminderGroups.map((group) => (
                    <div key={group.date} className="space-y-3">
                        <div className="flex items-center gap-2 sticky top-0 bg-white dark:bg-slate-900 py-2 z-10">
                            {group.isOverdue ? (
                                <AlertCircle className="size-4 text-red-500" />
                            ) : (
                                <Clock className="size-4 text-slate-400 dark:text-slate-500" />
                            )}
                            <h3 className={`text-sm font-semibold ${group.isOverdue
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-slate-700 dark:text-slate-300"
                                }`}>
                                {group.dateLabel}
                            </h3>
                            <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                {group.tasks.length} {group.tasks.length === 1 ? "task" : "tasks"}
                            </span>
                        </div>
                        <div className="space-y-2">
                            {group.tasks.map((task) => renderTask(task, group.isOverdue))}
                        </div>
                    </div>
                ))}
            </div>

            {totalReminders === 0 && (
                <div className="text-center py-12">
                    <Calendar className="size-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">All clear!</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                        No upcoming reminders or overdue tasks
                    </p>
                </div>
            )}
        </Card>
    );
}