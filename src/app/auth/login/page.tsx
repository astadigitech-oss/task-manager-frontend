"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/useAuthStore";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function LoginPage() {
    const router = useRouter();
    const { login, isAuthenticated, user } = useAuthStore();

    const [role, setRole] = useState<"admin" | "member">("member");
    const [form, setForm] = useState({ username: "", password: "" });
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

    useEffect(() => {
        if (isAuthenticated && user) {
            // Redirect based on actual user role
            router.replace(`/${user.role}/dashboard`);
        }
    }, [isAuthenticated, user, router]);

    const handleLogin = async () => {
        if (!form.username || !form.password) {
            return alert("Isi semua field dulu!");
        }

        setLoading(true);
        try {
            // ✅ Pass role yang dipilih ke login function
            await login(form.username, form.password, role);
        } catch (error) {
            console.error("Login error:", error);
            alert("Login gagal!");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Tambah handler untuk Enter key
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleLogin();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-[400px]">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Login</h1>

                <div className="space-y-4">
                    {/* Username */}
                    <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            placeholder="Enter your username"
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                            onKeyPress={handleKeyPress}
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
                            onKeyPress={handleKeyPress}
                        />
                    </div>

                    {/* Role Selection */}
                    <div>
                        <Label className="mb-2 block">Login as:</Label>
                        <div className="flex gap-2 justify-center">
                            <Button
                                type="button"
                                variant={role === "admin" ? "default" : "outline"}
                                onClick={() => setRole("admin")}
                                className={role === "admin" ? "bg-blue-600 hover:bg-blue-700" : ""}
                            >
                                👑 Admin
                            </Button>
                            <Button
                                type="button"
                                variant={role === "member" ? "default" : "outline"}
                                onClick={() => setRole("member")}
                                className={role === "member" ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                                👤 Member
                            </Button>
                        </div>
                    </div>

                    {/* Login Button */}
                    <Button
                        className="w-full mt-6"
                        onClick={handleLogin}
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : `Login as ${role}`}
                    </Button>

                    {/* Register Link */}
                    <p className="text-center text-sm mt-4 text-gray-600">
                        Don't have an account?{" "}
                        <a href="/auth/register" className="text-blue-600 hover:underline font-medium">
                            Register
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}