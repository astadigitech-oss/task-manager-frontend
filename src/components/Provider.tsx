"use client";

import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "./providers/QueryProvider";
import { ProjectProvider } from "@/context/ProjectContext";
import { TaskProvider } from "@/context/TaskContext";
import { UsersProvider } from "@/context/UserContext";
import { OnlineUserProvider } from "@/context/OnlineUserContext";

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <ProjectProvider>
          <WorkspaceProvider>
            <TaskProvider>
              <UsersProvider>
                <OnlineUserProvider>
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
          </WorkspaceProvider>
        </ProjectProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
