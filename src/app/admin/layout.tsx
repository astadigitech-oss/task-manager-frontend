"use client";

import { useState } from "react"
import Footer from "@/components/layout/admin/Footer"
import Header from "@/components/layout/admin/Header"
import { Sidebar } from "@/components/layout/admin/Sidebar"
import { WorkspaceProvider } from "@/context/WorkspaceContext"
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login");
    } else if (user?.role !== "admin") {
      router.replace("/member/dashboard"); // redirect kalau bukan admin
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated) return null; // atau tampilkan loading skeleton

  return (
    <WorkspaceProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Sidebar
          currentPage="dashboard"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNavigate={(page: string, projectId: any) => {
            console.log("navigate", page, projectId);
            if (page === "project-detail" && projectId) {
              router.push(`/admin/projects/${projectId}`);
            } else {
              router.push(`/admin/${page}`);
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
  )
}
