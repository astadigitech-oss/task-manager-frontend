"use client";

import { Card } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { CheckCircle2, FolderKanban } from "lucide-react";
import type { TeamMember } from "@/types";
import type { Project } from "@/types";

interface TeamActivityProps {
  members: TeamMember[];
  projects: Project[];
}

export function TeamActivity({ members, projects }: TeamActivityProps) {
  // Generate mock activities
  const activities = [
    {
      id: 1,
      member: members[0],
      action: "completed task",
      project: projects[0]?.name || "Website Redesign",
      time: "2 hours ago",
      type: "task" as const
    },
    {
      id: 2,
      member: members[1],
      action: "created project",
      project: projects[1]?.name || "Mobile App",
      time: "5 hours ago",
      type: "project" as const
    },
    {
      id: 3,
      member: members[2],
      action: "completed task",
      project: projects[2]?.name || "Marketing Campaign",
      time: "1 day ago",
      type: "task" as const
    },
    {
      id: 4,
      member: members[3],
      action: "created project",
      project: projects[3]?.name || "Data Migration",
      time: "2 days ago",
      type: "project" as const
    },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-foreground mb-4">Team Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={activity.member?.avatar} alt={activity.member?.name} />
              <AvatarFallback>{activity.member?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-medium">{activity.member?.name || "User"}</span>{" "}
                <span className="text-muted">{activity.action}</span>{" "}
                <span className="font-medium">{activity.project}</span>
              </p>
              <p className="text-xs text-muted mt-0.5">{activity.time}</p>
            </div>
            <div className={`p-2 rounded-lg ${
              activity.type === "task" 
            }`}>
              {activity.type === "task" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <FolderKanban className="h-4 w-4 text-blue-600" />
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
