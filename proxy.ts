import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminAuthenticated } from "./lib/admin-auth";

export async function proxy(request: NextRequest) {
  // Force HTTPS redirect for all HTTP requests (except localhost in development)
  const isLocalhost = request.nextUrl.hostname === "localhost" || request.nextUrl.hostname === "127.0.0.1";
  const isDevelopment = process.env.NODE_ENV === "development";
  
  if (
    !isLocalhost && // Skip HTTPS redirect for localhost
    (request.headers.get("x-forwarded-proto") === "http" ||
    (!request.headers.get("x-forwarded-proto") && request.url.startsWith("http://")))
  ) {
    const httpsUrl = request.url.replace("http://", "https://");
    return NextResponse.redirect(httpsUrl, 301);
  }

  // Check if this is an admin API route that needs protection
  if (request.nextUrl.pathname.startsWith("/api/admin") && 
      !request.nextUrl.pathname.startsWith("/api/admin/auth") &&
      !request.nextUrl.pathname.startsWith("/api/admin/logout")) {
    
    const isAuthenticated = await isAdminAuthenticated(request);
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  }
  const response = NextResponse.next();

  // Add security headers (skip HSTS for localhost)
  response.headers.set("X-DNS-Prefetch-Control", "on");
  if (!isLocalhost) {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
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
