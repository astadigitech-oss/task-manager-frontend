"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Circle } from "lucide-react";
import { UserApi } from "@/types/api/user.api";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useOnlineUsers } from "@/context/OnlineUserContext";
import { useMemo } from "react";
import { UserAvatar } from "./UserAvatar";

interface TeamMembersProps {
    members: UserApi[];
    onDelete?: (id: number) => void;
    isLoading?: boolean;
}

export function TeamMembers({ members, onDelete, isLoading }: TeamMembersProps) {
    const { isUserOnline, getLastSeen } = useOnlineUsers();

    const membersWithRealTimeStatus = useMemo(() => {
        return members.map((member) => ({
            ...member,
            avatar: (member as any).profile_image || member.avatar || null, // ✅ Fallback
            is_online: isUserOnline(member.id),
            last_seen: getLastSeen(member.id) || member.last_seen,
        }));
    }, [members, isUserOnline, getLastSeen]);
    if (isLoading) {
        return (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-4 surface-elevated p-4 rounded-xl border border-border animate-pulse"
                    >
                        <div className="h-12 w-12 rounded-full bg-muted" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-24" />
                            <div className="h-3 bg-muted rounded w-32" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }


    if (!members || members.length === 0) {
        return (
            <p className="text-center text-sm text-muted-foreground dark:text-slate-400 py-8">
                No team members found.
            </p>
        );
    }

    const formatLastSeen = (lastSeen: string | null) => {
        if (!lastSeen) return null;
        try {
            return formatDistanceToNow(new Date(lastSeen), {
                addSuffix: true,
                locale: localeId,
            });
        } catch {
            return null;
        }
    };

    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {membersWithRealTimeStatus.map((member) => {
                return (
                    <div
                        key={member.id}
                        className="flex items-center gap-4 surface-elevated p-4 rounded-xl border border-border dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="relative">
                            <UserAvatar
                                name={member.name}
                                avatar={member.avatar}
                                size="md"
                                bustCache
                            />
                            {member.is_online && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                            )}
                        </div>


                        <div className="flex-1 min-w-0">
                            {/* Name */}
                            <h4 className="font-medium text-foreground dark:text-slate-100 truncate">
                                {member.name}
                            </h4>

                            {/* Email */}
                            <p className="text-xs text-muted-foreground dark:text-slate-400 truncate mb-2">
                                {member.email}
                            </p>

                            {/* Role + Online Status */}
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className={`capitalize text-[11px] dark:border-slate-600 ${member.role === "admin"
                                        ? "border-blue-500/50 text-blue-600 dark:text-blue-400"
                                        : "border-gray-500/50 dark:border-slate-600"
                                        }`}
                                >
                                    {member.role}
                                </Badge>

                                {member.is_online ? (
                                    <Badge
                                        variant="outline"
                                        className="flex items-center gap-1 text-[11px] border-green-500/50 text-green-600 dark:text-green-400 dark:border-green-500/50"
                                    >
                                        <Circle className="w-2 h-2 fill-current" />
                                        Online
                                    </Badge>
                                ) : (
                                    member.last_seen && (
                                        <span className="text-[10px] text-muted-foreground dark:text-slate-500">
                                            {formatLastSeen(member.last_seen)}
                                        </span>
                                    )
                                )}
                            </div>
                        </div>

                        {onDelete && (
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => onDelete(member.id)}
                                className="shrink-0 text-muted-foreground dark:text-slate-400 hover:text-destructive dark:hover:text-red-400"
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