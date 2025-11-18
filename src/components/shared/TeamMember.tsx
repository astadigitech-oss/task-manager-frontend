"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { divisionConfig, type Division, type User } from "@/types";

interface TeamMembersProps {
  members: User[];
  onDelete?: (id: string) => void;
}

export function TeamMembers({ members, onDelete }: TeamMembersProps) {
  if (!members || members.length === 0) {
    return (
      <p className="text-center text-sm text-muted py-8">
        No team members found.
      </p>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((member) => {
        // 🔍 Pastikan division-nya valid dan cocok dengan config
        const divisionKey = member.division as Division;
        const division =
          divisionConfig[divisionKey] ?? divisionConfig["frontend"]; // fallback

        return (
          <div
            key={member.id}
            className="flex items-center gap-4 surface-elevated p-4 rounded-xl border border-border shadow-sm hover:shadow-md transition-all"
          >
            {/* Avatar */}
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback>
                {member.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex flex-col justify-center">
              {/* Name */}
              <h4 className="font-medium text-foreground">{member.name}</h4>

              {/* Role + Division */}
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className={`capitalize text-[11px] ${
                    member.role === "admin" ? "badge-normal" : "badge-tbd"
                  }`}
                >
                  {member.role}
                </Badge>

                {division && (
                  <Badge
                    variant="outline"
                    className={`flex items-center gap-1 text-[11px] ${division.color}`}
                  >
                    <span>{division.emoji}</span>
                    {division.label}
                  </Badge>
                )}
              </div>
            </div>

            {/* Action */}
            {onDelete && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDelete(member.id)}
                className="ml-auto text-muted hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
