import type { MetadataRoute } from "next";
import { fetchPropertiesForSitemap } from "@/lib/properties";
import { fetchPostsForSitemap } from "@/lib/blog";
import { fetchAgents } from "@/lib/agents";
import { getAllCitySlugs } from "@/lib/cities";

const BASE_URL = "https://haskerrealtygroup.com";

// Regenerate sitemap at most every hour (ISR)
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch dynamic data in parallel — API failures return empty arrays (safe)
  const [properties, posts, agents] = await Promise.all([
    fetchPropertiesForSitemap().catch(() => []),
    fetchPostsForSitemap().catch(() => []),
    fetchAgents().catch(() => []),
  ]);

  // ── Static pages ───────────────────────────────────────────────────────────
  // Priority scale:
  //   1.0  Homepage
  //   0.9  Core conversion pages (search, apply)
  //   0.8  High-value content hubs (city landing, team, blog)
  //   0.7  Supporting content (contact, careers)
  //   0.3  Legal / utility (privacy, terms, accessibility)
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                    lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE_URL}/properties`,    lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE_URL}/apply`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/agents`,        lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE_URL}/blog`,          lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE_URL}/careers`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/contact`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/privacy`,       lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE_URL}/terms`,         lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE_URL}/accessibility`, lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  ];

  // ── City rental landing pages (high SEO value — geo-targeted) ─────────────
  const cityPages: MetadataRoute.Sitemap = getAllCitySlugs().map((slug) => ({
    url: `${BASE_URL}/rentals/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // ── Property listing pages ─────────────────────────────────────────────────
  const propertyPages: MetadataRoute.Sitemap = properties.map(({ slug, lastModified }) => ({
    url: `${BASE_URL}/properties/${slug}`,
    lastModified: new Date(lastModified),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // ── Blog post pages ────────────────────────────────────────────────────────
  const blogPages: MetadataRoute.Sitemap = posts.map(({ slug, lastModified }) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: new Date(lastModified),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  // ── Agent profile pages ────────────────────────────────────────────────────
  const agentPages: MetadataRoute.Sitemap = agents.map((agent) => ({
    url: `${BASE_URL}/agents/${agent.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Order: highest-priority pages first so Googlebot sees them soonest
  return [
    ...staticPages,
    ...cityPages,
    ...propertyPages,
    ...blogPages,
    ...agentPages,
  ];
}
