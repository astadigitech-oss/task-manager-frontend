// app/member/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MemberSidebar } from "@/components/layout/member/Sidebar";
import Header from "@/components/layout/member/Header";
import Footer from "@/components/layout/member/Footer";
import { useAuthStore } from "@/store/useAuthStore";

export default function MemberLayout({ children }: { children: React.ReactNode }) {
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

    if (user.role !== "member") {
      router.replace("/admin/dashboard");
      return;
    }
  }, [mounted, isHydrated, isAuthenticated, user, router]);

  if (!mounted || !isHydrated || !isAuthenticated || !user) {
    return null;
  }

  return (
      <div className="min-h-screen bg-background text-foreground">
        <MemberSidebar
          currentPage="dashboard"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNavigate={(page: string, projectId?: string) => {
            if (page === "project-detail" && projectId) {
              router.push(`/member/projects/${projectId}`);
            } else {
              router.push(`/member/${page}`);
            }
          }}
        />

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className={`flex flex-col h-screen transition-all duration-300 md:ml-64`}>
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-hidden">{children}</main>
          <Footer />
        </div>
      </div>
  );
}
