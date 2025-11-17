"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { Sidebar } from "@/components/layout/member/Sidebar";
import Header from "@/components/layout/member/Header";
import Footer from "@/components/layout/member/Footer";

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login");
    } else if (user?.role !== "member") {
      router.replace("/admin/dashboard"); // 🚫 kalau bukan member, lempar ke admin
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated) return null; // atau tampilkan loading skeleton

  return (
    <WorkspaceProvider>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        
        <Sidebar
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

        <div
          className={`
            flex flex-col min-h-screen transition-all duration-300
            ${sidebarOpen ? "ml-0" : "ml-0"} 
            md:ml-64
          `}
        >
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
          <Footer />
        </div>
      </div>
    </WorkspaceProvider>
  );
}
