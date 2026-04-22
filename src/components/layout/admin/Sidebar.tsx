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
  Plus,
  MoreVertical,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useProject } from "@/context/ProjectContext";
import { CreateWorkspaceDialog } from "@/components/modals/CreateWorkspaceDialog";
import { EditWorkspaceDialog } from "@/components/modals/EditWorkspaceModal";
import { useModal } from "@/hooks/useModal";
import { cn } from "@/lib/utils/utils";
import { getFilteredMenuItems } from "@/components/shared/sidebarConfig";
import { useAuthStore } from "@/store/useAuthStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { WorkspaceApi } from "@/types/api/workspace.api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  isOpen?: boolean;
  isCollapsed?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  onToggleCollapse?: () => void;
  currentPage?: string;
  onCreate?: () => void;
  onNavigate?: (page: string, project_id?: string) => void;
}

export function AdminSidebar({
  isOpen,
  isCollapsed = false,
  onOpen,
  onClose,
  onToggleCollapse,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [editingWorkspace, setEditingWorkspace] = useState<WorkspaceApi | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { logout } = useAuthStore();

  const {
    workspaces,
    updateWorkspace,
    isLoading: isLoadingWorkspaces,
    softDeleteWorkspace,
    selectedWorkspaceId,
    setSelectedWorkspaceId,
  } = useWorkspace();

  const {
    projects,
    isLoading: isLoadingProjects,
  } = useProject();

  const createWsDialog = useModal();
  const menuItems = getFilteredMenuItems(true);

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

  const handleCreateWorkspace = async (data: {
    name: string;
    color: string;
  }) => {
    createWsDialog.createWorkspace.close();
  };

  const handleEditWorkspace = (workspace: WorkspaceApi) => {
    setEditingWorkspace(workspace);
    setIsEditDialogOpen(true);
  };

  const handleDeleteWorkspace = (workspace_id: number, name: string) => {
    toast.custom(
      (t) => (
        <div className="bg-card border border-border rounded-lg shadow-lg p-4 min-w-[320px] max-w-md">
          <div className="flex items-start gap-3 mb-4">
            <div className="shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                Hapus workspace "{name}"?
              </h3>
              <p className="text-sm text-muted-foreground">
                Workspace yang dihapus tidak dapat dikembalikan. Semua project di
                dalamnya ikut terhapus.
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => toast.dismiss(t)}
              className="px-4 py-2 text-sm font-medium bg-muted hover:bg-muted/80 rounded-md"
            >
              Batal
            </button>
            <button
              onClick={async () => {
                await softDeleteWorkspace(workspace_id);
                toast.dismiss(t);
              }}
              className="px-4 py-2 text-sm font-medium text-destructive-foreground bg-destructive hover:bg-destructive/90 rounded-md"
            >
              Hapus
            </button>
          </div>
        </div>
      ),
      { duration: 10000 }
    );
  };

  const getWorkspaceProjects = (workspace_id: number) => {
    return projects.filter(p => p.workspace_id === workspace_id);
  };

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
    <TooltipProvider delayDuration={300}>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-50 transition-all duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
          isCollapsed ? "lg:w-16" : "lg:w-64",
          "w-64"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center gap-3 mt-1 shrink-0 transition-all duration-300",
            isCollapsed ? "justify-center px-0" : "justify-center"
          )}
        >
          <div className="relative w-12 h-12 shrink-0">
            <img
              src="/assets/logo_hitam.png"
              alt="ASTA Logo"
              className="w-full h-full object-contain dark:hidden"
            />
            <img
              src="/assets/logo_putih.png"
              alt="ASTA Logo"
              className="w-full h-full object-contain hidden dark:block"
            />
          </div>

          <div
            className={cn(
              "flex flex-col transition-all duration-200 overflow-hidden",
              isCollapsed ? "lg:hidden" : "flex"
            )}
          >
            <span className="text-[14px] font-bold text-foreground leading-tight whitespace-nowrap">
              TASK MANAGER
            </span>
          </div>
        </div>
        
        <Separator />

        {/* Fixed Navigation Section */}
        <div className={cn("p-4 shrink-0", isCollapsed && "lg:px-2")}>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const active = isMenuActive(item.id);
              return isCollapsed ? (
                // Collapsed: icon only with tooltip
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onNavigate?.(item.id)}
                      className={cn(
                        "w-full flex items-center justify-center p-2.5 rounded-lg transition-colors",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-sidebar-foreground hover:bg-sidebar-accent"
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.title}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
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
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.title}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Workspaces Section — hidden when collapsed */}
        {!isCollapsed && (
          <div className="flex-1 min-h-0 flex flex-col border-t border-sidebar-border">
            <div className="p-4 pb-2 shrink-0">
              <div className="flex items-center justify-between px-2 mb-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Workspaces
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={createWsDialog.createWorkspace.open}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

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

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 shrink-0"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleEditWorkspace(ws)}
                                  >
                                    Edit Workspace
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() =>
                                      handleDeleteWorkspace(ws.id, ws.name)
                                    }
                                  >
                                    Hapus Workspace
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

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
        )}

        {/* Collapsed: Workspace icon shortcut with tooltip */}
        {isCollapsed && (
          <div className="flex-1 flex flex-col items-center gap-1 px-2 pt-2 border-t border-sidebar-border overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-ring scrollbar-track-transparent">
            {isLoading ? (
              <div className="text-xs text-muted-foreground py-2">…</div>
            ) : (
              workspaces.map((ws) => {
                const selected = selectedWorkspaceId === ws.id;
                const workspaceColor =
                  ws.color && ws.color.trim() !== "" ? ws.color : undefined;

                return (
                  <Tooltip key={ws.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleWorkspaceClick(ws.id)}
                        className={cn(
                          "w-full flex items-center justify-center p-2.5 rounded-lg transition-colors",
                          selected
                            ? "bg-primary/10 ring-2 ring-primary/20"
                            : "hover:bg-sidebar-accent"
                        )}
                      >
                        <Folder
                          className="h-5 w-5 shrink-0"
                          style={{ color: workspaceColor }}
                          fill={selected ? workspaceColor : "none"}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{ws.name}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })
            )}

            {/* Add workspace button (collapsed) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 mt-1"
                  onClick={createWsDialog.createWorkspace.open}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>New Workspace</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Collapse Toggle Button — desktop only */}
        <div
          className={cn(
            "hidden lg:flex shrink-0 border-t border-sidebar-border p-2",
            isCollapsed ? "justify-center" : "justify-end"
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onToggleCollapse}
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{isCollapsed ? "Expand sidebar" : "Collapse sidebar"}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>

      <CreateWorkspaceDialog
        isOpen={createWsDialog.createWorkspace.isOpen}
        onClose={createWsDialog.createWorkspace.close}
        onCreate={handleCreateWorkspace}
      />

      {editingWorkspace && (
        <EditWorkspaceDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingWorkspace(null);
          }}
          workspace={editingWorkspace}
          onUpdate={updateWorkspace}
        />
      )}
    </TooltipProvider>
  );
}