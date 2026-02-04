import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            ...(process.env.NODE_ENV
                ? { duplex: "half" }
                : {}),
        });

        const data = await res.json();

        return NextResponse.json(data, { status: res.status });
    } catch (err) {
        return NextResponse.json(
            { message: "Internal server error", error: String(err) },
            { status: 500 }
        );
    }
}
