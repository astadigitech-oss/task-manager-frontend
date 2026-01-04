"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { UserAvatar } from "@/components/shared/UserAvatar"; // ✅ Import UserAvatar

import { useDashboardTasks } from "@/hooks/useDashboardTask";
import { useUpdateTask } from "@/hooks/task/useTask";
import { useAuthStore } from "@/store/useAuthStore";

import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";

import { statusConfig, priorityConfig } from "@/constants/task";
import type { TaskApi } from "@/types/api/task.api";

interface CategorizedTasks {
    overdue: TaskApi[];
    today: TaskApi[];
    thisWeek: TaskApi[];
    upcoming: TaskApi[];
}

export function MyTasksWidget() {
    const { user } = useAuthStore();
    const { data: tasks = [], isLoading } = useDashboardTasks();
    const updateTaskMutation = useUpdateTask();

    const categorizedTasks = useMemo<CategorizedTasks>(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 3);

        const myTasks = tasks.filter((task) => {
            if (task.status === "done" || task.status === "canceled") return false;

            if (user?.role === "admin") return true;

            return task.task_members?.some((m) => m.user_id === user?.id);
        });

        return myTasks.reduce<CategorizedTasks>(
            (acc, task) => {
                if (!task.due_date) {
                    acc.upcoming.push(task);
                    return acc;
                }

                const due = new Date(task.due_date);
                const dueOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate());

                if (dueOnly < today) acc.overdue.push(task);
                else if (dueOnly.getTime() === today.getTime()) acc.today.push(task);
                else if (dueOnly <= weekFromNow) acc.thisWeek.push(task);
                else acc.upcoming.push(task);

                return acc;
            },
            { overdue: [], today: [], thisWeek: [], upcoming: [] }
        );
    }, [tasks, user?.id, user?.role]);

    const handleToggleComplete = (task: TaskApi) => {
        if (!task.project_id) return;

        updateTaskMutation.mutate({
            workspaceId: task.project_id,
            projectId: task.project_id,
            taskId: task.id,
            payload: {
                status: task.status === "done" ? "on-progress" : "done",
            },
        });
    };

    const formatDate = (date?: string) => {
        if (!date) return "No deadline";
        const d = new Date(date);
        const diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

        if (diff === 0) return "Today";
        if (diff === 1) return "Tomorrow";
        if (diff < 0) return `${Math.abs(diff)} days ago`;
        return `in ${diff} days`;
    };

    const renderTaskItem = (task: TaskApi) => (
        <div
            key={task.id}
            className="flex gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
            <Checkbox
                checked={task.status === "done"}
                onCheckedChange={() => handleToggleComplete(task)}
                className="mt-0.5"
            />

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{task.title}</p>

                <div className="flex gap-2 mt-1 flex-wrap">
                    <Badge variant="secondary" className={statusConfig[task.status]?.className}>
                        {statusConfig[task.status]?.label}
                    </Badge>
                    <Badge variant="secondary" className={priorityConfig[task.priority]?.className}>
                        {priorityConfig[task.priority]?.label}
                    </Badge>
                    {task.due_date && (
                        <span className="text-xs flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <Clock className="size-3" />
                            {formatDate(task.due_date)}
                        </span>
                    )}
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
                            <span className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[100px]">
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
    );

    const renderSection = (title: string, data: TaskApi[], icon: React.ReactNode) =>
        data.length > 0 && (
            <div>
                <div className="flex items-center gap-2 mb-2">
                    {icon}
                    <h3 className="text-sm font-semibold">{title}</h3>
                    <Badge variant="secondary">{data.length}</Badge>
                </div>
                <div className="space-y-1">{data.map(renderTaskItem)}</div>
            </div>
        );

    const totalTasks =
        categorizedTasks.overdue.length +
        categorizedTasks.today.length +
        categorizedTasks.thisWeek.length +
        categorizedTasks.upcoming.length;

    return (
        <Card className="p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-lg font-bold">My Tasks</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {isLoading ? "Loading..." : `${totalTasks} active ${totalTasks === 1 ? 'task' : 'tasks'}`}
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    <div className="space-y-6 max-h-[500px] overflow-y-auto">
                        {renderSection("Overdue", categorizedTasks.overdue, <AlertCircle className="size-4 text-red-500" />)}
                        {renderSection("Today", categorizedTasks.today, <Clock className="size-4 text-orange-500" />)}
                        {renderSection("This Week", categorizedTasks.thisWeek, <Clock className="size-4 text-blue-500" />)}
                        {renderSection("Upcoming", categorizedTasks.upcoming, <CheckCircle2 className="size-4 text-slate-400" />)}
                    </div>

                    {totalTasks === 0 && (
                        <div className="text-center py-12">
                            <CheckCircle2 className="size-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium">All tasks completed!</p>
                            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                                You have no active tasks at the moment
                            </p>
                        </div>
                    )}
                </>
            )}
        </Card>
    );
}