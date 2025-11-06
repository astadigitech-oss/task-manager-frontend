"use client";

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Plus, CalendarDays, User } from "lucide-react"
import clsx from "clsx"
import TaskDetailModal from "../modals/TaskDetailModal"
import listTaskTamplate from "@/components/task/listTaskTamplate"
import TaskTable from "@/components/task/listTaskTamplate"

interface Task {
  id: number
  title: string
  assignee?: string
  dueDate?: string
  priority?: string
  status: string
}

const sampleTasks: Task[] = [
  { id: 1, title: "Task 1", assignee: "AB", dueDate: "11/1/24", priority: "Normal", status: "On Progress" },
  { id: 2, title: "Book", assignee: "AB", dueDate: "11/1/24", priority: "Normal", status: "On Progress" },
  { id: 3, title: "Test", assignee: "CD", dueDate: "11/2/24", priority: "Low", status: "Pending" },
]

const statusGroups = ["On board", "On Progress", "Pending", "Canceled", "Complete"]

export default function TaskList() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "On board": true,
    "On Progress": true,
    "Pending": true,
    "Canceled": true,
    "Complete": true,
  })
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  return (
    <div className="bg-gray-100 rounded-md p-4 space-y-4">
      {statusGroups.map((group) => {
        const tasks = sampleTasks.filter((t) => t.status === group)

        return (
          <div key={group} className="bg-gray-200 rounded-md overflow-hidden border border-gray-300">

            <div
              className="flex items-center justify-between bg-gray-300 px-3 py-2 cursor-pointer hover:bg-gray-400 transition"
              onClick={() =>
                setExpanded((prev) => ({ ...prev, [group]: !prev[group] }))
              }
            >
              <div className="flex items-center gap-2">
                <ChevronDown
                  className={clsx(
                    "w-4 h-4 transition-transform",
                    expanded[group] ? "rotate-0" : "-rotate-90"
                  )}
                />
                <Badge
                  variant="secondary"
                  className={clsx(
                    "font-semibold text-xs px-2 py-1 rounded-sm",
                    group === "On board" && "bg-black text-white",
                    group === "On Progress" && "bg-blue-600 text-white",
                    group === "Pending" && "bg-yellow-500 text-white",
                    group === "Canceled" && "bg-red-500 text-white",
                    group === "Complete" && "bg-green-600 text-white"
                  )}
                >
                  {group}
                </Badge>
                <span className="text-sm text-gray-700 font-medium">
                  {tasks.length}
                </span>
              </div>
            </div>


            {expanded[group] && (
              <div className="bg-gray-100 border-t border-gray-300">
                <div className="grid grid-cols-5 text-sm text-gray-600 font-medium py-2 px-3 border-b border-gray-200">
                  <div>Name</div>
                  <div>Assignee</div>
                  <div>Due Date</div>
                  <div>Priority</div>
                  <div>Status</div>
                </div>


                <div>
                  <TaskTable />
                </div>
              </div>
            )}
            {selectedTask && (
              <TaskDetailModal
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
