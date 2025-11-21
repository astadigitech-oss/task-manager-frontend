"use client";

import { Card, CardContent } from "@/components/ui/card"
import { Users, Clock } from "lucide-react"

export default function ProjectCard({ title, description, members, progress, status }: any) {
  const statusColor: Record<string, string> = {
    "on progress": "badge-normal",
    "pending": "badge-high",
    "done": "badge-low",
  }

  return (
    <Card className="w-[250px]">
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-center">
          <div className={`text-xs px-2 py-1 rounded ${statusColor[status]}`}>
            {status}
          </div>
          <span className="text-sm font-semibold text-foreground">{title[0]}</span>
        </div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="text-xs text-muted">{description}</p>
        <div className="flex justify-between items-center text-xs text-muted mt-2">
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
