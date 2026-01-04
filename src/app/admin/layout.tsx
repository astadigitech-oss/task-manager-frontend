// app/admin/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/layout/admin/Footer";
import Header from "@/components/layout/admin/Header";
import { AdminSidebar } from "@/components/layout/admin/Sidebar";
import { useAuthStore } from "@/store/useAuthStore";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

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
    <div className="min-h-screen bg-background text-foreground">
      <AdminSidebar
        currentPage="dashboard"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpen={() => setSidebarOpen(true)}
        onNavigate={(page: string, projectId?: unknown) => {
          setSidebarOpen(false);

          if (page === "project-detail" && projectId) {
            router.push(`/admin/projects/${projectId}`);
          } else {
            router.push(`/admin/${page}`);
          }
        }}
      />

      <div className="flex flex-col h-screen transition-all duration-300 lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-hidden">{children}</main>
        <Footer />
      </div>
    </div>
  );
}