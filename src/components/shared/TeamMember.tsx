"use client";

import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { MoreVertical, FolderKanban, CheckCircle2, Mail } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { TeamMember } from "../../types";

interface TeamMembersProps {
  members: TeamMember[];
  onDelete: (id: string) => void;
}

const roleConfig = {
  owner: { label: "Owner", color: "bg-purple-100 text-purple-700 border-purple-200" },
  admin: { label: "Admin", color: "bg-blue-100 text-blue-700 border-blue-200" },
  member: { label: "Member", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  viewer: { label: "Viewer", color: "bg-slate-100 text-slate-700 border-slate-200" }
};

export function TeamMembers({ members, onDelete }: TeamMembersProps) {
  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Tidak ada anggota tim ditemukan</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => {
        const role = roleConfig[member.role];

        return (
          <Card key={member.id} className="p-6 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-slate-900">{member.name}</h3>
                  <p className="text-sm text-slate-500">{member.email}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Mail className="mr-2 h-4 w-4" />
                    Kirim Email
                  </DropdownMenuItem>
                  <DropdownMenuItem>Edit Anggota</DropdownMenuItem>
                  <DropdownMenuItem>Ubah Role</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => onDelete(member.id)}
                  >
                    Hapus Anggota
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Role Badge */}
            <div className="mb-4">
              <Badge variant="outline" className={role.color}>
                {role.label}
              </Badge>
            </div>

            {/* Stats */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FolderKanban className="h-4 w-4 text-slate-400" />
                  <span>Project</span>
                </div>
                <span className="text-slate-900">{member.projectsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="h-4 w-4 text-slate-400" />
                  <span>Tasks Selesai</span>
                </div>
                <span className="text-slate-900">{member.tasksCompleted}</span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
