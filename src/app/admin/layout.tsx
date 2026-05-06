"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/layout/admin/Footer";
import Header from "@/components/layout/admin/Header";
import { AdminSidebar } from "@/components/layout/admin/Sidebar";
import { useAuthStore } from "@/store/useAuthStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const isProjectBoard = pathname?.includes("/admin/projects/");

  // Hanya berlaku di lg ke atas (sidebar permanen), mobile pakai overlay
  const contentMargin = sidebarCollapsed ? "lg:ml-16" : "lg:ml-64";

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !isHydrated) return;
    if (!isAuthenticated || !user) { router.replace("/auth/login"); return; }
    if (user.role !== "admin") { router.replace("/member/dashboard"); return; }
  }, [mounted, isHydrated, isAuthenticated, user, router]);

  if (!mounted || !isHydrated || !isAuthenticated || !user) return null;

  return (
    <div className="w-screen h-screen flex bg-background text-foreground overflow-hidden">
      {/* Sidebar — fixed, di luar flow normal */}
      <AdminSidebar
        currentPage="dashboard"
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onOpen={() => setSidebarOpen(true)}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onNavigate={(page: string, projectId?: unknown) => {
          setSidebarOpen(false);
          if (page === "project-detail" && projectId) {
            router.push(`/admin/projects/${projectId}`);
          } else {
            router.push(`/admin/${page}`);
          }
        }}
      />

      {/* Overlay backdrop untuk mobile saat sidebar terbuka */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content area — bergeser sesuai sidebar di lg+ */}
      <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${contentMargin}`}>
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page content */}
        <div className="flex-1 overflow-hidden">
          {isProjectBoard ? (
            <div className="h-full overflow-hidden">
              {children}
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="flex flex-col min-h-full">
                <main className="flex-1 p-4 sm:p-6">{children}</main>
                <Footer />
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}