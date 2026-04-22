import { LoginForm } from "@/components/shared/login_form/login_form";

export default function LoginPage() {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-linear-to-br from-gray-300 via-gray-400 to-gray-500">
            {/* Animated gradient orbs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
            <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />

            {/* Content */}
            <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
                <LoginForm />
            </div>
        </div>
    );
}