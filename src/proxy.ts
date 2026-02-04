import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (pathname.startsWith('/api/')) {
        return NextResponse.next();
    }
    const token = req.cookies.get("token")?.value || null;
    const role = token ? req.cookies.get("role")?.value : null;

    const isAuthPage = pathname.startsWith("/auth");
    const isAdminPage = pathname.startsWith("/admin");
    const isMemberPage = pathname.startsWith("/member");

    if (!token && (isAdminPage || isMemberPage)) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    if (token && isAuthPage) {
        return NextResponse.redirect(
            new URL(role === "admin" ? "/admin/dashboard" : "/member/dashboard", req.url)
        );
    }

    if (isAdminPage && role !== "admin") {
        return NextResponse.redirect(new URL("/member/dashboard", req.url));
    }

    if (isMemberPage && role !== "member") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    
    return NextResponse.next();
}
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|logo_putih.png).*)',
    ],
};
