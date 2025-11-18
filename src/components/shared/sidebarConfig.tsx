"use client";

import {
  LayoutDashboard,
  FolderKanban,
  Users,
  FolderArchive,
  Settings,
} from "lucide-react";

export interface MenuItem {
  id: string;
  title: string;
  icon: any;
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
  },
  {
    id: "files",
    title: "Files",
    icon: FolderArchive,
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