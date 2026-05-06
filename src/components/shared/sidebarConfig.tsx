"use client";

import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
} from "lucide-react";

export interface MenuItem {
    id: string;
  title: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  roles?: Role[];
}

export type Role = "admin" | "member" | "management";

export const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "member", "management"],
  },
  {
    id: "projects",
    title: "Projects",
    icon: FolderKanban,
    roles: ["admin", "member"],
  },
  {
    id: "team",
    title: "Team",
    icon: Users,
    roles: ["admin"],
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
    roles: ["admin", "member", "management"],
  },
];

export const getFilteredMenuItems = (role: Role) => {
  return menuItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(role);
  });
};