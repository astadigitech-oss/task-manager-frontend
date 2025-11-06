export type TaskStatus = "on-board" | "on-progress" | "pending" | "canceled" | "done";
export type Role = "admin" | "member";
export type TaskPriority = "critical" | "urgent" | "high" | "normal" | "low" | "tbd";
export type SettingsPage = "profile" | "preferences" | "account" | "team";

// ======================== Project Interface =================== //

export interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  assignTo: string[];
  tasksCompleted: number;
  tasksTotal: number;
  workspaceId: string;
}

// ======================== User Interface =================== //

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  projectsCount: number;
  tasksCompleted: number;
}

export interface TeamMember extends User {
  projectsCount: number;
  tasksCompleted: number;
  joinedAt?: string;
}

// ======================== Task Interface =================== //

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assignTo: string[];
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  attachments?: string[];
}

// ======================== Workspace Interface =================== //

export interface Workspace {
  id: string;
  name: string;
  color: string;
  projectIds: string[];
  // createdAt: string;
  // updatedAt: string;
}