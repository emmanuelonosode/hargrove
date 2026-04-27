import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  // ── Auth guards ─────────────────────────────────────────────────────────
  if (pathname.startsWith("/portal") && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if ((pathname === "/login" || pathname === "/register") && token) {
    return NextResponse.redirect(new URL("/portal/profile", request.url));
  }

  // ── Canonical trailing-slash redirect ───────────────────────────────────
  // next.config.ts sets `skipTrailingSlashRedirect: true` so Django receives
  // POST requests with a trailing slash (required). Side-effect: HTML pages
  // like /careers/ are served alongside /careers, causing Google to flag them
  // as "Alternate page with proper canonical tag". Fix: redirect path/ → path
  // for every non-API, non-static HTML request.
  if (
    pathname !== "/" &&
    pathname.endsWith("/") &&
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/_next/") &&
    !pathname.includes(".")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(0, -1);
    return NextResponse.redirect(url, { status: 301 });
  }

  const response = NextResponse.next();

  // Portal pages: authoritative noindex via HTTP header (layout is "use client" so metadata export isn't possible)
  if (pathname.startsWith("/portal")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  matcher: [
    // Auth guard paths + all HTML pages for trailing-slash redirect
    // Exclude Next.js static chunks and image optimisation endpoint
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
