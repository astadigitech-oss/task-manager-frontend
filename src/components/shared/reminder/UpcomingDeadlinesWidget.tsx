"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/UserAvatar"; // ✅ Import UserAvatar
import { useDashboardTasks } from "@/hooks/useDashboardTask";
import { useAuthStore } from "@/store/useAuthStore";
import { Calendar, Clock } from "lucide-react";
import { priorityConfig } from "@/constants/task";
import type { TaskApi } from "@/types/api/task.api";

interface DeadlineGroup {
    date: string;
    dateLabel: string;
    tasks: TaskApi[];
}

export function UpcomingDeadlinesWidget() {
    const { data: tasks = [], isLoading } = useDashboardTasks();
    const { user } = useAuthStore();

    const deadlineGroups = useMemo<DeadlineGroup[]>(() => {
        const formatDateLabel = (date: Date) => {
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
        const threeDaysFromNow = new Date(today);
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

        const upcomingTasks = tasks
            .filter((task) => {
                if (user?.role !== "admin") {
                    if (!task.task_members?.some(member => member.user_id === user?.id)) return false;
                }

                if (task.status === "done" || task.status === "canceled") return false;
                if (!task.due_date) return false;

                const dueDate = new Date(task.due_date);
                const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
                return dueDateOnly >= today && dueDateOnly <= threeDaysFromNow;
            })
            .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

        const groups = upcomingTasks.reduce((acc, task) => {
            const dueDate = new Date(task.due_date!);
            const dateKey = dueDate.toISOString().split("T")[0];

            if (!acc[dateKey]) {
                acc[dateKey] = {
                    date: dateKey,
                    dateLabel: formatDateLabel(dueDate),
                    tasks: [],
                };
            }
            acc[dateKey].tasks.push(task);
            return acc;
        }, {} as Record<string, DeadlineGroup>);

        return Object.values(groups);
    }, [tasks, user?.id, user?.role]);

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

    const renderTask = (task: TaskApi) => {
        return (
            <div
                key={task.id}
                className={`p-3 rounded-lg border-l-4 bg-white dark:bg-slate-800 hover:shadow-sm transition-shadow ${getPriorityColor(task.priority)}`}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">{task.title}</p>
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
                        </div>
                    </div>
                    
                    {task.task_members && task.task_members.length > 0 && (
                        <div className="flex flex-col gap-1 shrink-0">
                            {task.task_members.slice(0, 2).map((member) => (
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
                            {task.task_members.length > 2 && (
                                <span className="text-xs text-slate-500 dark:text-slate-400 ml-8">
                                    +{task.task_members.length - 2} more
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const totalDeadlines = deadlineGroups.reduce((sum, group) => sum + group.tasks.length, 0);

    if (isLoading) {
        return (
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                        <Calendar className="size-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Upcoming Deadlines</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Loading...</p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                    <Calendar className="size-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Upcoming Deadlines</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Your tasks in next 3 days</p>
                </div>
                <Badge variant="secondary" className="text-base px-3 py-1 font-bold">
                    {totalDeadlines}
                </Badge>
            </div>

            <div className="space-y-6 max-h-100 overflow-y-auto">
                {deadlineGroups.map((group) => (
                    <div key={group.date} className="space-y-3">
                        <div className="flex items-center gap-2 sticky top-0 bg-white dark:bg-slate-900 py-2">
                            <Clock className="size-4 text-slate-400 dark:text-slate-500" />
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{group.dateLabel}</h3>
                            <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                {group.tasks.length} {group.tasks.length === 1 ? "task" : "tasks"}
                            </span>
                        </div>
                        <div className="space-y-2">
                            {group.tasks.map((task) => renderTask(task))}
                        </div>
                    </div>
                ))}
            </div>

            {totalDeadlines === 0 && (
                <div className="text-center py-12">
                    <Calendar className="size-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No upcoming deadlines</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                        No tasks due in the next 3 days
                    </p>
                </div>
            )}
        </Card>
    );
}
