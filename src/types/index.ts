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
}

// ======================== Workspace Interface =================== //

export interface Workspace {
  id: string;
  name: string;
  color: string;
  projectIds: string[];
}


export interface TeamMember extends User {} // Alias untuk backward compatibility

// Division Config untuk UI
export const divisionConfig: Record<Division, { label: string; color: string; emoji: string }> = {
  "frontend": { 
    label: "Frontend Developer", 
    color: "bg-blue-100 text-blue-700 border-blue-200", 
    emoji: "💻" 
  },
  "backend": { 
    label: "Backend Developer", 
    color: "bg-green-100 text-green-700 border-green-200", 
    emoji: "⚙️" 
  },
  "fullstack": { 
    label: "Full Stack Developer", 
    color: "bg-purple-100 text-purple-700 border-purple-200", 
    emoji: "🚀" 
  },
  "ui-ux": { 
    label: "UI/UX Designer", 
    color: "bg-pink-100 text-pink-700 border-pink-200", 
    emoji: "🎨" 
  },
  "project-management": { 
    label: "Project Manager", 
    color: "bg-indigo-100 text-indigo-700 border-indigo-200", 
    emoji: "📊" 
  },
  "devops": { 
    label: "DevOps Engineer", 
    color: "bg-teal-100 text-teal-700 border-teal-200", 
    emoji: "☁️" 
  },
};