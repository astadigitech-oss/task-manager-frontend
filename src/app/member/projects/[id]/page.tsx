// app/member/projects/[id]/page.tsx

"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import ProjectBoardLayout from "@/components/project/ProjectBoard";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default function MemberProjectPage({ params }: ProjectPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const projectId = id.toString();
  
  const handleNavigate = (page: string) => {
    router.push(`/member/${page}`);
  };

  return (
    <ProjectBoardLayout 
      projectId={projectId} 
      onNavigate={handleNavigate}
      mode="member" // ← Pass mode
    />
  );
}