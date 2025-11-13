"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

export default function TaskTable() {
    const [tasks, setTasks] = useState<Task[]>([
        {
            id: 1,
            title: "Task 1",
            date: "11/1/2024",
            priority: "Normal",
            assignee: "AB",
            description: "This is a description for Task 1.",
        },
        {
            id: 2,
            title: "Book",
            date: "11/5/2024",
            priority: "High",
            assignee: "CD",
            description: "Read design system documentation and summarize key points.",
        },
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
                assignee: "AB",
                date: "—",
                description: newTaskDesc,
            },
        ])
        setNewTaskTitle("")
        setNewTaskDesc("")
        setIsAdding(false)
    }

    return (
        <div className="w-full bg-white border rounded-xl shadow-sm overflow-hidden">
            {/* ======= HEADER TABLE ======= */}


            {/* ======= TABLE BODY ======= */}
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
                        <tr>
                            <th className="text-left py-2 px-4 font-medium">Name</th>
                            <th className="text-left py-2 px-4 font-medium">Assignee</th>
                            <th className="text-left py-2 px-4 font-medium">Due Date</th>
                            <th className="text-left py-2 px-4 font-medium">Priority</th>
                            <th className="text-left py-2 px-4 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map((task) => (
                            <tr
                                key={task.id}
                                className="border-b hover:bg-gray-200 cursor-pointer transition"
                                onClick={() => setSelectedTask(task)}
                            >
                                <td className="py-3 px-4 font-medium text-gray-800">{task.title}</td>

                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="w-6 h-6">
                                            <AvatarImage src="" alt={task.assignee} />
                                            <AvatarFallback className="text-xs">
                                                {task.assignee}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-gray-700 text-xs">{task.assignee}</span>
                                    </div>
                                </td>

                                <td className="py-3 px-4 text-gray-600 text-xs">
                                    {task.date ? (
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{task.date}</span>
                                        </div>
                                    ) : (
                                        "—"
                                    )}
                                </td>

                                <td className="py-3 px-4 text-xs text-gray-700">
                                    <div className="flex items-center gap-1">
                                        <Tag className="w-3.5 h-3.5 text-gray-500" />
                                        <span
                                            className={`px-2 py-0.5 rounded-md ${task.priority === "High"
                                                    ? "bg-red-100 text-red-700"
                                                    : task.priority === "Low"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-200 text-gray-800"
                                                }`}
                                        >
                                            {task.priority}
                                        </span>
                                    </div>
                                </td>

                                <td className="py-3 px-4 text-xs">
                                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                                        On Board
                                    </span>
                                </td>
                            </tr>
                        ))}

                        {isAdding && (
                            <tr className="border-t bg-gray-50">
                                <td colSpan={5} className="p-3">
                                    <div className="space-y-2">
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
                                                <X className="w-4 h-4" /> Cancel
                                            </Button>
                                            <Button size="sm" onClick={handleAddTask}>
                                                <Plus className="w-4 h-4" /> Add
                                            </Button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="flex items-center justify-between border-b p-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-xs"
                        onClick={() => setIsAdding(!isAdding)}
                    >
                        <Plus className="w-3.5 h-3.5" /> Add Task
                    </Button>
                </div>
            </div>

            {selectedTask && (
                <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
            )}
        </div>
    )
}
