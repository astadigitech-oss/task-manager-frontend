"use client";

import { WorkspaceProvider } from "../../context/WorkspaceContext";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      {children}
    </WorkspaceProvider>
  );
}
