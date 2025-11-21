"use client";

import { useState } from "react";
import { TeamMembers } from "@/components/shared/TeamMember";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Home, Users } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useModal } from "@/hooks/useModal";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/useAuthStore";

export default function TeamPage() {
  const { members, addMember, deleteMember } = useWorkspace();
  const { createMember } = useModal();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { user } = useAuthStore();

  // Filter berdasarkan nama atau email
  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dashboardPath = user?.role === "admin" ? "/admin/dashboard" : "/member/dashboard";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="px-6 py-6">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => router.push(dashboardPath)}
                >
                  <Home className="w-4 h-4" />
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Team
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Team Members
              </h1>
              <p className="text-muted-foreground mt-1">
                Kelola anggota tim, role, dan divisinya
              </p>
            </div>
            <span className="text-sm text-muted-foreground">
              {members.length} Members
            </span>
          </div>

          {/* Search & Action */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari anggota tim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <TeamMembers members={filteredMembers} onDelete={deleteMember} />
      </div>
    </div>
  );
}
