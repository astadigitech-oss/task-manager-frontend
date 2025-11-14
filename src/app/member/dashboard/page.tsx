"use client"

import ProtectedRoute from "@/components/ProtectedRoute"

import { DashboardStats } from "@/components/shared/DashboardStats";
import { RecentProjects } from "@/components/shared/RecentProjects";
import { TeamActivity } from "@/components/shared/TeamActivity";
import { ProjectChart } from "@/components/shared/ProjectChart";
import { useWorkspace } from "@/context/WorkspaceContext";

export default function MemberDashboard() {
  const { projects, members } = useWorkspace();
  return (
    <ProtectedRoute>
      <div className="flex-1 p-6 space-y-6">
      <div>
        <h1 className="text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Welcome back! Here's what's happening with your projects.</p>
      </div>

      <DashboardStats projects={projects} members={members} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentProjects projects={projects} members={members} />
        <ProjectChart projects={projects} />
      </div>

      <TeamActivity members={members} projects={projects} />
    </div>
    </ProtectedRoute>
  )
}
