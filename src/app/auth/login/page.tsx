"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/useAuthStore"; // ⬅️ pastikan path sesuai

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuthStore();

  const [role, setRole] = useState<"admin" | "member">("member");
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  // Kalau sudah login, langsung ke dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(`/${user?.role ?? role}/dashboard`);
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    if (!form.username || !form.password) return alert("Isi semua field dulu!");

    setLoading(true);
    await login(form.username, form.password);
    setLoading(false);
    router.push(`/${role}/dashboard`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow w-[400px]">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

        <div className="space-y-4">
          <div>
            <Label>Username</Label>
            <Input
              placeholder="username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div className="flex gap-2 justify-center my-4">
            <Button
              variant={role === "admin" ? "default" : "outline"}
              onClick={() => setRole("admin")}
            >
              Admin
            </Button>
            <Button
              variant={role === "member" ? "default" : "outline"}
              onClick={() => setRole("member")}
            >
              Member
            </Button>
          </div>

          <Button className="w-full" onClick={handleLogin} disabled={loading}>
            {loading ? "Logging in..." : `Login as ${role}`}
          </Button>

          <p className="text-center text-sm mt-4">
            Don’t have an account?{" "}
            <a href="/auth/register" className="text-blue-600 hover:underline">
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
