"use client"

import ProtectedRoute from "@/components/ProtectedRoute"

import { DashboardStats } from "@/components/shared/DashboardStats";
import { RecentProjects } from "@/components/shared/RecentProjects";
import { TeamActivity } from "@/components/shared/TeamActivity";
import { ProjectChart } from "@/components/shared/ProjectChart";
import { useWorkspace } from "@/context/WorkspaceContext";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function AdminDashboard() {
  const { projects, members } = useWorkspace();
  return (
    <ProtectedRoute>
      <div className="flex flex-col h-full">
        <div className="flex-shrink-0 p-6">
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
            <h1 className="text-xl font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's what's happening with your projects.
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <DashboardStats projects={projects} members={members} />

          <div className="grid gap-6 lg:grid-cols-2">
            <RecentProjects projects={projects} members={members} />
            <ProjectChart projects={projects} />
          </div>

          <TeamActivity members={members} projects={projects} />
        </div>
      </div>
    </ProtectedRoute>
  )
}
