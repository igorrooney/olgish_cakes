import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminAuthenticated } from "./lib/admin-auth";

export async function middleware(request: NextRequest) {
  // Check if this is an admin API route that needs protection
  if (request.nextUrl.pathname.startsWith("/api/admin") && 
      !request.nextUrl.pathname.startsWith("/api/admin/auth") &&
      !request.nextUrl.pathname.startsWith("/api/admin/logout") &&
      !request.nextUrl.pathname.startsWith("/api/admin/earnings")) {
    
    const isAuthenticated = await isAdminAuthenticated(request);
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  const response = NextResponse.next();

  // Add security headers
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");

  // Add caching headers with better cache control
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/static")
  ) {
    response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  } else if (request.nextUrl.pathname.startsWith("/api")) {
    // API routes should not be cached to ensure fresh data
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  } else if (request.nextUrl.pathname.startsWith("/admin")) {
    // Admin pages should not be cached
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
  } else {
    // Regular pages with shorter cache time for better data freshness
    response.headers.set("Cache-Control", "public, max-age=60, must-revalidate");
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
