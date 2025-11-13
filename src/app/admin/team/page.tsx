"use client";

import { useState } from "react";
import { TeamMembers } from "@/components/shared/TeamMember";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { CreateMemberDialog } from "@/components/modals/InviteMemberModal";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useModal } from "@/hooks/useModal";

export default function TeamPage() {
  const { members, addMember, deleteMember } = useWorkspace();
  const { createMember } = useModal();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter berdasarkan nama atau email
  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Team Members
              </h1>
              <p className="text-slate-600 mt-1">
                Kelola anggota tim, role, dan divisinya
              </p>
            </div>
            <span className="text-sm text-slate-500">
              {members.length} Members
            </span>
          </div>

          {/* Search & Action */}
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
            {/* <Button onClick={createMember.open}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Anggota
            </Button> */}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <TeamMembers members={filteredMembers} onDelete={deleteMember} />
      </div>

      {/* Modal Invite Member */}
      <CreateMemberDialog
        isOpen={createMember.isOpen}
        onClose={createMember.close}
      />
    </div>
  );
}
