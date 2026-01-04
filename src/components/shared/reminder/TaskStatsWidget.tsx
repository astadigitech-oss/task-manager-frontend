"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDashboardTasks } from "@/hooks/useDashboardTask";
import { useAuthStore } from "@/store/useAuthStore";
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    TrendingUp,
    ListTodo,
} from "lucide-react";

export function TaskStatsWidget() {
    const { data: tasks = [], isLoading } = useDashboardTasks();
    const { user } = useAuthStore();

    const stats = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const myTasks = tasks.filter((task) => {
            if (user?.role === "admin") {
                return true;
            } else {
                return task.task_members?.some(member => member.user_id === user?.id);
            }
        });

        const total = myTasks.length;
        const completed = myTasks.filter((t) => t.status === "done").length;
        const inProgress = myTasks.filter((t) => t.status === "on-progress").length;
        const pending = myTasks.filter((t) => t.status === "on-board" || t.status === "pending").length;

        const overdue = myTasks.filter((t) => {
            if (t.status === "done" || t.status === "canceled") return false;
            if (!t.due_date) return false;

            const dueDate = new Date(t.due_date);
            const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
            return dueDateOnly < today;
        }).length;

        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            total,
            completed,
            inProgress,
            pending,
            overdue,
            completionRate,
        };
    }, [tasks, user?.id, user?.role]);

    const statCards = [
        {
            label: "Total Tasks",
            value: stats.total,
            icon: ListTodo,
            color: "bg-slate-100 text-slate-600",
            iconColor: "text-slate-600",
        },
        {
            label: "Completed",
            value: stats.completed,
            icon: CheckCircle2,
            color: "bg-green-100 text-green-600",
            iconColor: "text-green-600",
        },
        {
            label: "On Progress",
            value: stats.inProgress,
            icon: Clock,
            color: "bg-blue-100 text-blue-600",
            iconColor: "text-blue-600",
        },
        {
            label: "Overdue",
            value: stats.overdue,
            icon: AlertCircle,
            color: "bg-red-100 text-red-600",
            iconColor: "text-red-600",
        },
    ];

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Card className="p-6">
                    <div className="animate-pulse">
                        <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
                        <div className="h-3 bg-slate-200 rounded"></div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <TrendingUp className="size-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Completion Rate</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Your task progress</p>
                    </div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completionRate}%</div>
                </div>
                <Progress value={stats.completionRate} className="h-3" />
                <div className="flex items-center justify-between mt-3 text-xs text-slate-600 dark:text-slate-400">
                    <span>{stats.completed} completed</span>
                    <span>{stats.total - stats.completed} remaining</span>
                </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
                {statCards.map((stat) => (
                    <Card key={stat.label} className="p-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${stat.color}`}>
                                <stat.icon className={`size-4 ${stat.iconColor}`} />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">{stat.label}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}