import type { MetadataRoute } from "next";
import { fetchPropertiesForSitemap } from "@/lib/properties";
import { fetchPostsForSitemap } from "@/lib/blog";
import { fetchAgents } from "@/lib/agents";
import { getAllCitySlugs } from "@/lib/cities";

const BASE_URL = "https://haskerrealtygroup.com";

// Regenerate every 12 hours — keeps sitemap fresh for twice-daily crawling
export const revalidate = 43200;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [propertiesResult, postsResult, agentsResult] = await Promise.allSettled([
    fetchPropertiesForSitemap(),
    fetchPostsForSitemap(),
    fetchAgents(),
  ]);

  const properties = propertiesResult.status === "fulfilled" ? propertiesResult.value : [];
  const posts      = postsResult.status      === "fulfilled" ? postsResult.value      : [];
  const agents     = agentsResult.status     === "fulfilled" ? agentsResult.value     : [];

  if (propertiesResult.status === "rejected") console.warn("sitemap: properties fetch failed —", propertiesResult.reason);
  if (postsResult.status      === "rejected") console.warn("sitemap: blog fetch failed —",       postsResult.reason);
  if (agentsResult.status     === "rejected") console.warn("sitemap: agents fetch failed —",     agentsResult.reason);

  // ── Static pages ───────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                    lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE_URL}/properties`,    lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE_URL}/apply`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/agents`,        lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE_URL}/blog`,          lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE_URL}/careers`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/contact`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/privacy`,       lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE_URL}/terms`,         lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE_URL}/accessibility`, lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  ];

  // ── City rental landing pages ──────────────────────────────────────────────
  const cityPages: MetadataRoute.Sitemap = getAllCitySlugs().map((slug) => ({
    url: `${BASE_URL}/rentals/${slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  // ── Agent profile pages ────────────────────────────────────────────────────
  const agentPages: MetadataRoute.Sitemap = agents.map((agent) => ({
    url: `${BASE_URL}/agents/${agent.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // ── All property listing pages (uses /api/v1/properties/sitemap/ — no row cap) ──
  const propertyPages: MetadataRoute.Sitemap = properties.map(({ slug, lastModified }) => ({
    url: `${BASE_URL}/properties/${slug}`,
    lastModified: new Date(lastModified),
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  // ── All blog post pages (uses /api/v1/blog/sitemap/ — no row cap) ──────────
  const blogPages: MetadataRoute.Sitemap = posts.map(({ slug, lastModified }) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: new Date(lastModified),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  // Highest-priority pages first so Googlebot sees them soonest
  return [
    ...staticPages,
    ...cityPages,
    ...propertyPages,
    ...blogPages,
    ...agentPages,
  ];
}
