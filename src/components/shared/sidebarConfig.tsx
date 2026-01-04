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
  adminOnly?: boolean;
}

export const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "projects",
    title: "Projects",
    icon: FolderKanban,
  },
  {
    id: "team",
    title: "Team",
    icon: Users,
    adminOnly: true,
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
  },
];

export const getFilteredMenuItems = (isAdmin: boolean) => {
  return menuItems.filter(item => isAdmin || !item.adminOnly);
};