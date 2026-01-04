"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useProject } from "@/context/ProjectContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import ProjectBoardLayout from "@/components/project/ProjectBoard";
import { Loader2 } from "lucide-react";

interface ProjectPageProps {
  params: Promise<{ id: number }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const project_id = Number(id);

  const { selectedWorkspaceId } = useWorkspace();

  const { projects, isLoading: projectsLoading } = useProject();
  const project = projects.find(p => p.id === project_id);

  const workspace_id = selectedWorkspaceId || project?.workspace_id;

  const handleNavigate = (page: string) => {
    router.push(`/member/${page}`);
  };

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!workspace_id || workspace_id === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-destructive">
            Workspace tidak ditemukan
          </h2>
          <p className="text-muted-foreground">
            Project ID: {project_id}
          </p>
          <p className="text-sm text-muted-foreground">
            selectedWorkspaceId: {selectedWorkspaceId || 'null'}<br />
            project.workspace_id: {project?.workspace_id || 'undefined'}
          </p>
          <button
            onClick={() => router.push('/member/projects')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Kembali ke Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProjectBoardLayout
      project_id={project_id}
      workspace_id={workspace_id}
      onNavigate={handleNavigate}
      mode="member"
    />
  );
}