// Haq Dilao — Middleware for route protection

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, verifyAdminToken } from "./lib/auth";

const PUBLIC_PATHS = ["/", "/register", "/login", "/api/auth"];
const ADMIN_PATHS = ["/admin", "/api/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Check admin paths
  if (ADMIN_PATHS.some(p => pathname === p || pathname.startsWith(p + "/"))) {
    const adminToken = request.cookies.get("haq_dilao_admin")?.value;
    if (!adminToken) {
      const url = new URL("/admin", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    const admin = await verifyAdminToken(adminToken);
    if (!admin) {
      const url = new URL("/admin", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // Check citizen paths (dashboard, schemes, applications, notifications, profile)
  const citizenPaths = ["/dashboard", "/schemes", "/applications", "/notifications", "/profile"];
  if (citizenPaths.some(p => pathname === p || pathname.startsWith(p + "/"))) {
    const sessionToken = request.cookies.get("haq_dilao_session")?.value;
    if (!sessionToken) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    const session = await verifySessionToken(sessionToken);
    if (!session) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/schemes/:path*",
    "/applications/:path*",
    "/notifications/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};