export type TaskStatus = "on-board" | "on-progress" | "pending" | "canceled" | "done";
export type Role = "admin" | "member";
export type TaskPriority = "critical" | "urgent" | "high" | "normal" | "low" | "tbd";
export type SettingsPage = "profile" | "preferences" | "account" | "team";
export type Division = "frontend" | "backend" | "fullstack" | "ui-ux" | "project-management" | "devops";

// ======================== Project Interface =================== //

export interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  members: string[];
  tasksCompleted: number;
  tasksTotal: number;
  workspaceId: string;
}

// ======================== User Interface =================== //

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  division: string;
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

export interface TaskActivity {
  id: string;
  type: "status_change" | "attachment_upload" | "assignee_add" | "assignee_remove" | "date_change" | "priority_change" | "edit";
  userId: string;
  timestamp: string;
  data?: any;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assignTo: string[];
  startDate?: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  attachments?: string[];
  activities?: TaskActivity[];
}

// ======================== Workspace Interface =================== //

export interface Workspace {
  id: string;
  name: string;
  color: string;
  projectIds: string[];
}


export interface TeamMember extends User {}

// Division Config untuk UI
export const divisionConfig: Record<Division, { label: string; color: string; emoji: string }> = {
  "frontend": { 
    label: "Frontend Developer", 
    color: "division-frontend", 
    emoji: "💻" 
  },
  "backend": { 
    label: "Backend Developer", 
    color: "division-backend", 
    emoji: "⚙️" 
  },
  "fullstack": { 
    label: "Full Stack Developer", 
    color: "division-fullstack", 
    emoji: "🚀" 
  },
  "ui-ux": { 
    label: "UI/UX Designer", 
    color: "division-ui-ux", 
    emoji: "🎨" 
  },
  "project-management": { 
    label: "Project Manager", 
    color: "division-project-management", 
    emoji: "📊" 
  },
  "devops": { 
    label: "DevOps Engineer", 
    color: "division-devops", 
    emoji: "☁️" 
  },
};