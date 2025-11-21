"use client";

import { useState } from "react";
import { ProjectList } from "@/components/shared/ProjectList";
import { Input } from "../../../components/ui/input";
import { Search, Home, FolderKanban } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Separator } from "@/components/ui/separator";

interface ProjectsPageProps {
  onNavigate: (page: string, projectId?: string) => void;
}

export default function ProjectsPage({ onNavigate }: ProjectsPageProps) {
  const {
    projects,
    members,
    deleteProject,
    updateProject,
    selectedWorkspaceId,
  } = useWorkspace();

  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { user } = useAuthStore();

  const filteredProjects = projects.filter(project => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesWorkspace = selectedWorkspaceId
      ? project.workspaceId === selectedWorkspaceId
      : true;

    return matchesSearch && matchesWorkspace;
  });

  const dashboardPath = user?.role === "admin" ? "/admin/dashboard" : "/member/dashboard";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-card">
        <div className="px-6 py-6">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => router.push(dashboardPath)}
                >
                  <Home className="w-4 h-4" />
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="flex items-center gap-2">
                  <FolderKanban className="w-4 h-4" />
                  Projects
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Projects
              </h1>
              <p className="text-muted-foreground mt-1">
                Kelola dan Pantau Semua Project Anda
              </p>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <ProjectList
          projects={filteredProjects}
          members={members}
          onDelete={deleteProject}
          onUpdate={updateProject}
          onViewDetail={(projectId) => onNavigate("project-detail", projectId)}
          isReadOnly={true} // Member mode - view only
        />
      </div>
    </div>
  );
}
