import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Use prefix-match paths (no trailing slash needed — robots.txt /portal/ matches /portal and /portal/*)
      disallow: ["/dashboard", "/portal", "/api", "/_next"],
      },
      {
        // Explicitly allow known LLM/AI crawlers to index the site
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "Google-Extended",
          "Claude-Web",
          "Anthropic-AI",
          "PerplexityBot",
          "Bytespider",
          "CCBot",
        ],
        allow: ["/", "/llms.txt", "/llms-full.txt"],
        disallow: ["/dashboard", "/portal", "/api", "/_next"],
      },
    ],
    sitemap: "https://haskerrealtygroup.com/sitemap.xml",
    host: "https://haskerrealtygroup.com",
  };
}
