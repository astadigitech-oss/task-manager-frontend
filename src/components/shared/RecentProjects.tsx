"use client";

import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../ui/avatar";
import { Progress } from "../ui/progress";
import { Calendar, Users } from "lucide-react";
import type { Project } from "@/types";
import type { TeamMember } from "@/types";

interface RecentProjectsProps {
  projects: Project[];
  members: TeamMember[];
}

const statusConfig = {
  active: {
    label: "Aktif",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  "on-hold": {
    label: "Tertunda",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  completed: {
    label: "Selesai",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  planning: {
    label: "Perencanaan",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
};

export function RecentProjects({
  projects,
  members,
}: RecentProjectsProps) {
  const recentProjects = projects.slice(0, 5);

  return (
    <Card className="p-6">
      <h3 className="text-slate-900 mb-4">Recent Projects</h3>
      <div className="space-y-4">
        {recentProjects.map((project) => {
          const projectMembers = members.filter((m) =>
            project.members.includes(m.id),
          );

          return (
            <div
              key={project.id}
              className="p-4 border rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-slate-900 mb-1">
                    {project.name}
                  </h4>
                  <p className="text-sm text-slate-600 line-clamp-1">
                    {project.description}
                  </p>
                </div>
                <Badge
                  variant="outline"
                >
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-600">
                      Progress
                    </span>
                    <span className="text-xs text-slate-900">
                      {project.progress}%
                    </span>
                  </div>
                  <Progress
                    value={project.progress}
                    className="h-2"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    <div className="flex -space-x-2">
                      {projectMembers
                        .slice(0, 3)
                        .map((member) => (
                          <Avatar
                            key={member.id}
                            className="h-6 w-6 border-2 border-white"
                          >
                            <AvatarImage
                              src={member.avatar}
                              alt={member.name}
                            />
                            <AvatarFallback className="text-xs">
                              {member.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      {projectMembers.length > 3 && (
                        <div className="h-6 w-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center">
                          <span className="text-xs text-slate-600">
                            +{projectMembers.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}