// components/layout/member/Sidebar.tsx

"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  ChevronDown,
  ChevronRight,
  FolderKanban,
  X,
  Folder,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { cn } from "@/lib/utils";
import { getFilteredMenuItems } from "@/components/shared/sidebarConfig";
import { useAuthStore } from "@/store/useAuthStore";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  currentPage: string;
  onNavigate?: (page: string, projectId?: string) => void;
}



export function Sidebar({ isOpen, onClose, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(
    new Set(["1"])
  );

  const {
    workspaces,
    getWorkspaceProjects,
    selectedWorkspaceId,
    setSelectedWorkspaceId,
  } = useWorkspace();

  const { logout } = useAuthStore();
  
  // Get menu items (member without admin-only items)
  const menuItems = getFilteredMenuItems(false);

  const isMenuActive = (menuId: string) => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const currentRoute = pathSegments[pathSegments.length - 1] || "dashboard";
    return currentRoute === menuId;
  };

  const toggleWorkspace = (workspaceId: string) => {
    const newExpanded = new Set(expandedWorkspaces);
    if (newExpanded.has(workspaceId)) {
      newExpanded.delete(workspaceId);
    } else {
      newExpanded.add(workspaceId);
    }
    setExpandedWorkspaces(newExpanded);
  };

  const handleWorkspaceClick = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    onNavigate?.("projects", undefined);
  };

  const handleProjectClick = (projectId: string) => {
    onNavigate?.("project-detail", projectId);
  };

  const handleMenuClick = (page: string) => {
    onNavigate?.(page);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50 flex items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-muted"
        >
          {isOpen ? (
            <X className="h-5 w-5 text-foreground" />
          ) : (
            <Menu className="h-5 w-5 text-foreground" />
          )}
        </Button>
        <h1 className="ml-4 text-lg font-semibold text-foreground">
          My Workspace
        </h1>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Header/Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-sidebar-border">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">M</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-sidebar-foreground">Member</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Workspace
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-ring scrollbar-track-transparent">
          <div className="p-4 space-y-6">
            {/* Main Navigation */}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = isMenuActive(item.id);

                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium",
                      isActive
                        ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.title}</span>
                  </button>
                );
              })}
            </nav>

            {/* Workspace Section */}
            <div className="border-t border-sidebar-border pt-4">
              <div className="flex items-center justify-between px-2 mb-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  My Workspaces
                </span>
              </div>

              <div className="space-y-1">
                {workspaces.map((workspace) => {
                  const projects = getWorkspaceProjects(workspace.id);
                  const isExpanded = expandedWorkspaces.has(workspace.id);
                  const isSelected = selectedWorkspaceId === workspace.id;

                  return (
                    <div key={workspace.id}>
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0 hover:bg-sidebar-accent"
                          onClick={() => toggleWorkspace(workspace.id)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-sidebar-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-sidebar-foreground" />
                          )}
                        </Button>
                        <button
                          onClick={() => handleWorkspaceClick(workspace.id)}
                          className={cn(
                            "flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-left",
                            isSelected
                              ? "bg-primary/10 text-primary dark:bg-primary/20"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                        >
                          <Folder className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate flex-1">{workspace.name}</span>
                          <span
                            className={cn(
                              "text-xs px-1.5 py-0.5 rounded-full",
                              isSelected
                                ? "bg-primary/20 text-primary dark:bg-primary/30"
                                : "bg-sidebar-accent text-sidebar-accent-foreground"
                            )}
                          >
                            {projects.length}
                          </span>
                        </button>
                      </div>

                      {isExpanded && projects.length > 0 && (
                        <div className="ml-8 mt-1 space-y-1">
                          {projects.map((project) => (
                            <button
                              key={project.id}
                              onClick={() => handleProjectClick(project.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 text-left"
                            >
                              <FolderKanban className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{project.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-sidebar-border bg-sidebar">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive transition-all duration-200 font-medium"
            onClick={() => {
              logout();
              window.location.href = "/auth/login";
            }}
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>
    </>
  );
}