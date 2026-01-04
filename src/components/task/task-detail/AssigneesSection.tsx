import { User, UserPlus, X, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils/utils";
import { UserAvatar } from "@/components/shared/UserAvatar";

interface Member {
  id: number;
  name: string;
  avatar?: string;
  role?: string;
  position?: string;
}

interface AssigneesSectionProps {
  member: Member[];
  assignedMemberIds: number[];
  onToggleAssignee: (memberId: number) => void;
  readOnly?: boolean;
  isLoading?: boolean;
}

export function AssigneesSection({
  member,
  assignedMemberIds,
  onToggleAssignee,
  readOnly = false,
  isLoading = false,
}: AssigneesSectionProps) {
  const assignedMembers = member.filter((m) => assignedMemberIds.includes(m.id));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted">
          <User className="h-4 w-4 text-foreground" />
          <h4 className="text-sm text-foreground font-semibold">Assigned Members</h4>
        </div>
        {!readOnly && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-1.5">
                <UserPlus className="w-4 h-4" />
                Add Member
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-2">
              {isLoading ? (
                <div className="py-8 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : member.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No members in this project
                </div>
              ) : (
                <ScrollArea className="max-h-64">
                  <div className="space-y-1">
                    {member.map((m) => {
                      const isSelected = assignedMemberIds.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          onClick={() => onToggleAssignee(m.id)}
                          className={cn(
                            "w-full flex items-center gap-2 px-2 py-1.5 rounded transition-colors",
                            "hover:bg-muted",
                            isSelected && "bg-primary/10"
                          )}
                        >
                          <UserAvatar
                            name={m.name}
                            avatar={m.avatar}
                            size="sm"
                            className="w-6 h-6"
                          />
                          <div className="flex-1 text-left">
                            <p className="text-sm">{m.name}</p>
                            {m.role && (
                              <p className="text-xs text-muted-foreground">{m.role}</p>
                            )}
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </PopoverContent>
          </Popover>
        )}
      </div>

      <ScrollArea className="max-h-48">
        {assignedMembers.length > 0 ? (
          <div className="space-y-2">
            {assignedMembers.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-2 hover:bg-muted rounded-lg group"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={m.name}
                    avatar={m.avatar}
                    size="sm"
                    className="h-8 w-8"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {m.name || 'Unknown'}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {m.role && <span>{m.role}</span>}
                      {m.position && m.role && (
                        <span className="text-muted-foreground">•</span>
                      )}
                      {m.position && <span>{m.position}</span>}
                    </div>
                  </div>
                </div>
                {!readOnly && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleAssignee(m.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">
            No assigned members yet
          </p>
        )}
      </ScrollArea>
    </div>
  );
}