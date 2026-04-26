import type { MetadataRoute } from "next";
import { fetchPropertiesForSitemap } from "@/lib/properties";
import { fetchPostsForSitemap } from "@/lib/blog";
import { fetchAgents } from "@/lib/agents";
import { getAllCitySlugs } from "@/lib/cities";

const BASE_URL = "https://haskerrealtygroup.com";

// Regenerate sitemaps at most once per hour
export const revalidate = 3600;

// ── Three separate sitemaps, each served as /sitemap/<id>.xml ──────────────
// Next.js generates a /sitemap.xml sitemap-index that references all three.
// Splitting by content type lets Googlebot prioritise and re-crawl each set
// at its own cadence without re-parsing the entire 3,000+ URL file.
export async function generateSitemaps() {
  return [
    { id: "static" },     // homepage, apply, agents, blog hub, careers, etc.
    { id: "properties" }, // every individual property listing page
    { id: "blog" },       // every blog post page
  ];
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = await props.id;

  // ── STATIC sitemap — fast, no remote data needed except agents ────────────
  if (id === "static") {
    const agents = await fetchAgents().catch(() => []);

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

    const cityPages: MetadataRoute.Sitemap = getAllCitySlugs().map((slug) => ({
      url: `${BASE_URL}/rentals/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

    const agentPages: MetadataRoute.Sitemap = agents.map((agent) => ({
      url: `${BASE_URL}/agents/${agent.id}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    return [...staticPages, ...cityPages, ...agentPages];
  }

  // ── PROPERTIES sitemap — all published listing pages ──────────────────────
  if (id === "properties") {
    const properties = await fetchPropertiesForSitemap().catch(() => []);
    return properties.map(({ slug, lastModified }) => ({
      url: `${BASE_URL}/properties/${slug}`,
      lastModified: new Date(lastModified),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));
  }

  // ── BLOG sitemap — all published blog posts ────────────────────────────────
  if (id === "blog") {
    const posts = await fetchPostsForSitemap().catch(() => []);
    return posts.map(({ slug, lastModified }) => ({
      url: `${BASE_URL}/blog/${slug}`,
      lastModified: new Date(lastModified),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }));
  }

  return [];
}
