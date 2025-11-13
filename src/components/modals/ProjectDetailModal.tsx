"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Calendar, CheckCircle2, Users, Clock, Target } from "lucide-react";
import type { Project, TeamMember } from "@/components/shared/TeamManagement";

interface ProjectDetailDialogProps {
  project: Project | null;
  members: TeamMember[];
  isOpen: boolean;
  onClose: () => void;
}

const statusConfig = {
  active: { label: "Aktif", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  "on-hold": { label: "Tertunda", color: "bg-amber-100 text-amber-700 border-amber-200" },
  completed: { label: "Selesai", color: "bg-blue-100 text-blue-700 border-blue-200" },
  planning: { label: "Perencanaan", color: "bg-purple-100 text-purple-700 border-purple-200" }
};

export function ProjectDetailDialog({
  project,
  members,
  isOpen,
  onClose,
}: ProjectDetailDialogProps) {
  if (!project) return null;

  const projectMembers = members.filter(m => project.members.includes(m.id));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getDaysRemaining = (dateString: string) => {
    const today = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-slate-900 mb-2">
                {project.name}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Description */}
          <div>
            <h3 className="text-slate-900 mb-2">Deskripsi</h3>
            <p className="text-slate-600">{project.description}</p>
          </div>

          <Separator />

          {/* Progress Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-900">Progress Project</h3>
              <span className="text-slate-900">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-3 mb-4" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-slate-600">Tasks Selesai</span>
                </div>
                <p className="text-slate-900">
                  {project.tasksCompleted} / {project.tasksTotal}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-slate-600">Tasks Tersisa</span>
                </div>
                <p className="text-slate-900">
                  {project.tasksTotal - project.tasksCompleted}
                </p>
              </div>

            </div>
          </div>

          <Separator />

          {/* Team Members */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-slate-400" />
              <h3 className="text-slate-900">Anggota Tim ({projectMembers.length})</h3>
            </div>
            <div className="space-y-3">
              {projectMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-slate-900">{member.name}</p>
                      <p className="text-sm text-slate-500">{member.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity (Mock Data) */}
          <Separator />
          <div>
            <h3 className="text-slate-900 mb-4">Aktivitas Terbaru</h3>
            <div className="space-y-3">
              <div className="flex gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5" />
                <div>
                  <p className="text-slate-900">Task "Design mockup" diselesaikan</p>
                  <p className="text-slate-500 text-xs">2 jam yang lalu</p>
                </div>
              </div>
              <div className="flex gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5" />
                <div>
                  <p className="text-slate-900">Emma Davis ditambahkan ke project</p>
                  <p className="text-slate-500 text-xs">5 jam yang lalu</p>
                </div>
              </div>
              <div className="flex gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-purple-600 mt-1.5" />
                <div>
                  <p className="text-slate-900">Project dibuat</p>
                  <p className="text-slate-500 text-xs">3 hari yang lalu</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
