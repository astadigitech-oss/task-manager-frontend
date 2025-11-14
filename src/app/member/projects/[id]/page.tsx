"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import ProjectBoardLayout from "@/components/project/ProjectBoard";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const router = useRouter();
  
  // Unwrap params menggunakan React.use()
  const { id } = use(params);
  const projectId = id.toString();
  
  console.log("📄 Project ID:", projectId);
  
  const handleNavigate = (page: string) => {
    router.push(`/admin/${page}`);
  };

  return (
    <ProjectBoardLayout 
      projectId={projectId} 
      onNavigate={handleNavigate} 
    />
  );
}