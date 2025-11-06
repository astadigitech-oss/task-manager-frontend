"use client"

import AddTaskModal from "@/components/modals/AddTaskModal"
import TaskCard from "@/components/task/taskCard"
import TaskList from "@/components/shared/TaskList"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Plus, LayoutGrid, List, ChevronLeft } from "lucide-react"
import { useState } from "react"

export default function ProjectBoardLayout() {
  const [view, setView] = useState<"kanban" | "list">("kanban")
  const columns = ["On Board", "On Progress", "Pending", "Canceled", "Complete"]

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-800">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center bg-white border-b border-gray-200 p-4 gap-3 shadow-sm">
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="sm" className="p-0 text-gray-600 hover:text-gray-900">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl md:text-2xl font-bold">Website Redesign</h1>
          </div>
          <p className="text-sm text-gray-500 mb-2">
            Redesign company website with new branding and improved UX flow.
          </p>

          <div className="flex flex-col w-full max-w-md">
            <div className="flex items-center justify-between mb-1 text-xs font-medium text-gray-600">
              <span>Progress</span>
              <span>76% Complete</span>
            </div>
            <Progress value={76} className="h-2 bg-gray-200" />
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Plus className="w-4 h-4" /> Image
          </Button>

          <div className="flex">
            <Button
              variant={view === "kanban" ? "default" : "outline"}
              size="sm"
              className={`gap-1 px-4 ${view === "kanban" ? "bg-blue-500 text-white" : "text-gray-700"}`}
              onClick={() => setView("kanban")}
            >
              <LayoutGrid className="w-4 h-4" />
              Kanban
            </Button>
            <Button
              variant={view === "list" ? "default" : "outline"}
              size="sm"
              className={`gap-1 px-4 ${view === "list" ? "bg-blue-500 text-white" : "text-gray-700"}`}
              onClick={() => setView("list")}
            >
              <List className="w-4 h-4" />
              List
            </Button>
          </div>


          <AddTaskModal />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <section className="flex-1 overflow-x-auto overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300">
          {view === "kanban" ? (
            <div className="flex gap-4 min-w-max h-full items-start">
              {columns.map((col) => (
                <Card
                  key={col}
                  className="w-72 flex-shrink-0 bg-white p-3 border border-gray-200 shadow-sm flex flex-col"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-gray-700 text-sm">{col}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs px-2 py-1 hover:bg-gray-100"
                    >
                      +
                    </Button>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                    <TaskCard />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <TaskList />
            </div>
          )}
        </section>

        <aside className="hidden md:flex flex-col w-72 bg-gray-100 border-l border-gray-200 p-4">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold text-gray-700">Team Members</h2>
              <Button size="sm" variant="ghost" className="text-xs text-blue-600">
                + Add
              </Button>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-64 pr-1 scrollbar-thin scrollbar-thumb-gray-300">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-white rounded-md p-2 shadow-sm border border-gray-200 hover:bg-gray-50"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
                    {String.fromCharCode(65 + i)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Member {i + 1}</p>
                    <p className="text-xs text-gray-500">
                      {i % 2 === 0 ? "Frontend Dev" : "UI Designer"}
                    </p>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ${i % 2 === 0 ? "bg-green-400" : "bg-gray-400"
                      }`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t pt-3 text-center">
            <h3 className="text-sm font-medium mb-2 text-gray-700">Project Images</h3>
            <div className="relative">
              <div className="w-full h-36 bg-gray-300 rounded-lg flex items-center justify-center">
                <p className="text-gray-600 text-sm">No Image</p>
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <Button variant="ghost" size="sm" className="text-xs px-1">
                  ←
                </Button>
                <Button variant="ghost" size="sm" className="text-xs px-1">
                  →
                </Button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
