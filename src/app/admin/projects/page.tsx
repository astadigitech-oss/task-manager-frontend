"use client";

import { useEffect, useState, useMemo } from "react";
import { ProjectList } from "@/components/shared/ProjectList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Home, Loader2, CalendarCheck } from "lucide-react";
import { CreateProjectDialog } from "@/components/modals/CreateProjectDialog";
import { useProject } from "@/context/ProjectContext";
import { useModal } from "@/hooks/useModal";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/useAuthStore";
import { useWorkspace } from "@/context/WorkspaceContext";
import { AbsensiDialog } from "@/components/modals/AbsensiDialog";

export default function AdminProjectsPage() {
  const {
    projects,
    updateProject,
    deleteProject,
    selectedWorkspaceId,
    setSelectedWorkspaceId,
    isLoading,
  } = useProject();

  const { selectedWorkspace } = useWorkspace();
  const { createProject } = useModal();
  const { Attendance } = useModal();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { user } = useAuthStore();


  useEffect(() => {
    if (selectedWorkspace?.id) {
      setSelectedWorkspaceId(selectedWorkspace.id);
    }
  }, [selectedWorkspace?.id, setSelectedWorkspaceId]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesWorkspace = selectedWorkspaceId
        ? project.workspace_id === selectedWorkspaceId
        : true;

      return matchesSearch && matchesWorkspace;
    });
  }, [projects, searchQuery, selectedWorkspaceId]);

  const dashboardPath =
    user?.role === "admin" ? "/admin/dashboard" : "/member/dashboard";

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <Breadcrumb className="mb-3 sm:mb-4">
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
                <BreadcrumbPage>Projects</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl sm:text-xl font-bold">Projects</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {selectedWorkspace?.name || "All Workspaces"} • {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button
                onClick={createProject.open}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                <span className="sm:inline">Create Project</span>
              </Button>
              <Button
                onClick={Attendance.open}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
                size="sm"
              >
                <CalendarCheck className="w-4 h-4" />
                <span className="sm:inline">Daily Attendance</span>
              </Button>

              <div className="relative w-full sm:w-64">
                <Search className="absolute w-4 h-4 text-muted-foreground top-1/2 left-3 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari project..."
                  className="pl-10 w-full"
                />
              </div>
            </div>
          </div>
        </div>
        <Separator className="thick" />
      </div>

      {/* Content */}
      <div className="grow overflow-auto px-4 sm:px-6 py-6 sm:py-8">
        {isLoading ? (
          <div className="text-center py-12 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Tidak ada project yang cocok dengan pencarian"
                  : "Belum ada project"}
              </p>
              {!searchQuery && (
                <Button onClick={createProject.open} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Project Pertama
                </Button>
              )}
            </div>
          </div>
        ) : (
          <ProjectList
            projects={filteredProjects}
            onDelete={deleteProject}
            onUpdate={updateProject}
          />
        )}
      </div>

      <CreateProjectDialog
        isOpen={createProject.isOpen}
        onClose={createProject.close}
      />
      <AbsensiDialog
        isOpen={Attendance.isOpen}
        onClose={Attendance.close}
      />
    </div>
  );
}