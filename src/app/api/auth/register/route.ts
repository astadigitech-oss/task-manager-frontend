import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { role, ...cleanBody } = body;

        const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cleanBody),
            ...(process.env.NODE_ENV === "development"
                ? { duplex: "half" }
                : {}),
        });
        const data = await res.json();
        if (!res.ok) {
            return NextResponse.json(
                { 
                    message: data.message || "Registrasi gagal",
                    error: data.error || "Bad Request"
                },
                { status: res.status }
            );
        }
        return NextResponse.json(data, { status: res.status });
    } catch (err) {
        return NextResponse.json(
            { 
                message: "Internal server error", 
                error: String(err) 
            },
            { status: 500 }
        );
    }
}