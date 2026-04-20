const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ─── API Response Types ────────────────────────────────────────────────────

export interface PropertyImageAPI {
  id: number;
  image_url: string | null;
  caption: string | null;
  is_primary: boolean;
  order: number;
}

export interface PropertyAmenityAPI {
  id: number;
  name: string;
}

export interface AmenityCategoryAPI {
  id: number | null;
  name: string;
  icon: string;
  amenities: PropertyAmenityAPI[];
}

export interface PropertyAgentAPI {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  email: string;
  avatar_url: string | null;
  agent_profile?: {
    license_number?: string;
    bio?: string;
    specialties?: string[];
  };
}

/** Shape returned by GET /api/v1/properties/ (list) */
export interface PropertyListItemAPI {
  id: number;
  slug: string;
  title: string;
  type: string;
  listing_type: string;
  status: string;
  price: number;
  price_label: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  address: string;
  city: string;
  state: string;
  neighborhood: string | null;
  is_featured: boolean;
  primary_image_url: string | null;
  agent_name: string;
  created_at: string;
}

/** Shape returned by GET /api/v1/properties/<slug>/ (detail) */
export interface PropertyDetailAPI extends PropertyListItemAPI {
  description: string;
  zip_code: string;
  lot_size: number | null;
  year_built: number | null;
  garage: number | null;
  stories: number | null;
  latitude: number | null;
  longitude: number | null;
  virtual_tour_url: string | null;
  images: PropertyImageAPI[];
  amenities: PropertyAmenityAPI[];
  amenity_categories: AmenityCategoryAPI[];
  agent: PropertyAgentAPI;
  updated_at: string;
}

export interface PaginatedProperties {
  count: number;
  next: string | null;
  previous: string | null;
  results: PropertyListItemAPI[];
}

// ─── Fetch Functions ───────────────────────────────────────────────────────

export interface FetchPropertiesParams {
  listing_type?: string;
  q?: string;
  beds?: string;
  min_price?: string;
  max_price?: string;
  is_featured?: string;
  agent?: string;
}

export async function fetchProperties(
  params?: FetchPropertiesParams
): Promise<PaginatedProperties> {
  const url = new URL(`${API_BASE}/api/v1/properties/`);
  if (params?.listing_type) url.searchParams.set("listing_type", params.listing_type);
  url.searchParams.set("is_published", "true");
  if (params?.q)           url.searchParams.set("q", params.q);
  if (params?.beds)        url.searchParams.set("beds", params.beds);
  if (params?.min_price)   url.searchParams.set("min_price", params.min_price);
  if (params?.max_price)   url.searchParams.set("max_price", params.max_price);
  if (params?.is_featured) url.searchParams.set("is_featured", params.is_featured);
  if (params?.agent)       url.searchParams.set("agent", params.agent);

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`fetchProperties: ${res.status}`);
  return res.json();
}

export async function fetchFeaturedProperties(): Promise<PropertyListItemAPI[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/properties/featured/`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data: PropertyListItemAPI[] | PaginatedProperties = await res.json();
    if (Array.isArray(data)) return data;
    return (data as PaginatedProperties).results ?? [];
  } catch {
    return [];
  }
}

export async function fetchPropertyBySlug(slug: string): Promise<PropertyDetailAPI> {
  const res = await fetch(`${API_BASE}/api/v1/properties/${slug}/`, {
    next: { revalidate: 300 },
  });
  if (res.status === 404) {
    const err = new Error("Property not found") as Error & { status: number };
    err.status = 404;
    throw err;
  }
  if (!res.ok) throw new Error(`fetchPropertyBySlug: ${res.status}`);
  return res.json();
}

export async function fetchAllPropertySlugs(): Promise<string[]> {
  try {
    const url = new URL(`${API_BASE}/api/v1/properties/`);
    url.searchParams.set("is_published", "true");
    url.searchParams.set("page_size", "500");
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data: PaginatedProperties = await res.json();
    return data.results.map((p) => p.slug);
  } catch {
    return [];
  }
}

// ─── Mapper: API list item → Property type (for PropertyCard) ─────────────

import type { Property } from "@/types";

export function toPropertyCardShape(p: PropertyListItemAPI): Property {
  return {
    id:          String(p.id),
    slug:        p.slug,
    title:       p.title,
    description: "",
    type:        p.type as Property["type"],
    listingType: p.listing_type as Property["listingType"],
    status:      p.status as Property["status"],
    price:       p.price,
    priceLabel:  p.price_label || undefined,
    bedrooms:    p.bedrooms,
    bathrooms:   p.bathrooms,
    sqft:        p.sqft,
    address:     p.address,
    city:        p.city,
    state:       p.state,
    zip:         "",
    neighborhood: p.neighborhood ?? undefined,
    images:      p.primary_image_url
      ? [{ id: "primary", url: p.primary_image_url, caption: p.title, isPrimary: true }]
      : [],
    amenities:   [],
    isFeatured:  p.is_featured,
    isPublished: true,
    agentId:     "",
    createdAt:   p.created_at,
    updatedAt:   p.created_at,
  };
}
