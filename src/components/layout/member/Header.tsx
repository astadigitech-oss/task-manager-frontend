"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, LogOut, Settings, User, Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useEffect } from "react";
import { useGetProfile } from "@/hooks/api/useProfile";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Separator } from "@/components/ui/separator";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { user, logout, updateUser } = useAuthStore();

  const { data: profileData } = useGetProfile();

  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  useEffect(() => {
    if (profileData) {
      updateUser({
        avatar: profileData.avatar,
        name: profileData.name,
        updated_at: profileData.updated_at,
      });
    }
  }, [profileData?.updated_at]);

  return (
    <header className="flex items-center justify-between bg-background dark:bg-card border-b border-border shadow-sm px-6 py-2 rounded-xl mx-4 mt-4">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="w-5 h-5" />
      </Button>

      <h1 className="text-lg font-semibold text-foreground"></h1>

      <div className="flex items-center gap-4">
        <Badge variant="outline" className="hidden md:inline-flex px-2 text-sm [&>svg]:size-4 border-green-500/50 text-green-600 dark:text-green-400">
          <User className="fill-gray-500 text-gray-500 w-5 h-5" />
          {user?.role
            ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
            : "Guest"}{" "}
        </Badge>

        <div className="pl-4 border-l border-border flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none">
              <UserAvatar
                name={user?.name}
                avatar={user?.avatar}
                size="sm"
                className="cursor-pointer ring-2 ring-transparent hover:ring-input transition-all"
              />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{user?.name || "Unknown User"}</span>
                <span className="text-xs text-muted-foreground">{user?.email || "No email"}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/member/settings")}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}