"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/useAuthStore";
import { divisionConfig, type Division } from "@/types";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [form, setForm] = useState({ 
    username: "", 
    email: "", 
    password: "",
    division: "frontend" as Division
  });
  const [loading, setLoading] = useState(false);

  const { setTheme } = useTheme();
  
    useEffect(() => {
      setTheme("light");
    }, [setTheme]);

    useEffect(() => {
  const previousTheme = localStorage.getItem("app-theme");
  setTheme("light");
  return () => {
    // restore theme sebelumnya saat unmount
    if (previousTheme) setTheme(previousTheme as "light" | "dark");
  };
}, [setTheme]);

  const handleRegister = async () => {
    if (!form.username || !form.email || !form.password) {
      return alert("Semua field wajib diisi!");
    }

    setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.division);
      
      alert("Registrasi berhasil! Anda sudah login.");
      router.push("/member/dashboard");
    } catch (err) {
      console.error(err);
      alert("Gagal register, coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-[450px]">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Register</h1>
        
        <div className="space-y-4">
          {/* Username */}
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {/* Division Selector */}
          {/* <div>
            <Label htmlFor="division">Division</Label>
            <Select 
              value={form.division} 
              onValueChange={(value: string) => setForm({ ...form, division: value as Division })}
            >
              <SelectTrigger id="division">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(divisionConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <span>{config.emoji}</span>
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}

          {/* Register Button */}
          <Button 
            className="w-full mt-6" 
            onClick={handleRegister} 
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </Button>

          {/* Login Link */}
          <p className="text-center text-sm mt-4 text-gray-600">
            Already have an account?{" "}
            <a href="/auth/login" className="text-blue-600 hover:underline font-medium">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}