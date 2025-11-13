"use client";

import { WorkspaceProvider } from "@/context/WorkspaceContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <WorkspaceProvider>{children}</WorkspaceProvider>;
}
