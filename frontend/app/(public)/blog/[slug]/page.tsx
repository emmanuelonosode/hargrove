import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Calendar, Tag } from "lucide-react";
import sanitizeHtml from "sanitize-html";
import { fetchPostBySlug, fetchPosts, type BlogPost } from "@/lib/blog";

export const revalidate = 3600;
export const dynamicParams = true;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await fetchPostBySlug(slug);
    return {
      title: `${post.title} | Hasker & Co. Realty Group`,
      description: post.excerpt,
      alternates: { canonical: `https://haskerrealtygroup.com/blog/${slug}` },
      openGraph: { title: `${post.title} | Hasker & Co. Realty Group`, description: post.excerpt, type: "article", url: `https://haskerrealtygroup.com/blog/${slug}` },
    };
  } catch {
    return {};
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  let post: BlogPost;
  try {
    post = await fetchPostBySlug(slug);
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    if (status === 404) notFound();
    notFound();
  }

  // Related posts: same category, exclude current
  let related: BlogPost[] = [];
  try {
    const data = await fetchPosts({ category: post.category });
    related = data.results.filter((p) => p.slug !== slug).slice(0, 3);
  } catch {
    // fine if it fails
  }

  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://haskerrealtygroup.com" }, { "@type": "ListItem", position: 2, name: "Renter's Guide", item: "https://haskerrealtygroup.com/blog" }, { "@type": "ListItem", position: 3, name: post.title, item: `https://haskerrealtygroup.com/blog/${slug}` }] };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    url: `https://haskerrealtygroup.com/blog/${slug}`,
    ...(post.featured_image_url && { image: post.featured_image_url }),
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at ?? post.published_at ?? undefined,
    author: {
      "@type": "Person",
      name: post.author_name,
      ...(post.author_role && { jobTitle: post.author_role }),
    },
    publisher: {
      "@type": "Organization",
      name: "Hasker & Co. Realty Group",
      url: "https://haskerrealtygroup.com",
      logo: { "@type": "ImageObject", url: "https://haskerrealtygroup.com/logo.svg" },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://haskerrealtygroup.com/blog/${slug}`,
    },
    wordCount: post.content ? post.content.split(/\s+/).length : undefined,
    articleSection: post.category_display,
    keywords: post.tags.length > 0 ? post.tags.join(", ") : undefined,
  };

  return (
    <div className="pt-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[360px] bg-brand-dark overflow-hidden">
        {post.featured_image_url && (
          <Image
            src={post.featured_image_url}
            alt={post.title}
            fill
            className="object-cover opacity-40"
            priority
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end max-w-4xl mx-auto px-6 lg:px-8 pb-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-blue-300 text-xs font-medium mb-6 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Renter&apos;s Guide
          </Link>
          <span className="text-brand text-xs font-semibold tracking-widest uppercase mb-3">
            {post.category_display}
          </span>
          <h1 className="font-serif text-3xl lg:text-5xl font-bold text-white leading-snug">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-5 mt-5 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <div>
                <span className="font-medium text-white">{post.author_name}</span>
                <span className="text-blue-200 text-xs block">{post.author_role}</span>
              </div>
            </div>
            {post.published_at && (
              <div className="flex items-center gap-1.5 text-blue-200 text-xs">
                <Calendar size={13} />
                {formatDate(post.published_at)}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-blue-200 text-xs">
              <Clock size={13} />
              {post.read_time_minutes} min read
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-16">
          {/* Article body */}
          <article>
            <p className="text-neutral-600 text-lg leading-relaxed mb-10 border-l-4 border-brand pl-5 italic">
              {post.excerpt}
            </p>

            <div
              className="prose prose-neutral max-w-none
                prose-headings:font-serif prose-headings:text-brand-dark
                prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4
                prose-p:text-neutral-600 prose-p:leading-relaxed prose-p:mb-5
                prose-a:text-brand prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(post.content, {
                  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "figure", "figcaption", "h1", "h2", "h3", "h4"]),
                  allowedAttributes: {
                    ...sanitizeHtml.defaults.allowedAttributes,
                    img: ["src", "alt", "width", "height", "loading"],
                    "*": ["class"],
                    a: ["href", "name", "target", "rel"],
                  },
                  allowedSchemes: ["http", "https", "mailto"],
                }),
              }}
            />

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-neutral-100">
                <Tag size={14} className="text-neutral-400 mt-0.5" />
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-brand-light border border-brand-muted text-brand-dark px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author bio */}
            <div className="mt-10 bg-brand-light border border-brand-muted rounded-sm p-6 flex gap-5">
              <div>
                <p className="font-serif font-bold text-brand-dark">{post.author_name}</p>
                <p className="text-brand text-xs font-semibold tracking-wide mb-2">{post.author_role}</p>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  A housing specialist at Hasker & Co. Realty Group, helping families find affordable
                  homes across 12+ cities. Have a question? Reach out directly. We always respond.
                </p>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* CTA */}
            <div className="bg-brand-dark text-white rounded-sm p-6">
              <p className="text-blue-300 text-xs font-semibold tracking-widest uppercase mb-3">
                Find Your Home
              </p>
              <h2 className="font-serif text-xl font-bold mb-3">
                Ready to Start Looking?
              </h2>
              <p className="text-blue-100 text-sm leading-relaxed mb-5">
                Browse affordable homes in your city or talk to our team. We respond within 24 hours and never charge hidden fees.
              </p>
              <Link
                href="/properties"
                className="block w-full text-center bg-brand text-white text-sm font-medium py-3 rounded-sm hover:bg-brand-hover transition-colors"
              >
                Browse Available Homes
              </Link>
            </div>

            {/* Related posts */}
            {related.length > 0 && (
              <div>
                <h2 className="font-serif text-lg font-bold text-brand-dark mb-4">
                  Related Articles
                </h2>
                <div className="space-y-5">
                  {related.map((rel) => (
                    <Link
                      key={rel.slug}
                      href={`/blog/${rel.slug}`}
                      className="group flex gap-3"
                    >
                      <div className="relative w-16 h-16 rounded-sm overflow-hidden shrink-0 bg-brand-light">
                        {rel.featured_image_url && (
                          <Image
                            src={rel.featured_image_url}
                            alt={rel.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="64px"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-brand text-[10px] font-semibold tracking-widest uppercase">
                          {rel.category_display}
                        </span>
                        <p className="text-sm font-medium text-brand-dark leading-snug line-clamp-2 group-hover:text-brand transition-colors mt-0.5">
                          {rel.title}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">{rel.read_time_minutes} min</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Free guide CTA */}
            <div className="border border-brand-muted bg-brand-light rounded-sm p-5">
              <p className="text-xs font-semibold text-brand tracking-widest uppercase mb-2">
                Free Guide
              </p>
              <h3 className="font-serif text-base font-bold text-brand-dark mb-2">
                First-Time Renter&apos;s Checklist
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed mb-4">
                What to inspect, what to negotiate, and red flags to avoid. Written by our
                rental specialists for families renting their first home.
              </p>
              <Link
                href="/contact?service=guide"
                className="block w-full text-center border border-brand text-brand text-xs font-semibold py-2.5 rounded-sm hover:bg-brand hover:text-white transition-colors"
              >
                Get the Free Checklist
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* More articles */}
      {related.length > 0 && (
        <section className="bg-brand-light border-t border-brand-muted py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <h2 className="font-serif text-3xl font-bold text-brand-dark">More Guides</h2>
              <Link href="/blog" className="text-sm text-brand hover:underline font-medium">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/blog/${rel.slug}`}
                  className="group bg-white border border-neutral-100 rounded-sm overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-brand-light">
                    {rel.featured_image_url && (
                      <Image
                        src={rel.featured_image_url}
                        alt={rel.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <span className="text-brand text-[10px] font-semibold tracking-widest uppercase">
                      {rel.category_display}
                    </span>
                    <h3 className="font-serif text-base font-medium text-brand-dark mt-2 mb-2 line-clamp-2 group-hover:text-brand transition-colors leading-snug">
                      {rel.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-100 pt-3 mt-3">
                      <span>{formatDate(rel.published_at)}</span>
                      <span>{rel.read_time_minutes} min read</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
