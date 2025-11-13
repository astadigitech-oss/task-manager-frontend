"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FolderKanban } from "lucide-react"
import { dummyProjects } from "@/lib/dummyData"

export default function KanbanBoard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-gray-500 text-sm">
            Overview of all projects and their associated workspaces
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          + New Project
        </Button>
      </div>

      {/* Kanban Grid */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {dummyProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition">
            <CardHeader className="flex flex-row justify-between items-center">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-blue-500" />
                <CardTitle className="text-base font-semibold">
                  {project.title}
                </CardTitle>
              </div>
              <Badge variant="outline">{project.workspace}</Badge>
            </CardHeader>

            <CardContent>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">
                {project.progress}% Complete
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
