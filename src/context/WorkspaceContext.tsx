"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { Workspace, Project, User } from "../types";

interface WorkspaceContextType {
  workspaces: Workspace[];
  projects: Project[];
  members: User[];
  selectedWorkspaceId: string | null;
  setSelectedWorkspaceId: (id: string | null) => void;
  addWorkspace: (workspace: Omit<Workspace, "id">) => void;
  addProject: (project: Omit<Project, "id">) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addMember: (member: Omit<User, "id">) => void;
  deleteMember: (id: string) => void;
  getWorkspaceProjects: (workspaceId: string) => Project[];
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const initialWorkspaces: Workspace[] = [
  {
    id: "1",
    name: "Workspace A",
    color: "#3b82f6",
    projectIds: ["1", "2", "3"],
  },
  {
    id: "2",
    name: "Workspace B",
    color: "#8b5cf6",
    projectIds: ["4", "5"],
  },
];

const initialProjects: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Complete overhaul of company website with modern design",
    progress: 65,
    assignTo: ["1", "2", "3"],
    tasksCompleted: 13,
    tasksTotal: 20,
    workspaceId: "1",
  },
  {
    id: "2",
    name: "Mobile App Development",
    description: "Native iOS and Android app for customer engagement",
    progress: 42,
    assignTo: ["1", "4", "5"],
    tasksCompleted: 8,
    tasksTotal: 19,
    workspaceId: "1",
  },
  {
    id: "3",
    name: "Marketing Campaign Q4",
    description: "Holiday season marketing strategy and execution",
    progress: 15,
    assignTo: ["2", "6"],
    tasksCompleted: 3,
    tasksTotal: 20,
    workspaceId: "1",
  },
  {
    id: "4",
    name: "Data Migration",
    description: "Migrate legacy database to new cloud infrastructure",
    progress: 30,
    assignTo: ["4", "5"],
    tasksCompleted: 6,
    tasksTotal: 20,
    workspaceId: "2",
  },
  {
    id: "5",
    name: "Customer Portal",
    description: "Self-service portal for customer support",
    progress: 100,
    assignTo: ["1", "3", "4"],
    tasksCompleted: 15,
    tasksTotal: 15,
    workspaceId: "2",
  },
];

const initialMembers: User[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@company.com",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    projectsCount: 4,
    tasksCompleted: 42,
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.c@company.com",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    projectsCount: 3,
    tasksCompleted: 38,
  },
  {
    id: "3",
    name: "Emma Davis",
    email: "emma.d@company.com",
    role: "member",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    projectsCount: 2,
    tasksCompleted: 29,
  },
  {
    id: "4",
    name: "James Wilson",
    email: "james.w@company.com",
    role: "member",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    projectsCount: 3,
    tasksCompleted: 31,
  },
  {
    id: "5",
    name: "Lisa Anderson",
    email: "lisa.a@company.com",
    role: "member",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
    projectsCount: 2,
    tasksCompleted: 25,
  },
  {
    id: "6",
    name: "David Brown",
    email: "david.b@company.com",
    role: "member",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    projectsCount: 1,
    tasksCompleted: 12,
  },
];

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [members, setMembers] = useState<User[]>(initialMembers);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);

  const addWorkspace = (workspace: Omit<Workspace, "id">) => {
    const newWorkspace: Workspace = {
      ...workspace,
      id: (workspaces.length + 1).toString(),
    };
    setWorkspaces([...workspaces, newWorkspace]);
  };

  const addProject = (project: Omit<Project, "id">) => {
    const newProject: Project = {
      ...project,
      id: (projects.length + 1).toString(),
    };
    setProjects([...projects, newProject]);
    
    // Update workspace projectIds
    if (project.workspaceId) {
      setWorkspaces(workspaces.map(ws => 
        ws.id === project.workspaceId 
          ? { ...ws, projectIds: [...ws.projectIds, newProject.id] }
          : ws
      ));
    }
  };

  const updateProject = (id: string, updatedProject: Partial<Project>) => {
    setProjects(projects.map(p => p.id === id ? { ...p, ...updatedProject } : p));
  };

  const deleteProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    setProjects(projects.filter(p => p.id !== id));
    
    // Update workspace projectIds
    if (project) {
      setWorkspaces(workspaces.map(ws => 
        ws.id === project.workspaceId 
          ? { ...ws, projectIds: ws.projectIds.filter(pid => pid !== id) }
          : ws
      ));
    }
  };

  const addMember = (member: Omit<User, "id">) => {
    const newMember: User = {
      ...member,
      id: (members.length + 1).toString(),
    };
    setMembers([...members, newMember]);
  };

  const deleteMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const getWorkspaceProjects = (workspaceId: string) => {
    return projects.filter(p => p.workspaceId === workspaceId);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        projects,
        members,
        selectedWorkspaceId,
        setSelectedWorkspaceId,
        addWorkspace,
        addProject,
        updateProject,
        deleteProject,
        addMember,
        deleteMember,
        getWorkspaceProjects
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
