import type { MetadataRoute } from "next";

const BASE_URL = "https://haskerrealtygroup.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL,                         lastModified: new Date(), changeFrequency: "daily",   priority: 1 },
    { url: `${BASE_URL}/properties`,         lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE_URL}/apply`,              lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/agents`,             lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE_URL}/blog`,               lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE_URL}/contact`,            lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/privacy`,            lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE_URL}/terms`,              lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE_URL}/accessibility`,      lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  ];
}
