"use client";

import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <WorkspaceProvider>
        {children}
        <Toaster />
      </WorkspaceProvider>
    </ThemeProvider>
  );
}
