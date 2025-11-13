"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";
import { Calendar, Users, CheckCircle2 } from "lucide-react";
import type { Project } from "@/types/index";
import type { TeamMember } from "@/types/index";

interface ProjectDetailDialogProps {
  project: Project | null;
  members: TeamMember[];
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectDetailDialog({ project, members, isOpen, onClose }: ProjectDetailDialogProps) {
  if (!project) return null;

  const projectMembers = members.filter(m => project.members.includes(m.id));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{project.name}</DialogTitle>
          <DialogDescription>
            Detail lengkap project dan anggota tim yang terlibat
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">

          {/* Description */}
          <div>
            <h4 className="text-sm text-slate-600 mb-2">Deskripsi</h4>
            <p className="text-slate-900">{project.description}</p>
          </div>

          <Separator />

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm text-slate-600">Progress</h4>
              <span className="text-sm text-slate-900">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-3" />
          </div>

          <Separator />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Tenggat Waktu</span>
              </div>

            </div>

            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">Tasks</span>
              </div>
              <p className="text-slate-900">
                {project.tasksCompleted} / {project.tasksTotal} selesai
              </p>
            </div>
          </div>

          <Separator />

          {/* Team Members */}
          <div>
            <div className="flex items-center gap-2 text-slate-600 mb-4">
              <Users className="h-4 w-4" />
              <h4 className="text-sm">Anggota Tim ({projectMembers.length})</h4>
            </div>
            <div className="space-y-3">
              {projectMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm text-slate-900">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.email}</p>
                  </div>
                  <Badge variant="outline" className="capitalize text-xs">
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
