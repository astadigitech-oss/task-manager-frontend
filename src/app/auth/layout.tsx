"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

useEffect(() => {
  if (!mounted || !isHydrated) return;

  if (isAuthenticated && user) {
    // Normalize role untuk redirect
    const role = user.role?.toLowerCase();
    router.replace(`/${role}/dashboard`);
  }
}, [mounted, isHydrated, isAuthenticated, user, router]);

  return (
    <div>
      <div className="w-full">{children}</div>
    </div>
  );
}
