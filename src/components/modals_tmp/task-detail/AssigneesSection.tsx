"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CheckCircle2, UserPlus, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User as UserType, Task } from "@/types";

interface Props {
  members: UserType[];
  editedTask: Task;
  assignedMembers: UserType[];
  toggleAssignee: (memberId: string) => void;
}

export default function AssigneesSection({ members, editedTask, assignedMembers, toggleAssignee }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-gray-700">
          <User className="h-4 w-4" />
          <h4 className="text-sm font-semibold">Assigned To</h4>
        </div>
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
                  onClick={() => toggleAssignee(member.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 transition-colors",
                    editedTask.assignTo.includes(member.id) && "bg-blue-50"
                  )}
                >
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm flex-1 text-left">{member.name}</span>
                  {editedTask.assignTo.includes(member.id) && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        {assignedMembers.length > 0 ? (
          assignedMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 group">
              <Avatar className="h-9 w-9">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span>{member.role}</span>
                </div>
              </div>

              <button
                onClick={() => toggleAssignee(member.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 6L18 18M6 18L18 6" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 py-2">No one assigned</p>
        )}
      </div>
    </div>
  );
}
