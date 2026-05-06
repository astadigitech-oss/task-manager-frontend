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
    const isManagementPage = pathname.startsWith("/management");


    if (!token && (isAdminPage || isMemberPage || isManagementPage)) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }


    if (token && isAuthPage) {
        let dashboard = "/member/dashboard";
        if (role === "admin") dashboard = "/admin/dashboard";
        else if (role === "management") dashboard = "/management/dashboard";
        return NextResponse.redirect(new URL(dashboard, req.url));
    }

    if (isAdminPage && role !== "admin") {
        // Jika management, redirect ke dashboard management
        if (role === "management") {
            return NextResponse.redirect(new URL("/management/dashboard", req.url));
        }
        return NextResponse.redirect(new URL("/member/dashboard", req.url));
    }

    if (isMemberPage && role !== "member") {
        if (role === "management") {
            return NextResponse.redirect(new URL("/management/dashboard", req.url));
        }
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    if (isManagementPage && role !== "management") {
        // Jika admin, redirect ke dashboard admin
        if (role === "admin") {
            return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        }
        return NextResponse.redirect(new URL("/member/dashboard", req.url));
    }
    return NextResponse.next();
}
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|logo_putih.png).*)',
    ],
};
