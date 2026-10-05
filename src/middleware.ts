import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = new Set([
  "/",
  "/pricing",
  "/login",
  "/register",
  "/forgot-password",
  "/privacy",
  "/terms",
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow next internals, static files, images, and api routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("tuyul_tracker_session");
  const isAuthenticated = Boolean(sessionCookie?.value);

  // 2. Redirect authenticated users away from auth pages to dashboard
  if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // 3. Allow all public marketing and auth paths
  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // 4. Protect all other paths (dashboard, tracker, accounts, etc.)
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
