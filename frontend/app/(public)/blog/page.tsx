import Image from "next/image";
import Link from "next/link";
import { fetchPosts, type BlogPost } from "@/lib/blog";

export const revalidate = 3600;

export const metadata = {
  title: "Renter's Guide & Housing Tips | Hasker & Co. Realty Group",
  description:
    "Free renter guides, moving tips, budgeting advice, and housing market updates from the team at Hasker & Co. Realty Group. Written for real families finding affordable homes.",
  alternates: { canonical: "https://haskerrealtygroup.com/blog" },
  openGraph: { title: "Renter's Guide & Housing Tips — Hasker & Co. Realty Group", description: "Free renter guides and housing tips for real families.", type: "website", url: "https://haskerrealtygroup.com/blog" },
};

// Maps display label → API category value (matches backend PostCategory choices)
const CATEGORIES = [
  { label: "All",              value: "" },
  { label: "Market Analysis",  value: "MARKET_ANALYSIS" },
  { label: "Buyer's Guide",    value: "BUYERS_GUIDE" },
  { label: "Seller's Guide",   value: "SELLERS_GUIDE" },
  { label: "Investment",       value: "INVESTMENT" },
  { label: "Market Update",    value: "MARKET_UPDATE" },
];

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function BlogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeCategory = (params.category as string) ?? "";

  let posts: BlogPost[] = [];
  try {
    const data = await fetchPosts(activeCategory ? { category: activeCategory } : undefined);
    posts = data.results;
  } catch {
    // API offline in dev — graceful empty state
  }

  const featured = posts.find((p) => p.is_featured);
  const rest = posts.filter((p) => !p.is_featured);

  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://haskerrealtygroup.com" }, { "@type": "ListItem", position: 2, name: "Renter's Guide", item: "https://haskerrealtygroup.com/blog" }] };

  return (
    <div className="pt-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {/* Header */}
      <div className="bg-brand-dark pt-16 pb-14 px-6 text-white text-center">
        <p className="text-blue-300 text-xs font-semibold tracking-[0.4em] uppercase mb-4">
          Free Resources
        </p>
        <h1 className="font-serif text-4xl lg:text-5xl font-bold mb-4">Renter&apos;s Guide</h1>
        <p className="text-blue-100 max-w-xl mx-auto">
          Practical tips, moving checklists, and budgeting guides written by our team, so you
          can find and keep an affordable home with confidence.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        {/* Category filter — URL-based routing */}
        <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.value;
            const href = cat.value ? `/blog?category=${cat.value}` : "/blog";
            return (
              <Link
                key={cat.value}
                href={href}
                className={`px-4 py-2.5 text-xs font-medium tracking-wide rounded-sm border transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-brand-dark text-white border-brand-dark"
                    : "bg-white text-brand-dark border-neutral-200 hover:border-brand-dark"
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20 text-neutral-400">
            <p className="text-lg font-serif">No articles published yet.</p>
            <p className="text-sm mt-2">Our team is writing renter guides. Check back soon.</p>
          </div>
        )}

        {/* Featured post */}
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="group mb-12 grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white border border-neutral-100 rounded-sm overflow-hidden hover:shadow-xl transition-shadow duration-300 block"
          >
            <div className="relative aspect-[16/9] lg:aspect-auto overflow-hidden bg-brand-light">
              <Image
                src={featured.featured_image_url ?? "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80"}
                alt={featured.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="p-8 lg:p-10 flex flex-col justify-center">
              <span className="text-brand text-xs font-semibold tracking-widest uppercase mb-3">
                Featured · {featured.category_display}
              </span>
              <h2 className="font-serif text-2xl lg:text-3xl font-bold text-brand-dark leading-snug mb-4 group-hover:text-brand transition-colors">
                {featured.title}
              </h2>
              <p className="text-neutral-600 text-sm leading-relaxed mb-6">{featured.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <div>
                  <span className="font-medium text-neutral-600">{featured.author_name}</span>
                  <span className="mx-2">·</span>
                  {formatDate(featured.published_at)}
                </div>
                <span>{featured.read_time_minutes} min read</span>
              </div>
            </div>
          </Link>
        )}

        {/* Grid */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-white border border-neutral-100 rounded-sm overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-brand-light">
                  <Image
                    src={post.featured_image_url ?? "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=75"}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                </div>
                <div className="p-5">
                  <span className="text-brand text-[10px] font-semibold tracking-widest uppercase">
                    {post.category_display}
                  </span>
                  <h3 className="font-serif text-base font-medium text-brand-dark mt-2 mb-3 line-clamp-2 group-hover:text-brand transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-100 pt-3">
                    <span>{formatDate(post.published_at)}</span>
                    <span>{post.read_time_minutes} min</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
