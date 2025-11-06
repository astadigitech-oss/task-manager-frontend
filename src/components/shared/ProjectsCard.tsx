"use client";

import { Card, CardContent } from "@/components/ui/card"
import { Users, Clock } from "lucide-react"

export default function ProjectCard({ title, description, members, progress, status }: any) {
  const statusColor: Record<string, string> = {
    "on progress": "bg-blue-500",
    "pending": "bg-yellow-500",
    "done": "bg-green-500",
  }

  return (
    <Card className="w-[250px]">
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-center">
          <div className={`text-xs text-white px-2 py-1 rounded ${statusColor[status]}`}>
            {status}
          </div>
          <span className="text-sm font-semibold">{title[0]}</span>
        </div>
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="text-xs text-gray-500">{description}</p>
        <div className="flex justify-between items-center text-xs text-gray-600 mt-2">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" /> {members} Member
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {progress}% complete
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
