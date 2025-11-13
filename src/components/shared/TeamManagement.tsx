"use client";

import { useState } from "react";
import { TeamMembers } from "@/components/shared/TeamMember";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import { Button } from "../ui/button";
import { Plus, Settings, Search } from "lucide-react";
import { Input } from "../ui/input";
import { CreateMemberDialog } from "@/components/modals/InviteMemberModal";
import { ProjectList } from "@/components/shared/ProjectsList";
import { CreateProjectDialog } from "../modals/CreateProjectDialog";

export type Role =
  | "admin"
  | "member";

export interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  members: string[];
  tasksCompleted: number;
  tasksTotal: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  projectsCount: number;
  tasksCompleted: number;
}

const initialProjects: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    description:
      "Complete overhaul of company website with modern design",
    progress: 65,
    members: ["1", "2", "3"],
    tasksCompleted: 13,
    tasksTotal: 20,
  },
  {
    id: "2",
    name: "Mobile App Development",
    description:
      "Native iOS and Android app for customer engagement",
    progress: 42,
    members: ["1", "4", "5"],
    tasksCompleted: 8,
    tasksTotal: 19,
  },
  {
    id: "3",
    name: "Marketing Campaign Q4",
    description:
      "Holiday season marketing strategy and execution",
    progress: 15,
    members: ["2", "6"],
    tasksCompleted: 3,
    tasksTotal: 20,
  },
  {
    id: "4",
    name: "Data Migration",
    description:
      "Migrate legacy database to new cloud infrastructure",
    progress: 30,
    members: ["4", "5"],
    tasksCompleted: 6,
    tasksTotal: 20,
  },
  {
    id: "5",
    name: "Customer Portal",
    description: "Self-service portal for customer support",
    progress: 100,
    members: ["1", "3", "4"],
    tasksCompleted: 15,
    tasksTotal: 15,
  },
];

const initialMembers: TeamMember[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@company.com",
    role: "admin",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    projectsCount: 4,
    tasksCompleted: 42,
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.c@company.com",
    role: "admin",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    projectsCount: 3,
    tasksCompleted: 38,
  },
  {
    id: "3",
    name: "Emma Davis",
    email: "emma.d@company.com",
    role: "member",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    projectsCount: 2,
    tasksCompleted: 29,
  },
  {
    id: "4",
    name: "James Wilson",
    email: "james.w@company.com",
    role: "member",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    projectsCount: 3,
    tasksCompleted: 31,
  },
  {
    id: "5",
    name: "Lisa Anderson",
    email: "lisa.a@company.com",
    role: "member",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
    projectsCount: 2,
    tasksCompleted: 25,
  },
  {
    id: "6",
    name: "David Brown",
    email: "david.b@company.com",
    role: "member",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    projectsCount: 1,
    tasksCompleted: 12,
  },
];

export function TeamManagement() {
  const [projects, setProjects] =
    useState<Project[]>(initialProjects);
  const [members, setMembers] =
    useState<TeamMember[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("projects");
  const [isCreateProjectOpen, setIsCreateProjectOpen] =
    useState(false);
  const [isCreateMemberOpen, setIsCreateMemberOpen] =
    useState(false);

  const filteredProjects = projects.filter(
    (project) =>
      project.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      project.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const filteredMembers = members.filter(
    (member) =>
      member.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      member.email
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const handleCreateProject = (
    project: Omit<Project, "id">,
  ) => {
    const newProject: Project = {
      ...project,
      id: (projects.length + 1).toString(),
    };
    setProjects([newProject, ...projects]);
  };

  const handleCreateMember = (
    member: Omit<TeamMember, "id">,
  ) => {
    const newMember: TeamMember = {
      ...member,
      id: (members.length + 1).toString(),
    };
    setMembers([newMember, ...members]);
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  const handleDeleteMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-slate-900">
                Workspace Management
              </h1>
              <p className="text-slate-600 mt-1">
                Kelola project dan anggota tim Anda
              </p>
            </div>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Cari project atau anggota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {activeTab === "projects" ? (
              <Button
                onClick={() => setIsCreateProjectOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Project Baru
              </Button>
            ) : (
              <Button
                onClick={() => setIsCreateMemberOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Anggota
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="projects">
              Project ({filteredProjects.length})
            </TabsTrigger>
            <TabsTrigger value="members">
              Anggota Tim ({filteredMembers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="mt-0">
            <ProjectList
              projects={filteredProjects}
              members={members}
              onDelete={handleDeleteProject}
            />
          </TabsContent>

          <TabsContent value="members" className="mt-0">
            <TeamMembers
              members={filteredMembers}
              onDelete={handleDeleteMember}
            />
          </TabsContent>
        </Tabs>
      </div>

      <CreateProjectDialog
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onCreate={handleCreateProject}
        members={members}
      />

      <CreateMemberDialog
        isOpen={isCreateMemberOpen}
        onClose={() => setIsCreateMemberOpen(false)}
        onCreate={handleCreateMember}
      />
    </div>
  );
}