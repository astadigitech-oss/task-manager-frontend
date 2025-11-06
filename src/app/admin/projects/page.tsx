"use client";

import { useState } from "react";
import { ProjectList } from "@/components/shared/ProjectsList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { CreateProjectDialog } from "@/components/modals/CreateProjectDialog";
import type { Project, TeamMember } from "@/types";

const initialProjects: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Complete overhaul of company website with modern design",
    progress: 65,
    members: ["1", "2", "3"],
    tasksCompleted: 13,
    tasksTotal: 20,
    workspaceId: "1"
  },
  {
    id: "2",
    name: "Mobile App Development",
    description: "Native iOS and Android app for customer engagement",
    progress: 42,
    members: ["1", "4", "5"],
    tasksCompleted: 8,
    tasksTotal: 19,
    workspaceId: "2"
  },
  {
    id: "3",
    name: "Marketing Campaign Q4",
    description: "Holiday season marketing strategy and execution",
    progress: 15,
    members: ["2", "6"],
    tasksCompleted: 3,
    tasksTotal: 20,
    workspaceId: "2"
  },
  {
    id: "4",
    name: "Data Migration",
    description: "Migrate legacy database to new cloud infrastructure",
    progress: 30,
    members: ["4", "5"],
    tasksCompleted: 6,
    tasksTotal: 20,
    workspaceId: "1"
  },
  {
    id: "5",
    name: "Customer Portal",
    description: "Self-service portal for customer support",
    progress: 100,
    members: ["1", "3", "4"],
    tasksCompleted: 15,
    tasksTotal: 15,
    workspaceId: "1"
  }
];

const initialMembers: TeamMember[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@company.com",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    projectsCount: 4,
    tasksCompleted: 42
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.c@company.com",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    projectsCount: 3,
    tasksCompleted: 38
  },
  {
    id: "3",
    name: "Emma Davis",
    email: "emma.d@company.com",
    role: "member",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    projectsCount: 2,
    tasksCompleted: 29
  },
  {
    id: "4",
    name: "James Wilson",
    email: "james.w@company.com",
    role: "member",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    projectsCount: 3,
    tasksCompleted: 31
  },
  {
    id: "5",
    name: "Lisa Anderson",
    email: "lisa.a@company.com",
    role: "member",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
    projectsCount: 2,
    tasksCompleted: 25
  },
  {
    id: "6",
    name: "David Brown",
    email: "david.b@company.com",
    role: "member",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    projectsCount: 1,
    tasksCompleted: 12
  }
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [members] = useState<TeamMember[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = (project: Omit<Project, "id">) => {
    const newProject: Project = {
      ...project,
      id: (projects.length + 1).toString(),
      workspaceId: "1" // Default workspace ID
    };
    setProjects([newProject, ...projects]);
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-slate-900">Projects</h1>
              <p className="text-slate-600 mt-1">
                Kelola dan pantau semua project Anda
              </p>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Cari project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setIsCreateProjectOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Project Baru
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <ProjectList
          projects={filteredProjects}
          members={members}
          onDelete={handleDeleteProject}
        />
      </div>
      <div className="flex flex-1 justify-end">
        <CreateProjectDialog
          isOpen={isCreateProjectOpen}
          onClose={() => setIsCreateProjectOpen(false)}
          onCreate={handleCreateProject}
          members={members}
        />
        </div>
    </div>
  );
}
