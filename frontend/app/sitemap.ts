import type { MetadataRoute } from "next";
import { fetchPropertiesForSitemap } from "@/lib/properties";
import { fetchPostsForSitemap } from "@/lib/blog";
import { fetchAgents } from "@/lib/agents";
import { getAllCitySlugs } from "@/lib/cities";

const BASE_URL = "https://haskerrealtygroup.com";

// Regenerate this sitemap at most every hour (ISR)
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all dynamic data in parallel — failures return empty arrays (safe)
  const [properties, posts, agents] = await Promise.all([
    fetchPropertiesForSitemap(),
    fetchPostsForSitemap(),
    fetchAgents(),
  ]);

  // ── Static pages ─────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                    lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE_URL}/properties`,    lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE_URL}/apply`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/agents`,        lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE_URL}/blog`,          lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE_URL}/contact`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/careers`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/privacy`,       lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE_URL}/terms`,         lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE_URL}/accessibility`, lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  ];

  // ── Dynamic property listing pages ────────────────────────────────────────
  const propertyPages: MetadataRoute.Sitemap = properties.map(({ slug, lastModified }) => ({
    url: `${BASE_URL}/properties/${slug}`,
    lastModified: new Date(lastModified),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // ── Dynamic blog post pages ───────────────────────────────────────────────
  const blogPages: MetadataRoute.Sitemap = posts.map(({ slug, lastModified }) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: new Date(lastModified),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // ── Dynamic agent profile pages ───────────────────────────────────────────
  const agentPages: MetadataRoute.Sitemap = agents.map((agent) => ({
    url: `${BASE_URL}/agents/${agent.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  // ── City rental landing pages ──────────────────────────────────────────────
  const cityPages: MetadataRoute.Sitemap = getAllCitySlugs().map((slug) => ({
    url: `${BASE_URL}/rentals/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  return [
    ...staticPages,
    ...cityPages,
    ...propertyPages,
    ...blogPages,
    ...agentPages,
  ];
}
