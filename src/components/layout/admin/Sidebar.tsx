"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Users,
  LogOut,
  ChevronDown,
  ChevronRight,
  FolderKanban,
  X,
  Folder,
  Plus,
  LayoutDashboard,
  FolderArchive,
  Menu,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { CreateWorkspaceDialog } from "@/components/modals/CreateNewWorkspace";
import { useModal } from "@/hooks/useModal";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  currentPage: string;
  onNavigate?: (page: string, projectId?: string) => void;
  children?: React.ReactNode;
}

interface MenuItem {
  id: string;
  title: string;
  icon: any;
}

const menuItems: MenuItem[] = [
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

export function Sidebar({
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(
    new Set(["1"])
  );

  const {
    workspaces,
    getWorkspaceProjects,
    addWorkspace,
    selectedWorkspaceId,
    setSelectedWorkspaceId,
  } = useWorkspace();

  const { createWorkspace } = useModal();

  const isMenuActive = (menuId: string) => {
  // Ambil segment terakhir dari pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const currentRoute = pathSegments[pathSegments.length - 1] || 'dashboard';
  
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
    onNavigate?.(`projects/${projectId}`);
  };

  const handleCreateWorkspace = (workspace: {
    name: string;
    color: string;
    projectIds: string[];
  }) => {
    addWorkspace(workspace);
  };

  const handleMenuClick = (page: string) => {
    onNavigate?.(page);
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hover:bg-slate-100"
        >
          {isSidebarOpen ? (
            <X className="h-5 w-5 text-slate-700" />
          ) : (
            <Menu className="h-5 w-5 text-slate-700" />
          )}
        </Button>
        <h1 className="ml-4 text-lg font-semibold text-slate-900">Dashboard</h1>
      </div>

      {/* Overlay untuk mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 w-64 h-screen bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Header/Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-slate-200">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="text-xl font-bold text-slate-900">Logo</span>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
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
                        ? "bg-blue-50 text-blue-600 shadow-sm"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.title}</span>
                  </button>
                );
              })}
            </nav>

            {/* Workspace Section */}
            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between px-2 mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Workspaces
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={createWorkspace.open}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-1">
                {workspaces.map((workspace) => {
                  const projects = getWorkspaceProjects(workspace.id);
                  const isExpanded = expandedWorkspaces.has(workspace.id);
                  const isSelected = selectedWorkspaceId === workspace.id;

                  return (
                    <div key={workspace.id}>
                      {/* Workspace Item */}
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0 hover:bg-slate-100"
                          onClick={() => toggleWorkspace(workspace.id)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-slate-600" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-slate-600" />
                          )}
                        </Button>
                        <button
                          onClick={() => handleWorkspaceClick(workspace.id)}
                          className={cn(
                            "flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-left",
                            isSelected
                              ? "bg-blue-50 text-blue-600"
                              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                          )}
                        >
                          <Folder className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate flex-1">{workspace.name}</span>
                          <span className={cn(
                            "text-xs px-1.5 py-0.5 rounded-full",
                            isSelected ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                          )}>
                            {projects.length}
                          </span>
                        </button>
                      </div>

                      {/* Projects List */}
                      {isExpanded && projects.length > 0 && (
                        <div className="ml-8 mt-1 space-y-1">
                          {projects.map((project) => (
                            <button
                              key={project.id}
                              onClick={() => handleProjectClick(project.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 text-left"
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

        {/* Logout Button - Fixed at Bottom */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 font-medium"
            onClick={() => onNavigate?.("login")}
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Create Workspace Dialog */}
      <CreateWorkspaceDialog
        isOpen={createWorkspace.isOpen}
        onClose={createWorkspace.close}
        onCreate={handleCreateWorkspace}
      />
    </>
  );
}