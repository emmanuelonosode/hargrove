const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://admin.haskerrealtygroup.com";

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  category_display: string;
  author_name: string;
  author_role: string;
  featured_image_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  published_at: string | null;
  tags: string[];
  read_time_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface FetchPostsParams {
  category?: string;
  is_featured?: boolean;
  search?: string;
}

export async function fetchPosts(
  params?: FetchPostsParams
): Promise<PaginatedResponse<BlogPost>> {
  const url = new URL(`${API_BASE}/api/v1/blog/posts/`);
  if (params?.category) url.searchParams.set("category", params.category);
  if (params?.is_featured !== undefined)
    url.searchParams.set("is_featured", String(params.is_featured));
  if (params?.search) url.searchParams.set("search", params.search);

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);
  return res.json();
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost> {
  const res = await fetch(`${API_BASE}/api/v1/blog/posts/${slug}/`, {
    next: { revalidate: 3600 },
  });

  if (res.status === 404) {
    const err = new Error("Post not found") as Error & { status: number };
    err.status = 404;
    throw err;
  }

  if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);
  return res.json();
}

/** For sitemap.ts: returns slug + lastModified for all published blog posts. */
export async function fetchPostsForSitemap(): Promise<{ slug: string; lastModified: string }[]> {
  try {
    // Dedicated endpoint — returns ALL published post slugs with no pagination cap
    const res = await fetch(`${API_BASE}/api/v1/blog/sitemap/`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data: { slug: string; updated_at: string; published_at: string | null }[] = await res.json();
    return data.map((p) => ({
      slug: p.slug,
      lastModified: p.updated_at || p.published_at || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}
