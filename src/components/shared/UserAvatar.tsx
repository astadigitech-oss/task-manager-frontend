"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { resolveImageUrl } from "@/lib/utils/media";
import { getInitials } from "@/lib/helpers/avatar";
import { cn } from "@/lib/utils/utils";
import { useMemo, useState } from "react";

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

export function UserAvatar({ 
    name, 
    avatar, 
    size = "md", 
    className, 
    bustCache = false 
}: UserAvatarProps) {
    const [hasError, setHasError] = useState(false);

    // Resolve URL dengan validasi
    const resolvedUrl = useMemo(() => {
        if (!avatar) return undefined;
        
        const resolved = resolveImageUrl(avatar, bustCache);
        
        // Jika resolveImageUrl return undefined (invalid path), log warning
        if (!resolved && avatar) {
            console.warn(`[UserAvatar] Invalid avatar path for ${name}:`, avatar);
        }
        
        return resolved;
    }, [avatar, bustCache, name]);

    // Reset error state ketika avatar berubah
    useMemo(() => {
        setHasError(false);
    }, [avatar]);

    const handleError = () => {
        if (!hasError) {
            console.error(`[UserAvatar] Failed to load avatar for ${name}:`, resolvedUrl);
            setHasError(true);
        }
    };

    return (
        <Avatar className={cn(sizeClasses[size], className)}>
            {resolvedUrl && !hasError ? (
                <AvatarImage
                    src={resolvedUrl}
                    alt={name || "User"}
                    onError={handleError}
                />
            ) : null}
            <AvatarFallback>
                {getInitials(name)}
            </AvatarFallback>
        </Avatar>
    );
}