"use client";

import React from "react";
import { WorkspaceProvider, useWorkspace } from "@/context/WorkspaceContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "./providers/QueryProvider";
import { ProjectProvider } from "@/context/ProjectContext";
import { TaskProvider } from "@/context/TaskContext";
import { UsersProvider } from "@/context/UserContext";
import { OnlineUserProvider } from "@/context/OnlineUserContext";

function ProvidersWithWorkspace({ children }: { children: React.ReactNode }) {
  const { selectedWorkspace, workspaces, setSelectedWorkspaceId } = useWorkspace();
  

  React.useEffect(() => {
    if (!selectedWorkspace && workspaces.length > 0) {
      setSelectedWorkspaceId(workspaces[0].id);
    }
  }, [selectedWorkspace, workspaces, setSelectedWorkspaceId]);
  
  const workspaceId = selectedWorkspace?.id ?? workspaces[0]?.id ?? 1;
  
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
          <ProvidersWithWorkspace>
            {children}
          </ProvidersWithWorkspace>
        </WorkspaceProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}