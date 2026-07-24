"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/layout/management/Footer";
import Header from "@/components/layout/management/Header";
import { ManagementSidebar } from "@/components/layout/management/Sidebar";
import { useAuthStore } from "@/store/useAuthStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePathname } from "next/navigation";

export default function ManagementLayout({
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

    // Sidebar width: 256px (w-64) expanded, 64px (w-16) collapsed
    const sidebarWidth = sidebarCollapsed ? "lg:ml-16" : "lg:ml-64";

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!mounted || !isHydrated) return;

        if (!isAuthenticated || !user) {
            router.replace("/auth/login");
            return;
        }

        // Dummy: hanya izinkan role management
        if (user.role?.toLowerCase() !== "management") {
            router.replace("/member/dashboard");
            return;
        }
    }, [mounted, isHydrated, isAuthenticated, user, router]);

    if (!mounted || !isHydrated || !isAuthenticated || !user) {
        return null;
    }

    // Dummy: gunakan komponen management, bisa diganti jika sudah ada komponen management
    return (
        <main className="w-screen h-screen flex flex-col bg-background text-foreground overflow-hidden">
            <div className={`transition-all duration-300 ${sidebarWidth}`}>
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            </div>

            <div className={`flex flex-1 overflow-hidden transition-all duration-300`}>
                <ManagementSidebar
                    currentPage="dashboard"
                    isOpen={sidebarOpen}
                    isCollapsed={sidebarCollapsed}
                    onClose={() => setSidebarOpen(false)}
                    onOpen={() => setSidebarOpen(true)}
                    onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
                    onNavigate={(page: string, projectId?: unknown) => {
                        setSidebarOpen(false);
                        if (page === "project-detail" && projectId) {
                            router.push(`/management/projects/${projectId}`);
                        } else {
                            router.push(`/management/${page}`);
                        }
                    }}
                />
                <div className="flex flex-col flex-1 overflow-hidden">
                    <ScrollArea className="flex-1 h-full">
                        <div className="flex flex-col min-h-full">
                            <main className="flex-1 p-6">{children}</main>
                            <Footer />
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </main>
    );
}