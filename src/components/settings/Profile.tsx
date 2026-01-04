"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { divisionConfig } from "@/types/ui/user";
import { useUpdateProfile } from "@/hooks/api/useProfile";
import { resolveImageUrl } from "@/lib/utils/media";
import { getInitials } from "@/lib/helpers/avatar";
import { AvatarCropDialog } from "@/components/settings/AvatarCropDialog";
import { showWarningToast } from "@/lib/helpers/toast-helpers";

type SettingsTab = "profile" | "preferences" | "account";
type DivisionKey = keyof typeof divisionConfig;

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [division, setDivision] = useState<DivisionKey | "">("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string>("");

  const [initialProfile, setInitialProfile] = useState({
    fullName: "",
    email: "",
    division: "" as DivisionKey | "", 
  });

  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!user) return;

    const initialData = {
      fullName: user.name,
      email: user.email,
      division: (user.position as DivisionKey) || "",
    };

    setFullName(initialData.fullName);
    setEmail(initialData.email);
    setDivision(initialData.division);
    setInitialProfile(initialData);
  }, [user]);

  useEffect(() => {
    const hasChanged =
      fullName !== initialProfile.fullName ||
      division !== initialProfile.division ||
      avatarFile !== null;

    setIsDirty(hasChanged);
  }, [fullName, division, avatarFile, initialProfile]);

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

    const croppedFile = new File([croppedBlob], "avatar.jpg", {
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

  const handleSave = () => {
    const formData = new FormData();
    
    formData.append("name", fullName);
    
    const positionToSend = division || user?.position || "";
    if (positionToSend) {
      formData.append("position", positionToSend);
    }

    if (avatarFile) {
      formData.append("profile_image", avatarFile);
    }

    updateProfile(formData, {
      onSuccess: (data) => {
        setInitialProfile({ 
          fullName: data.name, 
          email: data.email, 
          division: (data.position as DivisionKey) || ""
        });
        
        if (avatarPreview) {
          URL.revokeObjectURL(avatarPreview);
        }
        
        setAvatarFile(null);
        setAvatarPreview(null);
        setIsDirty(false);
        
        setTimeout(() => {
          window.location.reload();
        }, 500);
      },
      onError: (error) => {
        console.error("Update gagal:", error);
      }
    });
  };

  const handleCancel = () => {
    setFullName(initialProfile.fullName);
    setEmail(initialProfile.email);
    setDivision(initialProfile.division);
    
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
    { id: "account" as SettingsTab, label: "Account Management", icon: Shield },
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
                    className={`flex items-center gap-2 px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === item.id
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
                        src={avatarPreview || resolveImageUrl(user?.avatar, true)}
                        alt={user?.name}
                        key={user?.avatar}
                      />
                      <AvatarFallback className="text-2xl">
                        {getInitials(user?.name)}
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
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
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

                  <div className="space-y-2">
                    <Label htmlFor="division">Division</Label>
                    <Select 
                      value={division} 
                      onValueChange={(v: string) => setDivision(v as DivisionKey | "")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select division" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(divisionConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!division && (
                      <p className="text-xs text-muted-foreground">
                        Pilih divisi Anda
                      </p>
                    )}
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

            {activeTab === "account" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-foreground font-bold text-xl mb-1">Account Management</h2>
                  <p className="text-sm text-muted-foreground">
                    Kelola akun dan keamanan Anda
                  </p>
                </div>
                <Separator />

                <div className="space-y-6">
                  <Separator />

                  <div>
                    <h3 className="text-foreground mb-4">Active Sessions</h3>
                    <div className="bg-muted/50 p-4 rounded-lg space-y-3 border border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-foreground">Current Session</p>
                          <p className="text-xs text-muted-foreground">Chrome on Windows • Jakarta, Indonesia</p>
                        </div>
                        <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/50 px-2 py-1 rounded border border-green-200 dark:border-green-800">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-destructive mb-4">Danger Zone</h3>
                    <div className="border border-destructive/30 bg-destructive/5 p-4 rounded-lg space-y-3">
                      <div>
                        <p className="text-sm text-foreground mb-1">Delete Account</p>
                        <p className="text-xs text-muted-foreground mb-3">
                          Permanently delete your account and all of your data
                        </p>
                        <Button variant="destructive" size="sm">
                          Delete Account
                        </Button>
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