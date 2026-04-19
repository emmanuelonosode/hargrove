import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/api/"],
    },
    sitemap: "https://haskerrealtygroup.com/sitemap.xml",
    host: "https://haskerrealtygroup.com",
  };
}
