"use client";

import { Card } from "@/components/ui/card";
import { FolderKanban, Users, CheckCircle2, Clock } from "lucide-react";
import type { Project } from "@/types";
import type { TeamMember } from "@/types";

interface DashboardStatsProps {
  projects: Project[];
  members: TeamMember[];
}

export function DashboardStats({ projects, members }: DashboardStatsProps) {
//   const activeProjects = projects.filter(p => p.status === "active").length;
  const totalTasks = projects.reduce((acc, p) => acc + p.tasksTotal, 0);
  const completedTasks = projects.reduce((acc, p) => acc + p.tasksCompleted, 0);
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
    {
      title: "Total Projects",
      value: projects.length,
    //   description: `${activeProjects} aktif`,
      icon: FolderKanban,
      color: "text-primary",
      bgColor: "badge-normal",
    },
    {
      title: "Team Members",
      value: members.length,
      description: "Anggota aktif",
      icon: Users,
      color: "text-primary",
      bgColor: "badge-low",
    },
    {
      title: "Tasks Selesai",
      value: completedTasks,
      description: `dari ${totalTasks} total tasks`,
      icon: CheckCircle2,
      color: "text-primary",
      bgColor: "badge-high",
    },
    {
      title: "Completion Rate",
      value: `${taskCompletionRate}%`,
      description: "Rata-rata penyelesaian",
      icon: Clock,
      color: "text-primary",
      bgColor: "badge-normal",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted mb-1">{stat.title}</p>
                <p className="text-foreground mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-muted">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
