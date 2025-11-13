"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Trash2 } from "lucide-react";
import { CreateMemberDialog } from "@/components/modals/InviteMemberModal";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useModal } from "@/hooks/useModal";
import { divisionConfig } from "@/types";

export function TeamPage() {
  const { members, deleteMember } = useWorkspace();
  const { createMember } = useModal();
  const [searchQuery, setSearchQuery] = useState("");

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
                Kelola anggota tim dan lihat divisi serta perannya
              </p>
            </div>
            <span className="text-sm text-slate-500">
              {members.length} Members
            </span>
          </div>

          {/* Search & Actions */}
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
            <Button onClick={createMember.open}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Anggota
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((member) => {
            const divisionKey = (member.division?.toLowerCase() ||
              "frontend") as keyof typeof divisionConfig;
            const divisionInfo = divisionConfig[divisionKey];

            return (
              <Card
                key={member.id}
                className="flex items-center gap-4 p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Avatar */}
                <Avatar className="w-12 h-12">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>

                {/* Member Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {member.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {member.email}
                  </p>

                  {/* Role + Division */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge
                      variant="outline"
                      className={`capitalize text-[10px] px-2 py-0.5 ${
                        member.role === "admin"
                          ? "border-blue-300 bg-blue-50 text-blue-700"
                          : "border-gray-300 bg-gray-100 text-gray-700"
                      }`}
                    >
                      {member.role}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-2 py-0.5 flex items-center gap-1 ${divisionInfo.color}`}
                    >
                      <span>{divisionInfo.emoji}</span>
                      {divisionInfo.label}
                    </Badge>
                  </div>
                </div>

                {/* Delete Action */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-red-600"
                  onClick={() => deleteMember(member.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            );
          })
        ) : (
          <p className="text-sm text-gray-500 col-span-full text-center py-10">
            Tidak ada anggota tim ditemukan.
          </p>
        )}
      </div>

      {/* Modal Invite Member */}
      <CreateMemberDialog
        isOpen={createMember.isOpen}
        onClose={createMember.close}
      />
    </div>
  );
}
