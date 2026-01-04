"use client";

import { useRef, useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useUpdateProfile } from "@/hooks/api/useProfile";
import { resolveImageUrl } from "@/lib/utils/media";
import { getInitials } from "@/lib/helpers/avatar";
import { showErrorToast, showSuccessToast, showWarningToast } from "@/lib/helpers/toast-helpers";

interface AvatarUploaderProps {
    onAvatarChange?: (file: File, preview: string) => void;
    standalone?: boolean;
}

export function AvatarUploader({ onAvatarChange, standalone = false }: AvatarUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { user } = useAuthStore();
    const { mutate: updateProfile, isPending } = useUpdateProfile();

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            showWarningToast("Ukuran file maksimal 2MB");
            return;
        }

        if (avatarPreview) {
            URL.revokeObjectURL(avatarPreview);
        }

        const preview = URL.createObjectURL(file);
        setAvatarPreview(preview);

        if (onAvatarChange) {
            onAvatarChange(file, preview);
        }

        if (standalone) {
            const formData = new FormData();
            formData.append("name", user?.name || "");
            
            if (user?.position) {
                formData.append("position", user.position);
            }
            
            formData.append("profile_image", file);

            updateProfile(formData, {
                onSuccess: () => {
                    showSuccessToast("Avatar berhasil diperbarui!");
                    if (avatarPreview) {
                        URL.revokeObjectURL(avatarPreview);
                    }
                    setAvatarPreview(null);
                },
                onError: () => {
                    showErrorToast("Gagal mengupdate avatar!");
                    if (avatarPreview) {
                        URL.revokeObjectURL(avatarPreview);
                    }
                    setAvatarPreview(null);
                }
            });
        }
    };

    return (
        <div className="flex items-center gap-6">
            <div className="relative">
                <Avatar className="h-24 w-24">
                    <AvatarImage
                        src={avatarPreview || resolveImageUrl(user?.avatar)}
                        alt={user?.name || "User"}
                    />
                    <AvatarFallback className="text-2xl">
                        {getInitials(user?.name)}
                    </AvatarFallback>
                </Avatar>

                <button
                    onClick={() => inputRef.current?.click()}
                    disabled={isPending}
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    <Camera className="h-4 w-4" />
                </button>

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileChange}
                    disabled={isPending}
                />
            </div>

            <div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                    disabled={isPending}
                >
                    {isPending ? "Uploading..." : "Change Photo"}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG. Max 2MB
                </p>
            </div>
        </div>
    );
}