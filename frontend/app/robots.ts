import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Googlebot-Image crawls property photos for Google Images / search thumbnails
        // Explicitly allow it before the wildcard rule so /*?* doesn't inadvertently block image CDN redirects
        userAgent: "Googlebot-Image",
        allow: "/",
        disallow: [],
      },
      {
        userAgent: "*",
        allow: "/",
        // Disallow private portal routes, internal Next.js paths, and any URL with
        // query parameters (?). The canonical tags already point Google to the clean
        // URLs — disallowing ?* stops crawl budget being spent on filter/search variants
        // like /properties?q=... and /contact?inquiry=... that were causing 9000+
        // "Alternate page with proper canonical tag" GSC errors.
        disallow: ["/dashboard", "/portal", "/api", "/_next", "/*?*"],
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
