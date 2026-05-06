"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { getFilteredMenuItems } from "@/components/shared/sidebarConfig";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Role } from "@/types/ui/user";

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

export function ManagementSidebar({
  isOpen,
  isCollapsed = false,
  onOpen,
  onClose,
  onToggleCollapse,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();

  const role: Role = "management";

  const menuItems = getFilteredMenuItems(role);

  const isMenuActive = (menuId: string) => {
    const current = pathname.split("/").filter(Boolean).pop() || "dashboard";
    return current === menuId;
  };

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
    </TooltipProvider>
  );
}