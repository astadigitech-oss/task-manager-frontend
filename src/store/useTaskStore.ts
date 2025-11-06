import { create } from "zustand";
import type { Task, TaskStatus } from "../types/index";
import { generateId } from "../lib/utils";

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  getTasksByProject: (projectId: string) => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
}

const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Design System Setup",
    description: "Create a comprehensive design system for the project",
    status: "on-board",
    priority: "high",
    projectId: "1",
    assignTo: ["1", "2"],
    dueDate: "2024-02-15",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-12T14:30:00Z",
  },
  {
    id: "task-2",
    title: "API Integration",
    description: "Integrate backend APIs with frontend",
    status: "on-progress",
    priority: "urgent",
    projectId: "1",
    assignTo: ["3"],
    dueDate: "2024-02-20",
    createdAt: "2024-01-11T09:00:00Z",
    updatedAt: "2024-01-11T09:00:00Z",
  },
  {
    id: "task-3",
    title: "Code Review",
    description: "Review pull requests from team members",
    status: "pending",
    priority: "normal",
    projectId: "2",
    assignTo: ["1"],
    dueDate: "2024-02-10",
    createdAt: "2024-01-09T15:00:00Z",
    updatedAt: "2024-01-13T11:00:00Z",
  },
  {
    id: "task-4",
    title: "Documentation Update",
    description: "Update project documentation",
    status: "done",
    priority: "low",
    projectId: "2",
    assignTo: ["2"],
    dueDate: "2024-02-05",
    createdAt: "2024-01-08T10:00:00Z",
    updatedAt: "2024-01-14T16:00:00Z",
  },
];

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: mockTasks,

  addTask: (task) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ tasks: [...state.tasks, newTask] }));
  },

  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      ),
    }));
  },

  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }));
  },

  updateTaskStatus: (id, status) => {
    get().updateTask(id, { status });
  },

  getTasksByProject: (projectId) => {
    return get().tasks.filter((task) => task.projectId === projectId);
  },

  getTasksByStatus: (status) => {
    return get().tasks.filter((task) => task.status === status);
  },
}));
