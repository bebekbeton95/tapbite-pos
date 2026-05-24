import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";
import type { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith("/admin")) {
        const { data: session } = await betterFetch<typeof auth.$Infer.Session>(
            "/api/auth/get-session",
            { baseURL: request.nextUrl.origin, headers: { cookie: request.headers.get("cookie") || "" } }
        );
        if (!session) return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
