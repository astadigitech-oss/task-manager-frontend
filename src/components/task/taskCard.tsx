"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Tag, Plus, X } from "lucide-react"
import TaskDetailModal from "@/components/modals/TaskDetailModal"

interface Task {
  id: number
  title: string
  assignee?: string
  date?: string
  priority?: string
  description?: string
}

export default function TaskCard() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "Task 1",
      date: "11/1/2024",
      priority: "Normal",
      assignee: "AB",
      description: "This is a description for Task 1.",
    }
  ])

  const [isAdding, setIsAdding] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDesc, setNewTaskDesc] = useState("")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return
    setTasks([
      ...tasks,
      {
        id: tasks.length + 1,
        title: newTaskTitle,
        priority: "Normal",
        description: newTaskDesc,
        assignee: "AB",
      },
    ])
    setNewTaskTitle("")
    setNewTaskDesc("")
    setIsAdding(false)
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => (
        <Card
          key={task.id}
          className="bg-gray-100 border border-gray-300 shadow-sm rounded-2xl hover:shadow-md cursor-pointer transition-all"
          onClick={() => setSelectedTask(task)}
        >
          <CardContent className="p-3 flex flex-col gap-2">
            <h3 className="font-medium text-sm text-gray-900 leading-tight">
              {task.title}
            </h3>

            <div className="flex items-center justify-between text-gray-600 text-xs">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src="" alt="AB" />
                  <AvatarFallback>{task.assignee}</AvatarFallback>
                </Avatar>
                {task.date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{task.date}</span>
                  </div>
                )}
              </div>
            </div>

            {task.priority && (
              <div className="flex items-center gap-1 text-xs mt-1">
                <Tag className="w-3.5 h-3.5 text-gray-500" />
                <span className="bg-gray-300 text-gray-800 px-2 py-0.5 rounded-md text-[11px]">
                  {task.priority}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {isAdding ? (
        <div className="p-2 bg-white border rounded-lg shadow-sm space-y-2">
          <Input
            placeholder="Task name..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="text-sm"
          />
          <Textarea
            placeholder="Description (optional)"
            value={newTaskDesc}
            onChange={(e) => setNewTaskDesc(e.target.value)}
            className="text-sm"
          />

          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAdding(false)}
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddTask}>
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center justify-start gap-1 text-xs text-gray-800 hover:bg-gray-200 w-full"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Task
        </Button>
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  )
}
