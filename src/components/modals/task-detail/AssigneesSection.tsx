import { User, UserPlus, X, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { divisionConfig } from "@/types/index";
import type { User as UserType } from "@/types/index";

interface AssigneesSectionProps {
  members: UserType[];
  assignedMemberIds: string[];
  onToggleAssignee: (memberId: string) => void;
  readOnly?: boolean;
}

export function AssigneesSection({
  members,
  assignedMemberIds,
  onToggleAssignee,
  readOnly = false,
}: AssigneesSectionProps) {
  const assignedMembers = members.filter((m) => assignedMemberIds.includes(m.id));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-muted">
          <User className="h-4 w-4" />
          <h4 className="text-sm font-semibold">Assigned To</h4>
        </div>
        {!readOnly && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                <UserPlus className="w-3.5 h-3.5 mr-1" />
                Add
              </Button>
            </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="end">
            <div className="space-y-1">
              {members.map((member) => (
                <button
                  key={member.id}
                  onClick={() => onToggleAssignee(member.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded transition-colors",
                    assignedMemberIds.includes(member.id)
                      ? "button-secondary"
                      : "hover:surface-hover"
                  )}
                >
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="text-xs">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm flex-1 text-left">{member.name}</span>
                  {assignedMemberIds.includes(member.id) && (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        )}
      </div>

      <div className="space-y-2">
        {assignedMembers.length > 0 ? (
          assignedMembers.map((member) => {
            const division =
              divisionConfig[member.division as keyof typeof divisionConfig];
            return (
              <div
                key={member.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:surface-hover group"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {member.name}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted">
                    <span>{member.role}</span>
                    {division && (
                      <>
                        <span className="text-muted">•</span>
                        <span>
                          {division.emoji} {division.label}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {!readOnly && (
                  <button
                    onClick={() => onToggleAssignee(member.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:surface-hover rounded"
                  >
                    <X className="w-3.5 h-3.5 text-muted" />
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted py-2">No one assigned</p>
        )}
      </div>
    </div>
  );
}

