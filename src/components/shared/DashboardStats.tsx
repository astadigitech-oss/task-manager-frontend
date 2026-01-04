"use client";

import { Card } from "@/components/ui/card";
import { FolderKanban, Users, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { useProject } from "@/context/ProjectContext";
import { useUsersContext } from "@/context/UserContext";

export function DashboardStats() {
  const { projects, isLoading: projectsLoading } = useProject();
  const { users, isLoading: usersLoading } = useUsersContext();

  const totalTasks = projects.reduce((acc, p) => {
    return acc + 0;
  }, 0);

  const completedTasks = projects.reduce((acc, p) => {
    return acc + 0;
  }, 0);

  const taskCompletionRate = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;

  const stats = [
    {
      title: "Total Projects",
      value: projectsLoading ? "..." : projects.length,
      icon: FolderKanban,
      color: "text-primary",
      isLoading: projectsLoading,
    },
    {
      title: "Team Members",
      value: usersLoading ? "..." : users.length,
      description: "Anggota aktif",
      icon: Users,
      color: "text-primary",
      isLoading: usersLoading,
    },
    // {
    //   title: "Tasks Selesai",
    //   value: completedTasks,
    //   description: `dari ${totalTasks} total tasks`,
    //   icon: CheckCircle2,
    //   color: "text-primary",
    //   isLoading: false,
    // },
    // {
    //   title: "Completion Rate",
    //   value: `${taskCompletionRate}%`,
    //   description: "Rata-rata penyelesaian",
    //   icon: Clock,
    //   color: "text-primary",
    //   isLoading: false,
    // },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-foreground mb-1">{stat.title}</p>
                <div className="flex items-center gap-2 mb-1">
                  {stat.isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : (
                    <p className="text-foreground">
                      {stat.value}
                    </p>
                  )}
                </div>
                {stat.description && (
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                )}
              </div>
              <div className="p-3 rounded-lg">
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}