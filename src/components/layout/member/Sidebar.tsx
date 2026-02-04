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
  Search,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useProject } from "@/context/ProjectContext";
import { cn } from "@/lib/utils/utils";
import { getFilteredMenuItems } from "@/components/shared/sidebarConfig";
import { useAuthStore } from "@/store/useAuthStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  currentPage?: string;
  onCreate?: () => void;
  onNavigate?: (page: string, project_id?: string) => void;
}

export function MemberSidebar({ isOpen, onClose, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const { logout } = useAuthStore();

  const {
    workspaces,
    isLoading: isLoadingWorkspaces,
    selectedWorkspaceId,
    setSelectedWorkspaceId,
  } = useWorkspace();

  const {
    projects,
    isLoading: isLoadingProjects,
  } = useProject();

  // Filter menu items untuk member (isAdmin = false)
  const menuItems = getFilteredMenuItems(false);

  const isMenuActive = (menuId: string) => {
    const current = pathname.split("/").filter(Boolean).pop() || "dashboard";
    return current === menuId;
  };

  const toggleWorkspace = (workspace_id: number) => {
    const newSet = new Set(expandedWorkspaces);
    if (newSet.has(workspace_id)) {
      newSet.delete(workspace_id);
    } else {
      newSet.add(workspace_id);
    }
    setExpandedWorkspaces(newSet);
  };

  const handleWorkspaceClick = (workspace_id: number) => {
    setSelectedWorkspaceId(workspace_id);
    onNavigate?.("projects");
  };

  const handleProjectClick = (project_id: number) => {
    onNavigate?.("project-detail", project_id.toString());
  };


  // Get projects by workspace
  const getWorkspaceProjects = (workspace_id: number) => {
    return projects.filter(p => p.workspace_id === workspace_id);
  };

  // Filter workspaces and projects based on search
  const filteredWorkspaces = useMemo(() => {
    if (!searchQuery.trim()) return workspaces;

    const query = searchQuery.toLowerCase();

    return workspaces.filter((ws) => {
      const workspaceMatches = ws.name.toLowerCase().includes(query);
      const wsProjects = getWorkspaceProjects(ws.id);
      const projectMatches = wsProjects?.some((p) =>
        p.name.toLowerCase().includes(query)
      );

      return workspaceMatches || projectMatches;
    });
  }, [workspaces, projects, searchQuery]);

  const getFilteredProjects = (workspace_id: number) => {
    const wsProjects = getWorkspaceProjects(workspace_id);
    if (!searchQuery.trim()) return wsProjects;

    const query = searchQuery.toLowerCase();
    return wsProjects.filter((p) => p.name.toLowerCase().includes(query));
  };

  const shouldAutoExpand = (workspace_id: number) => {
    if (!searchQuery.trim()) return expandedWorkspaces.has(workspace_id);

    const filteredProjects = getFilteredProjects(workspace_id);
    return filteredProjects.length > 0;
  };

  const isLoading = isLoadingWorkspaces || isLoadingProjects;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-50 transition-transform",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 border-b shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold">A</span>
          </div>
          <div>
            <span className="text-xl font-bold">ASTA</span>
            <span className="block text-[10px] text-muted-foreground">
              TASK MANAGER
            </span>
          </div>
        </div>

        {/* Fixed Navigation Section */}
        <div className="p-4 shrink-0">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const active = isMenuActive(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate?.(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Workspaces Section */}
        <div className="flex-1 min-h-0 flex flex-col border-t border-sidebar-border">
          <div className="p-4 pb-2 shrink-0">
            <div className="flex items-center justify-between px-2 mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Workspaces
              </span>
            </div>

            {/* Search Input */}
            <div className="relative px-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <ScrollArea className="overflow-hidden scrollbar-thin scrollbar-thumb-sidebar-ring scrollbar-track-transparent">
            <div className="flex-1 px-4">
              <div className="space-y-1 pb-4">
                {isLoading ? (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : filteredWorkspaces.length === 0 ? (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    {searchQuery ? "No results found" : "No workspaces"}
                  </div>
                ) : (
                  <>
                    {filteredWorkspaces.map((ws) => {
                      const wsProjects = getFilteredProjects(ws.id);
                      const expanded = shouldAutoExpand(ws.id);
                      const selected = selectedWorkspaceId === ws.id;
                      const projectCount = getWorkspaceProjects(ws.id)?.length || 0;
                      const workspaceColor =
                        ws.color && ws.color.trim() !== "" ? ws.color : "";

                      const highlightText = (text: string) => {
                        if (!searchQuery.trim()) return text;

                        const query = searchQuery.toLowerCase();
                        const index = text.toLowerCase().indexOf(query);

                        if (index === -1) return text;

                        return (
                          <>
                            {text.slice(0, index)}
                            <mark className="bg-primary/20 text-primary font-medium">
                              {text.slice(index, index + searchQuery.length)}
                            </mark>
                            {text.slice(index + searchQuery.length)}
                          </>
                        );
                      };

                      return (
                        <div key={ws.id} className="space-y-1">
                          <div className="flex items-center group">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={() => toggleWorkspace(ws.id)}
                            >
                              {expanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>

                            <button
                              onClick={() => handleWorkspaceClick(ws.id)}
                              className={cn(
                                "flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors",
                                selected
                                  ? "bg-primary/10 text-primary font-medium ring-2 ring-primary/20"
                                  : "hover:bg-sidebar-accent"
                              )}
                            >
                              <Folder
                                className="h-4 w-4 shrink-0"
                                style={{ color: workspaceColor }}
                                fill={selected ? workspaceColor : "none"}
                              />
                              <span className="text-sm leading-snug wrap-break-word line-clamp-2 flex-1">
                                {highlightText(ws.name)}
                              </span>
                              <span className={cn(
                                "text-xs px-1.5 py-0.5 rounded shrink-0",
                                selected
                                  ? "bg-primary/20 text-primary font-medium"
                                  : "bg-sidebar-accent"
                              )}>
                                {projectCount}
                              </span>
                            </button>
                          </div>

                          {/* Projects List */}
                          {expanded && wsProjects && wsProjects.length > 0 && (
                            <div className="ml-8 space-y-1">
                              {wsProjects.map((p) => (
                                <button
                                  key={p.id}
                                  onClick={() => handleProjectClick(p.id)}
                                  className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-accent transition-colors group/project"
                                >
                                  <FolderKanban className="h-4 w-4 shrink-0" />
                                  <span className="flex-1 min-w-0 text-left wrap-break-word line-clamp-2">
                                    {highlightText(p.name)}
                                  </span>
                                </button>
                              ))}

                            </div>
                          )}

                          {expanded && (!wsProjects || wsProjects.length === 0) && (
                            <div className="ml-8 px-3 py-2 text-xs text-muted-foreground">
                              {searchQuery ? "No matching projects" : "No projects yet"}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {searchQuery && filteredWorkspaces.length > 0 && (
                      <div className="mt-3 text-xs text-muted-foreground">
                        Found {filteredWorkspaces.length} workspace
                        {filteredWorkspaces.length !== 1 ? "s" : ""}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border shrink-0">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10"
            onClick={() => {
              logout();
              window.location.href = "/auth/login";
            }}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
}