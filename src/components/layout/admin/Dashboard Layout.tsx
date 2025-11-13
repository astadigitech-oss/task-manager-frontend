"use client";

import { useRouter, usePathname } from "next/navigation";
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
  SettingsIcon,
  Menu,
  Settings,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
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
    icon: SettingsIcon,
  },
];

export function Sidebar({
  currentPage,
  onNavigate,
}: SidebarProps) {
  // const router = useRouter();
  const pathname = usePathname();

  // === STATE dari DashboardLayout ===
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(
    new Set(["1"])
  );

  // === CONTEXT dan MODAL ===
  const {
    workspaces,
    getWorkspaceProjects,
    addWorkspace,
    selectedWorkspaceId,
    setSelectedWorkspaceId,
  } = useWorkspace();

  const { createWorkspace } = useModal();

  const toggleWorkspace = (workspaceId: string) => {
    const newExpanded = new Set(expandedWorkspaces);
    if (newExpanded.has(workspaceId)) {
      newExpanded.delete(workspaceId);
    } else {
      newExpanded.add(workspaceId);
    }
    setExpandedWorkspaces(newExpanded);
  };

  // === fallback navigation jika onNavigate tidak diberikan oleh parent ===
  // const defaultNavigate = (page: string, projectId?: string) => {
  //   // map page ke route, sesuaikan kalau struktur route-mu beda
  //   switch (page) {
  //     case "dashboard":
  //       router.push("/admin/dashboard");
  //       break;
  //     case "projects":
  //       router.push("/admin/projects");
  //       break;
  //     case "project-detail":
  //       if (projectId) router.push(`/admin/projects/${projectId}`);
  //       else router.push("/admin/projects");
  //       break;
  //     case "team":
  //       router.push("/admin/team");
  //       break;
  //     case "files":
  //       router.push("/admin/files");
  //       break;
  //     case "settings":
  //       router.push("/admin/settings");
  //       break;
  //     case "login":
  //     case "logout":
  //       router.push("/auth/login");
  //       break;
  //     default:
  //       // fallback: go to dashboard
  //       router.push("/admin/dashboard");
  //   }
  //   // close sidebar on mobile if provided via onClose handled elsewhere
  //   if (onClose) onClose();
  // };

  // const navigate = onNavigate ?? defaultNavigate;

  // === FUNCTION dari DashboardLayout ===

  const handleWorkspaceClick = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    if (onNavigate) {
      onNavigate("projects", undefined);
    }
  };

  const handleProjectClick = (projectId: string) => {
    if (onNavigate) {
      onNavigate("project-task", projectId);
    }
  };

  const handleCreateWorkspace = (workspace: {
    name: string;
    color: string;
    projectIds: string[];
  }) => {
    addWorkspace(workspace);
  };

  const handleMenuClick = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
      setIsSidebarOpen(false);
    }
  };

  // === Breadcrumb (biar tetap punya info posisi user) ===
  const breadcrumbItems = pathname
    .split("/")
    .filter(Boolean)
    .slice(1)
    .map((part, index, arr) => ({
      label: part.charAt(0).toUpperCase() + part.slice(1),
      href: "/" + arr.slice(0, index + 1).join("/"),
    }));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 flex items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <h1 className="ml-4 text-slate-900">Dashboard</h1>
      </div>
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 w-64 h-screen bg-gray-900 text-white flex flex-col p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 transform transition-transform duration-300",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}
      >


        {/* === LOGO / BRAND === */}
        <div className="hidden md:flex text-2xl font-bold mb-6 items-center gap-2">
          <div className="w-8 h-8 bg-white rounded"></div>
          Logo
        </div>

        {/* === NAVIGASI UTAMA === */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                currentPage === item.id
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </button>
          ))}

          {/* === WORKSPACE SECTION === */}
          <div className="mt-8 border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider">
                Workspaces
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={createWorkspace.open}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="space-y-1">
              {workspaces.map((workspace) => {
                const projects = getWorkspaceProjects(workspace.id);
                const isExpanded = expandedWorkspaces.has(workspace.id);

                return (
                  <div key={workspace.id}>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 flex-shrink-0"
                        onClick={() => toggleWorkspace(workspace.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <button
                        onClick={() => handleWorkspaceClick(workspace.id)}
                        className={cn(
                          "flex-1 flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors text-left",
                          selectedWorkspaceId === workspace.id
                            ? "bg-slate-100 text-slate-900"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        )}
                      >
                        <Folder className="h-4 w-4" />
                        <span className="truncate">{workspace.name}</span>
                        <span className="text-xs text-slate-500">
                          {projects.length}
                        </span>
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="ml-8 mt-1 space-y-1">
                        {projects.map((project) => (
                          <button
                            key={project.id}
                            onClick={() => handleProjectClick(project.id)}
                            className="w-full flex items-center gap-2 px-2 py-1 rounded text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                          >
                            <FolderKanban className="h-3.5 w-3.5" />
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

          {/* <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2 hover:text-blue-500",
              pathname?.includes("/dashboard") && "bg-gray-800"
            )}
            onClick={() => handleMenuClick("dashboard")}
          >
            <Home className="h-4 w-4" /> Dashboard
          </Button>

          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2 hover:text-blue-500",
              pathname?.includes("/projects") && "bg-gray-800"
            )}
            onClick={() => handleMenuClick("projects")}
          >
            <List className="h-4 w-4" /> Projects
          </Button>

          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2 hover:text-blue-500",
              pathname?.includes("/team") && "bg-gray-800"
            )}
            onClick={() => handleMenuClick("team")}
          >
            <Users className="h-4 w-4" /> Team
          </Button>

          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2 hover:text-blue-500",
              pathname?.includes("/files") && "bg-gray-800"
            )}
            onClick={() => handleMenuClick("files")}
          >
            <Folder className="h-4 w-4" /> Files
          </Button>

          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2 hover:text-blue-500",
              pathname?.includes("/settings") && "bg-gray-800"
            )}
            onClick={() => handleMenuClick("settings")}
          >
            <Settings className="h-4 w-4" /> Settings
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-red-400 hover:text-gray-500"
            onClick={() => handleMenuClick("login")}
          >
            <LogOut className="h-4 w-4" /> Log Out
          </Button> */}
        </nav>
        {/* User Profile / Settings */}
        <div className="p-4 border-t space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => onNavigate?.("login")}
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>

        {/* === FOOTER / BREADCRUMB ===
        <div className="mt-8 border-t border-gray-700 pt-3 text-xs text-gray-400">
          {breadcrumbItems.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-gray-500">You are here:</span>
              {breadcrumbItems.map((item, i) => (
                <div key={item.href} className="flex items-center gap-1">
                  <Link href={item.href} className="hover:text-blue-400 transition">
                    {item.label}
                  </Link>
                  {i < breadcrumbItems.length - 1 && <span>/</span>}
                </div>
              ))}
            </div>
          ) : (
            <p>Dashboard</p>
          )}
        </div> */}

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

      </aside>
      <CreateWorkspaceDialog
        isOpen={createWorkspace.isOpen}
        onClose={createWorkspace.close}
        onCreate={handleCreateWorkspace}
      />
    </div>
  );
}
