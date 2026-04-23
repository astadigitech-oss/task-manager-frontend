'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { useLogin } from '@/hooks/api/useAuth';
import { useTheme } from '@/components/providers/ThemeProvider';
import { showErrorToast } from '@/lib/helpers/toast-helpers';

export function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({ email: '', password: '' });
    const [role, setRole] = useState<'admin' | 'member'>('member');

    const { mutate: login, isPending } = useLogin();
    const { setTheme } = useTheme();

    useEffect(() => {
    const previousTheme = localStorage.getItem('app-theme');
    
    // Hanya set jika memang belum 'light'
    if (previousTheme !== 'light') {
        setTheme('light');
    }

    return () => {
        if (previousTheme && previousTheme !== 'light') {
            setTheme(previousTheme as 'light' | 'dark');
        }
    };
}, []); // Hapus setTheme dari dependency array

    const validateForm = () => {
        const newErrors = { email: '', password: '' };
        let isValid = true;

        if (!form.email.trim()) {
            newErrors.email = 'Email wajib diisi';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = 'Format email tidak valid';
            isValid = false;
        }

        if (!form.password) {
            newErrors.password = 'Password wajib diisi';
            isValid = false;
        } else if (form.password.length < 6) {
            newErrors.password = 'Password minimal 6 karakter';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleLogin = (e?: React.FormEvent) => {
        e?.preventDefault();
        setErrors({ email: '', password: '' });

        if (!validateForm()) {
            showErrorToast('Mohon periksa kembali form Anda');
            return;
        }

        login({ email: form.email, password: form.password, role });
    };

    return (
        <Card className="w-full max-w-md bg-gray-500 shadow-md border border-gray-400">
            <CardHeader className="space-y-1">
                <CardTitle className="text-3xl text-center text-white">Welcome back</CardTitle>
                <CardDescription className="text-center text-white/80">
                    Enter Mail and password to sign in to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                    {/* Email */}
                    <div className="space-y-1">
                        <Label htmlFor="email" className="text-white">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={form.email}
                            onChange={(e) => {
                                setForm({ ...form, email: e.target.value });
                                if (errors.email) setErrors({ ...errors, email: '' });
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            className={`bg-white/90 backdrop-blur-sm border-white/40 focus:border-white focus:ring-white/50 placeholder:text-gray-400 ${errors.email ? 'border-red-500' : ''}`}
                        />
                        {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                        <Label htmlFor="password" className="text-white">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={(e) => {
                                    setForm({ ...form, password: e.target.value });
                                    if (errors.password) setErrors({ ...errors, password: '' });
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                className={`bg-white/90 backdrop-blur-sm border-white/40 focus:border-white focus:ring-white/50 pr-10 placeholder:text-gray-400 ${errors.password ? 'border-red-500' : ''}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-sm text-red-400">{errors.password}</p>}
                    </div>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/30" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                        </div>
                    </div>

                    {/* Role Selector */}
                    <div className="grid grid-cols-2 gap-3 p-2">
                        <Button
                            type="button"
                            variant={role === 'member' ? 'default' : 'outline'}
                            onClick={() => setRole('member')}
                            className={role === 'member'
                                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                : 'bg-white/90 backdrop-blur-sm border-white/40 hover:bg-white text-gray-700'}
                        >
                            Member
                        </Button>
                        <Button
                            type="button"
                            variant={role === 'admin' ? 'default' : 'outline'}
                            onClick={() => setRole('admin')}
                            className={role === 'admin'
                                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                : 'bg-white/90 backdrop-blur-sm border-white/40 hover:bg-white text-gray-700'}
                        >
                            Admin
                        </Button>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                        disabled={isPending}
                    >
                        {isPending ? 'Signing in...' : `Sign in as ${role}`}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-wrap items-center justify-center">

            </CardFooter>
        </Card>
    );
}