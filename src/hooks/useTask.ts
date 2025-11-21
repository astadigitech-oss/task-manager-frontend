import { useTaskStore } from "../store/useTaskStore";
import type { Task, TaskStatus } from "@/types/index";

export function useTask() {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    getTasksByProject,
    getTasksByStatus,
  } = useTaskStore();

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    getTasksByProject,
    getTasksByStatus,
  };
}
