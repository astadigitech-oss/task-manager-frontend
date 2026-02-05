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

function ProvidersWithWorkspace({ children }: { children: React.ReactNode }) {
  const { user, defaultWorkspaceId } = useAuthStore();
  const { selectedWorkspace, workspaces, isLoading } = useWorkspace();
  const [isInitialized, setIsInitialized] = useState(false);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (isLoading) {
      return;
    }
    
    setIsInitialized(true);
  }, [isLoading]);

  const workspaceId = selectedWorkspace?.id ?? null;

  useEffect(() => {
  }, [
    isLoading, 
    isInitialized, 
    selectedWorkspace, 
    workspaces, 
    workspaceId, 
    user, 
    defaultWorkspaceId,
    isAdmin
  ]);

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
            <Toaster
              position="top-right"
              toastOptions={{
                className: "z-[9999]",
                style: {
                  zIndex: 9999,
                },
              }}
              richColors
              closeButton
              duration={3000}
            />
          </OnlineUserProvider>
        </UsersProvider>
      </TaskProvider>
    </ProjectProvider>
  );
}

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <WorkspaceProvider>
          <ProvidersWithWorkspace>{children}</ProvidersWithWorkspace>
        </WorkspaceProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}