"use client";

import { Button } from "@/components/ui/button";
import { Menu, LogOut, Settings } from "lucide-react";
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

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <header className="flex items-center justify-between bg-background border-b border-border shadow-sm px-6 py-4">
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
        <span className="hidden md:inline text-sm text-muted-foreground">
          {user?.role
            ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
            : "Guest"}{" "}
          Mode
        </span>

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