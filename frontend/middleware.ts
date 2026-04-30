import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes and Next.js internals — the rewrite proxy needs trailing
  // slashes on /api/v1/ paths for Django; don't touch them here.
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/")
  ) {
    return NextResponse.next();
  }

  // Redirect trailing slash → no trailing slash (308 permanent).
  // This fixes the "Alternate page with proper canonical tag" GSC issue
  // caused by skipTrailingSlashRedirect being enabled for the API proxy.
  if (pathname !== "/" && pathname.endsWith("/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(0, -1);
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match everything except static files, images, and favicon
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|logo|opengraph-image|sitemap.xml|robots.txt).*)",
  ],
};
