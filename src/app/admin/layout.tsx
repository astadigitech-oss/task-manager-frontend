"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/layout/admin/Footer";
import Header from "@/components/layout/admin/Header";
import { AdminSidebar } from "@/components/layout/admin/Sidebar";
import { useAuthStore } from "@/store/useAuthStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const isProjectBoard = pathname?.includes("/admin/projects/");

  // Sidebar width: 256px (w-64) expanded, 64px (w-16) collapsed
  const sidebarWidth = sidebarCollapsed ? "lg:ml-16" : "lg:ml-64";

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !isHydrated) return;

    if (!isAuthenticated || !user) {
      router.replace("/auth/login");
      return;
    }

    if (user.role !== "admin") {
      router.replace("/member/dashboard");
      return;
    }
  }, [mounted, isHydrated, isAuthenticated, user, router]);

  if (!mounted || !isHydrated || !isAuthenticated || !user) {
    return null;
  }

  return (
    <main className="w-screen h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <div className={`transition-all duration-300 ${sidebarWidth}`}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      </div>

      <div className={`flex flex-1 overflow-hidden transition-all duration-300 ${sidebarWidth}`}>
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

        <div className="flex flex-col flex-1 overflow-hidden">
          {isProjectBoard ? (
            <div className="flex-1 overflow-hidden">
              {children}
            </div>
          ) : (
            <ScrollArea className="flex-1 h-full">
              <div className="flex flex-col min-h-full">
                <main className="flex-1 p-6">{children}</main>
                <Footer />
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </main>
  );
}