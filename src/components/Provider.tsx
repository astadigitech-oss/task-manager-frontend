"use client";

import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <WorkspaceProvider>{children}</WorkspaceProvider>
    </ThemeProvider>
  );
}
