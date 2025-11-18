"use client";

import { useState } from "react";
import { ProjectList } from "@/components/shared/ProjectsList";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Plus, Search } from "lucide-react";
import { CreateProjectDialog } from "@/components/modals/CreateProjectDialog";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useModal } from "../../../hooks/useModal";

interface ProjectsPageProps {
  onNavigate: (page: string, projectId?: string) => void;
}

export default function ProjectsPage({ onNavigate }: ProjectsPageProps) {
  const {
    projects,
    members,
    deleteProject,
    addProject,
    selectedWorkspaceId,
  } = useWorkspace();

  const { createProject } = useModal();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesWorkspace = selectedWorkspaceId 
      ? project.workspaceId === selectedWorkspaceId 
      : true;
    
    return matchesSearch && matchesWorkspace;
  });

  const handleCreateProject = (project: any) => {
    addProject(project);
  };

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-foreground font-bold">Projects</h1>
              <p className="text-muted-foreground mt-1">
                Kelola dan pantau semua project Anda
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

      {/* Content */}
      <div className="p-6">
        <ProjectList 
          projects={filteredProjects} 
          members={members}
          onDelete={deleteProject}
          onViewDetail={(projectId) => onNavigate("project-detail", projectId)}
        />
      </div>

      <CreateProjectDialog
        isOpen={createProject.isOpen}
        onClose={createProject.close}
        onCreate={handleCreateProject}
        members={members}
      />
    </div>
  );
}
