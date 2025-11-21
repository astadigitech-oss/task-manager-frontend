import { create } from "zustand";
import type { Task, TaskStatus } from "../types/index";
import { generateId } from "../lib/utils";
import { showSuccessToast, showErrorToast } from "@/lib/toast-helpers";

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
    try {
      const newTask: Task = {
        ...task,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set((state) => ({ tasks: [...state.tasks, newTask] }));
      showSuccessToast("Task berhasil dibuat!", `Task "${task.title}" telah ditambahkan.`);
    } catch (error) {
      showErrorToast("Gagal membuat task", "Terjadi kesalahan saat membuat task.");
    }
  },

  updateTask: (id, updates) => {
    try {
      const task = get().tasks.find(t => t.id === id);
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id
            ? { ...task, ...updates, updatedAt: new Date().toISOString() }
            : task
        ),
      }));

      // Only show toast for status changes (auto-save for members)
      // Don't show toast for other updates to avoid spam when saving from modal
      if (updates.status && Object.keys(updates).length === 1) {
        showSuccessToast("Status task diupdate!", `Task "${task?.title || 'ini'}" diubah ke ${updates.status}.`);
      }
    } catch (error) {
      showErrorToast("Gagal update task", "Terjadi kesalahan saat mengupdate task.");
    }
  },

  deleteTask: (id) => {
    try {
      const task = get().tasks.find(t => t.id === id);
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      }));
      showSuccessToast("Task berhasil dihapus!", `Task "${task?.title || 'ini'}" telah dihapus.`);
    } catch (error) {
      showErrorToast("Gagal menghapus task", "Terjadi kesalahan saat menghapus task.");
    }
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
