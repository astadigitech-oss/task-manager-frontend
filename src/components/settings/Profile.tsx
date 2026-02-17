"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/providers/ThemeProvider";
import {
  User,
  Settings as SettingsIcon,
  Shield,
  Camera,
  Home
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { positionConfig } from "@/types/shared/position";
import { useGetProfile, useUpdateProfile } from "@/hooks/api/useProfile";
import { resolveImageUrl } from "@/lib/utils/media";
import { getInitials } from "@/lib/helpers/avatar";
import { AvatarCropDialog } from "@/components/settings/AvatarCropDialog";
import { showWarningToast } from "@/lib/helpers/toast-helpers";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type SettingsTab = "profile" | "preferences";
type PositionKey = keyof typeof positionConfig;

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const { data: profileData, isLoading: isLoadingProfile } = useGetProfile();

  const [fullName, setFullName] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState<PositionKey | "">("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string>("");


  const [initialProfile, setInitialProfile] = useState({
    fullName: "",
    email: "",
    position: "" as PositionKey | "",
    telegramChatId: "",
  });

  const [isDirty, setIsDirty] = useState(false);

  const avatarUrl = useMemo(() => {
    if (avatarPreview) return avatarPreview;

    const currentUser = profileData || user;
    if (!currentUser?.avatar) return undefined;

    return resolveImageUrl(
      currentUser.avatar,
      true,
      currentUser.updated_at
    );
  }, [avatarPreview, profileData?.avatar, profileData?.updated_at, user?.avatar, user?.updated_at]);

  useEffect(() => {
    if (profileData && user) {
      const hasChanges =
        profileData.name !== user.name ||
        profileData.avatar !== user.avatar ||
        profileData.position !== user.position ||
        profileData.telegram_chat_id !== user.telegram_chat_id ||
        profileData.updated_at !== user.updated_at;

      if (hasChanges) {
        updateUser({
          name: profileData.name,
          avatar: profileData.avatar,
          position: profileData.position,
          telegram_chat_id: profileData.telegram_chat_id,
          updated_at: profileData.updated_at,
        });
      }
    }
  }, [
    profileData?.name,
    profileData?.avatar,
    profileData?.position,
    profileData?.telegram_chat_id,
    profileData?.updated_at,

  ]);

  useEffect(() => {
    if (profileData) {
      setFullName(profileData.name);
      setEmail(profileData.email);
      setPosition((profileData.position as PositionKey) || "");
      setTelegramChatId(profileData.telegram_chat_id || "");

      setInitialProfile({
        fullName: profileData.name,
        email: profileData.email,
        position: (profileData.position as PositionKey) || "",
        telegramChatId: profileData.telegram_chat_id || "",
      });
    }
  }, [profileData?.id, profileData?.name, profileData?.email, profileData?.position, profileData?.telegram_chat_id]);

  useEffect(() => {
    const hasChanged =
      fullName !== initialProfile.fullName ||
      position !== initialProfile.position ||
      avatarFile !== null ||
      telegramChatId !== initialProfile.telegramChatId;

    setIsDirty(hasChanged);
  }, [fullName, position, avatarFile, telegramChatId, initialProfile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showWarningToast("Ukuran file maksimal 2MB");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedImageSrc(previewUrl);
    setCropDialogOpen(true);
  };

  const handleCropComplete = (croppedBlob: Blob) => {

    const timestamp = Date.now();
    const userId = user?.id || 'unknown';
    const randomStr = Math.random().toString(36).substring(2, 8);

    const filename = `avatar_${userId}_${timestamp}_${randomStr}.jpg`;

    const croppedFile = new File([croppedBlob], filename, {
      type: "image/jpeg",
    });

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    const newPreviewUrl = URL.createObjectURL(croppedBlob);
    setAvatarFile(croppedFile);
    setAvatarPreview(newPreviewUrl);

    if (selectedImageSrc) {
      URL.revokeObjectURL(selectedImageSrc);
    }
  };

  const handleCropDialogClose = () => {
    setCropDialogOpen(false);
    if (selectedImageSrc) {
      URL.revokeObjectURL(selectedImageSrc);
      setSelectedImageSrc("");
    }
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      if (selectedImageSrc) {
        URL.revokeObjectURL(selectedImageSrc);
      }
    };
  }, [avatarPreview, selectedImageSrc]);

  useEffect(() => {
    if (user) {
      setFullName(user.name);
      setPosition((user.position as PositionKey) || "");
      setTelegramChatId(user.telegram_chat_id || "");
    }
  }, [user]);

  const handleSave = () => {
    const formData = new FormData();
    formData.append("name", fullName);

    if (position) {
      formData.append("position", position);
    }

    if (avatarFile) {
      formData.append("profile_image", avatarFile);
    }
    if (telegramChatId) {
      formData.append("telegram_chat_id", telegramChatId);
    }

    updateProfile(formData, {
      onSuccess: () => {
        if (avatarPreview) {
          URL.revokeObjectURL(avatarPreview);
        }
        setAvatarFile(null);
        setAvatarPreview(null);

        setInitialProfile({
          fullName,
          email,
          position,
          telegramChatId,
        });
      }
    });
  };

  const handleCancel = () => {
    setFullName(initialProfile.fullName);
    setEmail(initialProfile.email);
    setPosition(initialProfile.position);
    setTelegramChatId(initialProfile.telegramChatId);
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(null);
    setAvatarPreview(null);
    setIsDirty(false);
  };

  const menuItems = [
    { id: "profile" as SettingsTab, label: "Profile Settings", icon: User },
    { id: "preferences" as SettingsTab, label: "Preferences", icon: SettingsIcon },
  ];

  const basePath = user?.role === "admin" ? "/admin" : "/member";

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 w-full">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => router.push(`${basePath}/dashboard`)}
                  >
                    <Home className="w-4 h-4" />
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="flex items-center gap-2">
                    <SettingsIcon className="w-4 h-4" />
                    Settings
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-border mb-8">
            <nav className="flex gap-8" aria-label="Settings tabs">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === item.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-foreground font-bold text-xl mb-1">Profile Settings</h2>
                  <p className="text-sm text-muted-foreground">
                    Kelola informasi profil dan pengaturan akun Anda
                  </p>
                </div>

                <Separator />

                {/* Avatar Upload */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage
                        src={avatarUrl}
                        alt={user?.name || 'User'}
                      />
                      <AvatarFallback className="text-2xl">
                        {getInitials(user?.name || profileData?.name)}
                      </AvatarFallback>
                    </Avatar>

                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="h-4 w-4" />
                    </label>

                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>

                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("avatar-upload")?.click()}
                    >
                      Change Photo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, PNG. Max 2MB
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="space-y-5">
                  <div className="space-y-2 max-w-sm">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2 max-w-sm">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email tidak dapat diubah
                    </p>
                  </div>

                  <div className="space-y-2 ">
                    <Label htmlFor="position">Position</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="px-3 text-sm">
                          {position
                            ? positionConfig[position].label
                            : "Select your position"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="max-h-70 overflow-y-auto p-2">
                        <div className="space-y-1">
                          {Object.entries(positionConfig).map(([key, config]) => (
                            <div
                              key={key}
                              className={`p-2 rounded-md cursor-pointer hover:bg-muted transition-colors ${position === key ? "bg-muted" : ""
                                }`}
                              onClick={() => {
                                setPosition(key as PositionKey);
                              }}
                            >
                              <p className="text-sm">{config.label}</p>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    {!position && (
                      <p className="text-xs text-muted-foreground">
                        Pilih posisi Anda
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 max-w-sm">
                    <Label htmlFor="telegram">Telegram</Label>
                    <Input
                      id="telegram"
                      value={telegramChatId || ""}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                      placeholder="..."
                    />
                  </div>

                </div>

                <Separator />

                {/* Action Buttons */}
                {isDirty && (
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={handleCancel} disabled={isPending}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isPending}>
                      {isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-foreground font-bold text-xl mb-1">Preferences</h2>
                  <p className="text-sm text-muted-foreground">
                    Atur preferensi dan notifikasi Anda
                  </p>
                </div>
                <Separator />

                <div className="space-y-6">
                  <div>
                    <h3 className="text-foreground font-semibold mb-4">Email Notifications</h3>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-foreground font-semibold mb-4">Appearance</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">Dark Mode</p>
                          <p className="text-xs text-muted-foreground">Enable dark mode theme</p>
                        </div>
                        <Switch
                          checked={theme === "dark"}
                          onCheckedChange={toggleTheme}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">Compact View</p>
                          <p className="text-xs text-muted-foreground">Use compact layout for lists</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {isDirty && (
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Avatar Crop Dialog */}
      <AvatarCropDialog
        open={cropDialogOpen}
        onClose={handleCropDialogClose}
        imageSrc={selectedImageSrc}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}