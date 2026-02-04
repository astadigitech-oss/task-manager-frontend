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
  const { user } = useAuthStore();
  const { selectedWorkspace, workspaces, isLoading } = useWorkspace();
  const [isInitialized, setIsInitialized] = useState(false);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (isLoading) {
      console.log("Waiting for workspaces to load...");
      return;
    }
    console.log("Workspaces loaded, marking as initialized");
    setIsInitialized(true);
  }, [isLoading]);

  const workspaceId = selectedWorkspace?.id ?? null;

  useEffect(() => {
    console.log("Provider State:", {
      userId: user?.id,
      userEmail: user?.email,
      userRole: user?.role,
      isLoading,
      isInitialized,
      selectedWorkspaceId: selectedWorkspace?.id,
      selectedWorkspaceName: selectedWorkspace?.name,
      totalWorkspaces: workspaces.length,
      workspacesList: workspaces.map((ws) => ({
        id: ws.id,
        name: ws.name,
        isSelected: ws.id === selectedWorkspace?.id,
      })),
      webSocketWorkspaceId: workspaceId,
      note: isAdmin && !workspaceId 
        ? "Admin - No workspace selected, WebSocket will not connect until workspace is selected from sidebar"
        : "Ready",
    });
  }, [isLoading, isInitialized, selectedWorkspace, workspaces, workspaceId, user, isAdmin]);

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
          {/* WebSocket will only connect if workspaceId is not null */}
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