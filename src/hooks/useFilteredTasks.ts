import { useMemo } from "react";
import { useTask } from "./useTask";
import { useAuthStore } from "@/store/useAuthStore";
import type { Task } from "@/types";

export function useFilteredTasks(projectId: string) {
  const { getTasksByProject } = useTask();
  const { user } = useAuthStore();
  
  const allTasks = getTasksByProject(projectId);

  // Filter tasks based on user role
  const filteredTasks = useMemo(() => {
    if (!user) return [];

    // Admin sees all tasks
    if (user.role === "admin") {
      return allTasks;
    }

    // Member only sees tasks assigned to them
    return allTasks.filter((task) => 
      task.assignTo.includes(user.id)
    );
  }, [allTasks, user]);

  return {
    tasks: filteredTasks,
    allTasksCount: allTasks.length,
    myTasksCount: filteredTasks.length,
    isAdmin: user?.role === "admin",
  };
}