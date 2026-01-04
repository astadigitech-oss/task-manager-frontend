"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { resolveImageUrl } from "@/lib/utils/media";
import { getInitials } from "@/lib/helpers/avatar";
import { cn } from "@/lib/utils/utils";

interface UserAvatarProps {
    name?: string | null;
    avatar?: string | null;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
    bustCache?: boolean;
}

const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-lg",
    xl: "h-24 w-24 text-2xl",
};

export function UserAvatar({ name, avatar, size = "md", className, bustCache = false }: UserAvatarProps) {
    const resolvedUrl = resolveImageUrl(avatar, bustCache);

    return (
        <Avatar className={cn(sizeClasses[size], className)}>
            <AvatarImage
                src={resolvedUrl}
                alt={name || "User"}
            />
            <AvatarFallback>
                {getInitials(name)}
            </AvatarFallback>
        </Avatar>
    );
}