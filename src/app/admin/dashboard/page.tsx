"use client";

import { DashboardStats } from "@/components/shared/DashboardStats";
import { RecentProjects } from "@/components/shared/RecentProjects";
import { ProjectChart } from "@/components/shared/ProjectChart";
import { TaskReminderWidget } from "@/components/shared/reminder/TaskReminderWidget";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

export default function Admin() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 p-6">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Admin Dashboard
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div>
          <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here&apos;s what&apos;s happening across all projects.
          </p>
        </div>
      </div>

      <Separator />
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <DashboardStats />

        <TaskReminderWidget isAdmin={true} />

        <div className="grid gap-6 lg:grid-cols-1">
          <RecentProjects
            onViewDetail={(project) => {
              router.push(`/admin/projects/${project.id}`);
            }}
          />

          {/* <ProjectChart projects={[]} /> */}
        </div>
      </div>
    </div>
    
  );
}