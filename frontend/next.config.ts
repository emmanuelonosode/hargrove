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
      "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com",
      // API connections: same origin + backend API
      "connect-src 'self' https://admin.haskerrealtygroup.com",
      // Media
      "media-src 'self'",
      // Iframes (none allowed)
      "frame-src 'none'",
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
    ],
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
