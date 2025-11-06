"use client";

import { useState } from "react";
import { TeamMembers } from "@/components/shared/TeamMember";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { CreateMemberDialog } from "@/components/modals/InviteMemberModal";
import type { TeamMember } from "@/types";

const initialMembers: TeamMember[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@company.com",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    projectsCount: 4,
    tasksCompleted: 42
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.c@company.com",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    projectsCount: 3,
    tasksCompleted: 38
  },
  {
    id: "3",
    name: "Emma Davis",
    email: "emma.d@company.com",
    role: "member",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    projectsCount: 2,
    tasksCompleted: 29
  },
  {
    id: "4",
    name: "James Wilson",
    email: "james.w@company.com",
    role: "member",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    projectsCount: 3,
    tasksCompleted: 31
  },
  {
    id: "5",
    name: "Lisa Anderson",
    email: "lisa.a@company.com",
    role: "member",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
    projectsCount: 2,
    tasksCompleted: 25
  },
  {
    id: "6",
    name: "David Brown",
    email: "david.b@company.com",
    role: "member",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    projectsCount: 1,
    tasksCompleted: 12
  }
];

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateMemberOpen, setIsCreateMemberOpen] = useState(false);

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateMember = (member: Omit<TeamMember, "id">) => {
    const newMember: TeamMember = {
      ...member,
      id: (members.length + 1).toString()
    };
    setMembers([newMember, ...members]);
  };

  const handleDeleteMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-slate-900">Team Members</h1>
              <p className="text-slate-600 mt-1">
                Kelola anggota tim dan hak akses mereka
              </p>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Cari anggota tim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setIsCreateMemberOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Anggota
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <TeamMembers 
          members={filteredMembers}
          onDelete={handleDeleteMember}
        />
      </div>

      <CreateMemberDialog
        isOpen={isCreateMemberOpen}
        onClose={() => setIsCreateMemberOpen(false)}
        onCreate={handleCreateMember}
      />
    </div>
  );
}
