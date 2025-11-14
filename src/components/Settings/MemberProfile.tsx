// app/member/settings/page.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Bell, Shield, Camera } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { divisionConfig, type Division } from "@/types";
import { cn } from "@/lib/utils";

type SettingsTab = "profile" | "preferences" | "security";

export default function MemberSettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Profile State
  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [division, setDivision] = useState<Division>((user?.division || "frontend") as Division);

  // Preferences State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [taskReminders, setTaskReminders] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);

  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSaveProfile = () => {
    console.log("Saving profile:", { fullName, email, division });
    alert("Profile updated successfully!");
  };

  const handleSavePreferences = () => {
    console.log("Saving preferences:", {
      emailNotifications,
      pushNotifications,
      taskReminders,
      weeklyReports,
    });
    alert("Preferences saved!");
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return alert("Please fill all password fields");
    }
    if (newPassword !== confirmPassword) {
      return alert("New passwords don't match");
    }
    console.log("Changing password...");
    alert("Password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const menuItems = [
    { id: "profile" as SettingsTab, label: "Profile", icon: User },
    { id: "preferences" as SettingsTab, label: "Preferences", icon: Bell },
    { id: "security" as SettingsTab, label: "Security", icon: Shield },
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-slate-200 p-4">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">Settings</h2>
          <p className="text-sm text-slate-600 mt-1">Manage your account</p>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  activeTab === item.id
                    ? "bg-green-50 text-green-600"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Profile Settings</h2>
                <p className="text-sm text-slate-600">
                  Manage your personal information
                </p>
              </div>

              <Separator />

              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="text-2xl">
                      {user?.name?.charAt(0) || "M"}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <Button variant="outline" size="sm">
                    Change Photo
                  </Button>
                  <p className="text-xs text-slate-500 mt-2">
                    JPG, PNG or GIF. Max size 2MB
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
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="division">Division</Label>
                  <Select value={division} onValueChange={(value) => setDivision(value as Division)}>
                    <SelectTrigger id="division">
                      <SelectValue />
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

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={user?.role || "member"}
                    disabled
                    className="bg-slate-100 capitalize"
                  />
                  <p className="text-xs text-slate-500">
                    Contact admin to change your role
                  </p>
                </div>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSaveProfile} className="bg-green-600 hover:bg-green-700">
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Preferences</h2>
                <p className="text-sm text-slate-600">
                  Manage your notifications and preferences
                </p>
              </div>

              <Separator />

              {/* Notifications */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 mb-4">
                    Email Notifications
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">Email Notifications</p>
                        <p className="text-xs text-slate-500">
                          Receive email about your tasks and projects
                        </p>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">Task Reminders</p>
                        <p className="text-xs text-slate-500">
                          Get reminded about upcoming task deadlines
                        </p>
                      </div>
                      <Switch
                        checked={taskReminders}
                        onCheckedChange={setTaskReminders}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">Weekly Reports</p>
                        <p className="text-xs text-slate-500">
                          Receive weekly summary of your activities
                        </p>
                      </div>
                      <Switch
                        checked={weeklyReports}
                        onCheckedChange={setWeeklyReports}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-base font-semibold text-slate-900 mb-4">
                    Push Notifications
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">Push Notifications</p>
                        <p className="text-xs text-slate-500">
                          Receive push notifications in browser
                        </p>
                      </div>
                      <Switch
                        checked={pushNotifications}
                        onCheckedChange={setPushNotifications}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-base font-semibold text-slate-900 mb-4">
                    Appearance
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">Dark Mode</p>
                        <p className="text-xs text-slate-500">
                          Enable dark mode theme
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSavePreferences} className="bg-green-600 hover:bg-green-700">
                  Save Preferences
                </Button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Security</h2>
                <p className="text-sm text-slate-600">
                  Manage your password and security settings
                </p>
              </div>

              <Separator />

              {/* Change Password */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 mb-4">
                    Change Password
                  </h3>
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

                    <Button 
                      onClick={handleChangePassword}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Update Password
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-base font-semibold text-slate-900 mb-4">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Add an extra layer of security to your account
                  </p>
                  <Button variant="outline">Enable 2FA</Button>
                </div>

                <Separator />

                <div>
                  <h3 className="text-base font-semibold text-slate-900 mb-4">
                    Active Sessions
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">Current Session</p>
                        <p className="text-xs text-slate-500">
                          Chrome on Windows • Jakarta, Indonesia
                        </p>
                      </div>
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}