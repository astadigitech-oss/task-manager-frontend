"use client";

import React, { useEffect, useState } from "react";
import { WorkspaceProvider, useWorkspace } from "@/context/WorkspaceContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "./providers/QueryProvider";
import { ProjectProvider } from "@/context/ProjectContext";
import { TaskProvider } from "@/context/TaskContext";
import { UsersProvider } from "@/context/UserContext";
import { OnlineUserProvider } from "@/context/OnlineUserContext";
import { useAuthStore } from "@/store/useAuthStore";

const ToasterComponent = () => (
  <Toaster
    position="top-right"
    toastOptions={{ className: "z-[9999]", style: { zIndex: 9999 } }}
    richColors
    closeButton
    duration={3000}
  />
);

// ─── Khusus Management: tidak pakai useWorkspace sama sekali ───────────────────
function ManagementProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToasterComponent />
    </>
  );
}

// ─── Non-Management: pakai useWorkspace + semua provider ──────────────────────
function DefaultProviders({ children }: { children: React.ReactNode }) {
  const { user, defaultWorkspaceId } = useAuthStore();
  const { selectedWorkspace, isLoading } = useWorkspace(); // ← aman, ada di dalam WorkspaceProvider
  const [isInitialized, setIsInitialized] = useState(false);

  const isAdmin = user?.role === "admin";
  const workspaceId = selectedWorkspace?.id ?? null;

  useEffect(() => {
    if (isLoading) return;
    setIsInitialized(true);
  }, [isLoading]);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Initializing workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <ProjectProvider>
      <TaskProvider>
        <UsersProvider>
          <OnlineUserProvider workspaceId={workspaceId}>
            {children}
            <ToasterComponent />
          </OnlineUserProvider>
        </UsersProvider>
      </TaskProvider>
    </ProjectProvider>
  );
}

// ─── Router: pilih provider berdasarkan role ──────────────────────────────────
function ProvidersRouter({ children }: { children: React.ReactNode }) {
  const { user, isHydrated } = useAuthStore();

  // Belum hydrated → tampilkan loading dulu, jangan render provider apapun
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  const isManagement = String(user?.role).toLowerCase() === 'management';

  if (isManagement) {
    // Management: skip WorkspaceProvider & semua provider API
    return <ManagementProviders>{children}</ManagementProviders>;
  }

  // Non-management: pakai WorkspaceProvider + DefaultProviders
  return (
    <WorkspaceProvider>
      <DefaultProviders>{children}</DefaultProviders>
    </WorkspaceProvider>
  );
}

// ─── Root Provider ────────────────────────────────────────────────────────────
export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <ProvidersRouter>{children}</ProvidersRouter>
      </ThemeProvider>
    </QueryProvider>
  );
}