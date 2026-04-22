import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    // HSTS: 1 year, include subdomains — enable only in production with HTTPS
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js inline scripts + scripts from same origin
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Styles: same origin + inline (Tailwind injects inline styles at runtime)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Images: same origin, Cloudinary, Unsplash
      "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://images.invitationhomes.com https://maps.gstatic.com https://maps.googleapis.com https://*.tile.openstreetmap.org https://unpkg.com",
      // API connections: same origin + backend API
      "connect-src 'self' https://admin.haskerrealtygroup.com http://localhost:8000 http://localhost:3000 https://*.tile.openstreetmap.org",
      // Media
      "media-src 'self'",
      // Iframes: Google Maps embed + virtual tour providers
      "frame-src https://maps.google.com https://www.google.com https://www.insidemaps.com https://insidemap.app https://*.insidemaps.com https://www.zillow.com https://my.matterport.com https://*.matterport.com https://*.tours.com https://*.kuula.co https://kuula.co https://*.roundme.com https://*.panoraven.com https://*.viewstl.com https://*.immoviewer.com https://*.ogulo.com https://ogulo.com",
      // Object tags (none)
      "object-src 'none'",
      // Base URI
      "base-uri 'self'",
      // Form submissions
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Prevent Next.js from redirecting /api/v1/auth/token/ → /api/v1/auth/token
  // before the rewrite proxy runs. Without this, POST bodies are lost on 308.
  skipTrailingSlashRedirect: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.invitationhomes.com",
        pathname: "/**",
      },
    ],
  },

  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    return [
      // Rule 1: URL already has trailing slash — pass through as-is
      {
        source: "/api/v1/:path*/",
        destination: `${backendUrl}/api/v1/:path*/`,
      },
      // Rule 2: URL has no trailing slash (Next.js stripped it) — add one for Django
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*/`,
      },
    ];
  },

  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
