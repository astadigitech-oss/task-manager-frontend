"use client";

import { useEffect } from "react";
import { useTask } from "@/context/TaskContext";

import { MyTasksWidget } from "@/components/shared/reminder/MyTaskWidget";
import { TaskStatsWidget } from "@/components/shared/reminder/TaskStatsWidget";
import { UpcomingDeadlinesWidget } from "@/components/shared/reminder/UpcomingDeadlinesWidget";
import { TaskReminderWidget } from "@/components/shared/reminder/TaskReminderWidget";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useParams } from "next/navigation";

export default function MemberDashboard() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { setSelectedWorkspaceId, setSelectedProjectId } = useTask();

  useEffect(() => {
    if (workspaceId) {
      setSelectedWorkspaceId(Number(workspaceId));
      setSelectedProjectId(null);
    }
  }, [workspaceId, setSelectedWorkspaceId, setSelectedProjectId]);

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 p-6">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Dashboard
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div>
          <h1 className="text-xl font-bold text-foreground">My Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track your tasks and upcoming deadlines
          </p>
        </div>
      </div>

      <Separator />
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <TaskStatsWidget />
          </div>
          <div className="lg:col-span-1">
            <MyTasksWidget />
          </div>
          <div className="lg:col-span-1">
            <UpcomingDeadlinesWidget />
          </div>
        </div>

        <div className="mt-6">
          <TaskReminderWidget />
        </div>
      </div>
    </div>
  );
}
