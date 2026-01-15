"use client";

import { useEffect, useState } from "react";
import { useLogin } from "@/hooks/api/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/components/providers/ThemeProvider";
import { showErrorToast } from "@/lib/helpers/toast-helpers";

export default function LoginPage() {
    const [role, setRole] = useState<"admin" | "member">("member");
    const [form, setForm] = useState({ email: "", password: "" });

    // State untuk error per field
    const [errors, setErrors] = useState({
        email: "",
        password: "",
    });

    const { mutate: login, isPending } = useLogin();
    const { setTheme } = useTheme();

    useEffect(() => {
        const previousTheme = localStorage.getItem("app-theme");
        setTheme("light");
        return () => {
            if (previousTheme) setTheme(previousTheme as "light" | "dark");
        };
    }, [setTheme]);

    // Validasi form
    const validateForm = () => {
        const newErrors = {
            email: "",
            password: "",
        };
        let isValid = true;

        // Validasi email
        if (!form.email.trim()) {
            newErrors.email = "Email wajib diisi";
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = "Format email tidak valid";
            isValid = false;
        }
        
        // Validasi password
        if (!form.password) {
            newErrors.password = "Password wajib diisi";
            isValid = false;
        } else if (form.password.length < 6) {
            newErrors.password = "Password minimal 6 karakter";
            isValid = false;
        }
        setErrors(newErrors);
        return isValid;
    };
    const handleLogin = () => {
        setErrors({ email: "", password: "" });
        // Validasi frontend
        if (!validateForm()) {
            showErrorToast("Mohon periksa kembali form Anda");
            return;
        }

        login({ email: form.email, password: form.password, role });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-112.5">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
                    Login
                </h1>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={(e) => {
                                setForm({ ...form, email: e.target.value });
                                if (errors.email) {
                                    setErrors({ ...errors, email: "" });
                                }
                            }}
                            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                            className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={(e) => {
                                setForm({ ...form, password: e.target.value });
                                if (errors.password) {
                                    setErrors({ ...errors, password: "" });
                                }
                            }}
                            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                            className={errors.password ? "border-red-500" : ""}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label className="mb-2 block">Login as:</Label>
                        <div className="flex gap-2 justify-center">
                            <Button
                                type="button"
                                variant={role === "admin" ? "default" : "outline"}
                                onClick={() => setRole("admin")}
                                className={
                                    role === "admin"
                                        ? "bg-blue-600 hover:bg-blue-700"
                                        : ""
                                }
                            >
                                Admin
                            </Button>
                            <Button
                                type="button"
                                variant={role === "member" ? "default" : "outline"}
                                onClick={() => setRole("member")}
                                className={
                                    role === "member"
                                        ? "bg-green-600 hover:bg-green-700"
                                        : ""
                                }
                            > Member
                            </Button>
                        </div>
                    </div>

                    <Button
                        className="w-full mt-6"
                        onClick={handleLogin}
                        disabled={isPending}
                    >
                        {isPending ? "Logging in..." : `Login as ${role}`}
                    </Button>
                </div>
            </div>
        </div>
    );
}