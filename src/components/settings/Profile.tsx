"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
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
} from "../ui/breadcrumb";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { divisionConfig } from "@/types";

type SettingsTab = "profile" | "preferences" | "account" | "team";
type DivisionKey = keyof typeof divisionConfig;

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();

  const [fullName, setFullName] = useState("Sarah Johnson");
  const [email, setEmail] = useState("sarah.j@company.com");
  const [division, setDivision] = useState<DivisionKey>("frontend");

  const [initialProfile, setInitialProfile] = useState({
    fullName: "Sarah Johnson",
    email: "sarah.j@company.com",
    division: "frontend" as DivisionKey,
  });


  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [weeklyReports, setWeeklyReports] = useState(true);


  const [isDirty, setIsDirty] = useState(false);
  useEffect(() => {
    const changed =
      fullName !== initialProfile.fullName ||
      email !== initialProfile.email ||
      division !== initialProfile.division;
    setIsDirty(changed);
  }, [fullName, email, division, initialProfile]);

  const handleSave = () => {
    setInitialProfile({ fullName, email, division });
    console.log("✅ Saved profile:", { fullName, email, division });
    setIsDirty(false);
  };

  const handleCancel = () => {
    setFullName(initialProfile.fullName);
    setEmail(initialProfile.email);
    setDivision(initialProfile.division);
    setIsDirty(false);
  };

  const menuItems = [
    { id: "profile" as SettingsTab, label: "Profile Settings", icon: User },
    { id: "preferences" as SettingsTab, label: "Preferences", icon: SettingsIcon },
    { id: "account" as SettingsTab, label: "Account Management", icon: Shield },
    // { id: "team" as SettingsTab, label: "Team & Permissions", icon: Users },
  ];

  const basePath = user?.role === "admin" ? "/admin" : "/member";

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* Header with Breadcrumb */}


      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Sidebar */}
        <div className="w-64 bg-sidebar border-r border-sidebar-border p-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${activeTab === item.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-background">
          <div className="p-8">
            {activeTab === "profile" && (
              <div className="space-y-6 max-w-3xl">
                <div className="flex-shrink-0">
                  <Breadcrumb className="mb-0">
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
                <div>
                  <h2 className="text-foreground font-bold text-xl mb-1">Profile Settings</h2>
                  <p className="text-sm text-muted-foreground">
                    Kelola informasi profil dan pengaturan akun Anda
                  </p>
                </div>

                <Separator />


                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" alt="User" />
                      <AvatarFallback className="text-2xl">
                        SJ
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <div>
                    <Button variant="outline" size="sm">
                      Change Photo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, PNG or GIF. Max size 2MB
                    </p>
                  </div>
                </div>

                <Separator />


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
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="division">Division</Label>
                    <Select value={division} onValueChange={(v: string) => setDivision(v as DivisionKey)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select division" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(divisionConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <span>{config.emoji}</span>
                              <span>{config.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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


            {activeTab === "preferences" && (
              <div className="space-y-6 max-w-3xl">
                <div className="flex-shrink-0">
                  <Breadcrumb className="mb-0">
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
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">Email Notifications</p>
                          <p className="text-xs text-muted-foreground">Receive email about workspace activity</p>
                        </div>
                        <Switch
                          checked={emailNotifications}
                          onCheckedChange={setEmailNotifications}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">Weekly Reports</p>
                          <p className="text-xs text-muted-foreground">Receive weekly summary of activities</p>
                        </div>
                        <Switch
                          checked={weeklyReports}
                          onCheckedChange={setWeeklyReports}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">Project Updates</p>
                          <p className="text-xs text-muted-foreground">Get notified about project changes</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-foreground font-semibold mb-4">Push Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">Push Notifications</p>
                          <p className="text-xs text-muted-foreground">Receive push notifications in browser</p>
                        </div>
                        <Switch
                          checked={pushNotifications}
                          onCheckedChange={setPushNotifications}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">Task Reminders</p>
                          <p className="text-xs text-muted-foreground">Get reminded about upcoming tasks</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
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
              <div className="space-y-6 max-w-3xl">
                <div className="flex-shrink-0">
                  <Breadcrumb className="mb-0">
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
                <div>
                  <h2 className="text-foreground font-bold text-xl mb-1">Account Management</h2>
                  <p className="text-sm text-muted-foreground">
                    Kelola akun dan keamanan Anda
                  </p>
                </div>
                <Separator />

                <div className="space-y-6">
                  <div>
                    <h3 className="text-foreground font-semibold mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>

                  {/* <Separator />

                  <div>
                    <h3 className="text-foreground mb-4">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add an extra layer of security to your account
                    </p>
                    <Button variant="outline">Enable 2FA</Button>
                  </div> */}

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

            {/* {activeTab === "team" && (
            <div className="space-y-6 max-w-3xl">
              <h2 className="text-slate-900 mb-1">Team & Permissions</h2>
              <p className="text-sm text-slate-600">
                Kelola tim dan izin akses Anda
              </p>
              <Separator />
              
            </div>
          )} */}
          </div>
        </div>
      </div>
    </div>
  );
}
