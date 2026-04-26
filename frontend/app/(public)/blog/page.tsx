import Image from "next/image";
import Link from "next/link";
import { BookOpen, TrendingUp, Home, DollarSign, BarChart2, ArrowRight, Mail } from "lucide-react";
import { fetchPosts, type BlogPost } from "@/lib/blog";

export const revalidate = 3600;

export const metadata = {
  title: "Renter's Guide & Housing Tips | Hasker & Co. Realty Group",
  description:
    "Free renter guides, moving tips, budgeting advice, lease explainers, and housing market updates from Hasker & Co. Realty Group. Written for real families finding affordable homes in Virginia Beach, Atlanta, Charlotte, Houston, Dallas, Nashville and more.",
  alternates: { canonical: "https://haskerrealtygroup.com/blog" },
  openGraph: {
    title: "Renter's Guide & Housing Tips — Hasker & Co. Realty Group",
    description: "Free renter guides and housing tips for real families.",
    type: "website",
    url: "https://haskerrealtygroup.com/blog",
  },
};

const CATEGORIES = [
  { label: "All",             value: "" },
  { label: "Market Analysis", value: "MARKET_ANALYSIS" },
  { label: "Buyer's Guide",   value: "BUYERS_GUIDE" },
  { label: "Seller's Guide",  value: "SELLERS_GUIDE" },
  { label: "Investment",      value: "INVESTMENT" },
  { label: "Market Update",   value: "MARKET_UPDATE" },
];

const TOPIC_GUIDES = [
  {
    icon: Home,
    title: "Finding & Applying",
    description: "How to search for an affordable rental, what to look for in a listing, and how to get your application approved fast.",
    tags: ["Application Tips", "Credit Score", "Background Checks"],
    accent: "bg-blue-600",
    img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80",
  },
  {
    icon: DollarSign,
    title: "Budgeting for Your Home",
    description: "How much rent can you actually afford? The 30% rule, hidden costs to plan for, and how to save for a deposit.",
    tags: ["Budgeting", "Security Deposit", "Monthly Costs"],
    accent: "bg-emerald-600",
    img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80",
  },
  {
    icon: BookOpen,
    title: "Lease & Legal Basics",
    description: "What every clause in your lease actually means, tenant rights in Virginia, and how to handle disputes.",
    tags: ["Lease Terms", "Tenant Rights", "Renewals"],
    accent: "bg-violet-600",
    img: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80",
  },
  {
    icon: TrendingUp,
    title: "Moving & Relocation",
    description: "City-by-city moving guides, neighbourhood comparisons, and tips for relocating with a family or pets.",
    tags: ["Relocation", "Moving Checklist", "Pet-Friendly"],
    accent: "bg-amber-600",
    img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
  },
  {
    icon: BarChart2,
    title: "Market Updates",
    description: "Monthly rental market reports for Atlanta, Charlotte, Houston, Dallas, Nashville, Virginia Beach and beyond.",
    tags: ["Atlanta", "Charlotte", "Houston"],
    accent: "bg-brand",
    img: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80",
  },
];

const RENTER_FAQS = [
  {
    q: "How much income do I need to rent a home?",
    a: "Most landlords require gross monthly income to be at least 3× the monthly rent. For example, a $1,200/mo rental typically requires $3,600/mo gross income. We can help you find properties that match your actual income — just use our search filters.",
  },
  {
    q: "Can I rent with bad credit or no rental history?",
    a: "Yes, in many cases. We work with properties that accept low or no credit, first-time renters, and applicants with imperfect rental history. In some cases a larger deposit or a co-signer can offset a lower credit score. Talk to one of our specialists about your situation.",
  },
  {
    q: "What's usually included in the rent?",
    a: "It varies by property. Some of our listings include water/sewer, lawn care, or even WiFi. We list what's included on every property page. Always ask us before applying if you need clarity — we'll get a direct answer from the landlord.",
  },
  {
    q: "How long does the application and approval process take?",
    a: "Our standard process runs 24–48 hours on business days from submission to decision. If you have all documents ready (ID, proof of income, references) you can speed this up significantly. We also have properties with expedited approvals.",
  },
  {
    q: "What fees do I need to pay upfront?",
    a: "Typically a security deposit (usually 1–2 months rent) and the first month's rent. Some properties charge a pet deposit or non-refundable admin fee. We clearly list all fees on every listing — there are no surprises after you apply.",
  },
  {
    q: "Are your homes available for Section 8 / Housing Choice Vouchers?",
    a: "Several of our listings accept Housing Choice Vouchers (HCV/Section 8). Use the voucher filter on our properties page, or contact us directly and we'll match you with eligible units in your city.",
  },
];

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
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

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://haskerrealtygroup.com" },
      { "@type": "ListItem", position: 2, name: "Renter's Guide", item: "https://haskerrealtygroup.com/blog" },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: RENTER_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <main className="pt-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[480px] lg:min-h-[540px] flex items-end overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1600&q=80"
          alt="Person reading the Hasker & Co. Renter's Guide"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/72 to-brand-dark/25" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 pb-16 pt-32">
          <p className="text-brand text-xs font-semibold tracking-[0.35em] uppercase mb-4">Free Resources</p>
          <h1 className="font-serif text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.05] mb-5 max-w-3xl">
            Renter&apos;s Guide &amp; Housing Tips
          </h1>
          <p className="text-blue-100 text-lg max-w-xl leading-relaxed">
            Practical advice written by our team for real families — budgeting guides, moving
            checklists, lease explainers, and local market updates.
          </p>
        </div>
      </section>

      {/* ── TOPIC GUIDES ─────────────────────────────────────────────────── */}
      <section className="border-b border-neutral-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-24">
          <div className="max-w-xl mb-14">
            <p className="text-brand text-xs font-semibold tracking-[0.35em] uppercase mb-4">Topics We Cover</p>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-brand-dark leading-tight">
              Everything a Renter Needs to Know
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            {TOPIC_GUIDES.map((topic) => (
              <div key={topic.title} className="group border border-neutral-100 rounded-sm overflow-hidden bg-white hover:shadow-lg hover:border-brand/20 transition-all duration-300 cursor-default">
                {/* Image strip */}
                <div className="relative h-32 overflow-hidden">
                  <Image
                    src={topic.img}
                    alt={topic.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 20vw"
                  />
                  <div className="absolute inset-0 bg-brand-dark/50" />
                  <div className="absolute bottom-3 left-4">
                    <div className="w-8 h-8 rounded-sm bg-white/15 backdrop-blur-sm flex items-center justify-center">
                      <topic.icon size={16} className="text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-base font-bold text-brand-dark mb-2 group-hover:text-brand transition-colors">{topic.title}</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed mb-3">{topic.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {topic.tags.map((tag) => (
                      <span key={tag} className="text-[9px] tracking-wide bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-sm font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ARTICLES ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-24">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <p className="text-brand text-xs font-semibold tracking-[0.35em] uppercase mb-3">Latest Articles</p>
            <h2 className="font-serif text-4xl font-bold text-brand-dark">From the Team</h2>
          </div>
          {/* Category filter */}
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.value;
              const href = cat.value ? `/blog?category=${cat.value}` : "/blog";
              return (
                <Link
                  key={cat.value}
                  href={href}
                  className={`px-4 py-2 text-xs font-medium tracking-wide rounded-sm border transition-colors whitespace-nowrap ${
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
        </div>

        {/* Featured post */}
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="group mb-10 grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white border border-neutral-100 rounded-sm overflow-hidden hover:shadow-xl transition-shadow duration-300 block"
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
              <span className="text-brand text-xs font-semibold tracking-widest uppercase mb-3">Featured · {featured.category_display}</span>
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
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group bg-white border border-neutral-100 rounded-sm overflow-hidden hover:shadow-xl transition-shadow duration-300">
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
                  <span className="text-brand text-[10px] font-semibold tracking-widest uppercase">{post.category_display}</span>
                  <h3 className="font-serif text-base font-medium text-brand-dark mt-2 mb-3 line-clamp-2 group-hover:text-brand transition-colors leading-snug">{post.title}</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-100 pt-3">
                    <span>{formatDate(post.published_at)}</span>
                    <span>{post.read_time_minutes} min</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty state — with lifestyle image */}
        {posts.length === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-neutral-100 rounded-sm overflow-hidden">
            <div className="relative aspect-[4/3] lg:aspect-auto min-h-[280px] bg-neutral-100">
              <Image
                src="https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80"
                alt="Welcoming home entryway"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-brand-dark/40" />
            </div>
            <div className="bg-white p-10 lg:p-14 flex flex-col justify-center">
              <BookOpen size={32} className="text-brand mb-5" />
              <h3 className="font-serif text-2xl font-bold text-brand-dark mb-3">New guides coming soon.</h3>
              <p className="text-neutral-500 text-sm leading-relaxed mb-8">
                Our team is writing in-depth renter guides for every city we serve — from budgeting
                basics to neighbourhood-level market reports. Check back soon, or ask us directly.
              </p>
              <Link href="/contact" className="inline-flex items-center gap-2 bg-brand-dark text-white text-sm font-semibold px-7 py-3.5 rounded-sm hover:bg-brand transition-colors self-start">
                Ask a Specialist <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="bg-brand-dark text-white py-24 lg:py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-14">
            <p className="text-blue-300 text-xs font-semibold tracking-[0.35em] uppercase mb-4">Questions We Get Asked</p>
            <h2 className="font-serif text-4xl font-bold leading-tight">Renter FAQs</h2>
            <p className="text-blue-100 text-sm mt-4 leading-relaxed max-w-lg">
              Answers to the questions our team hears most from renters and applicants.
            </p>
          </div>
          <div className="space-y-3">
            {RENTER_FAQS.map((faq) => (
              <details key={faq.q} className="group border border-white/10 rounded-sm overflow-hidden bg-white/5 hover:bg-white/8 transition-colors">
                <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none hover:bg-white/5 transition-colors">
                  <span className="font-medium text-sm text-white leading-snug">{faq.q}</span>
                  <div className="shrink-0 w-7 h-7 rounded-full border border-white/20 flex items-center justify-center group-open:border-brand group-open:bg-brand transition-colors duration-200">
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="text-blue-300 group-open:text-white group-open:rotate-180 transition-all duration-200">
                      <path d="M1.5 4L5.5 8L9.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </summary>
                <div className="px-6 pb-5 pt-2 border-t border-white/10">
                  <p className="text-blue-100 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER CTA — split layout ────────────────────────────────── */}
      <section className="border-t border-neutral-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image */}
            <div className="relative aspect-[4/3] lg:aspect-auto min-h-[340px] bg-neutral-100 lg:order-2">
              <Image
                src="https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1000&q=80"
                alt="Affordable homes in a welcoming neighbourhood"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Content */}
            <div className="bg-brand-dark text-white p-10 lg:p-16 flex flex-col justify-center lg:order-1">
              <p className="text-blue-300 text-xs font-semibold tracking-[0.35em] uppercase mb-4">Stay Informed</p>
              <h2 className="font-serif text-4xl lg:text-5xl font-bold leading-tight mb-5">
                Get Housing Tips in Your Inbox
              </h2>
              <p className="text-blue-100 text-sm leading-relaxed mb-8">
                Monthly renter guides, market updates, and new listing alerts — no spam,
                unsubscribe any time. Join 3,000+ renters already on our list.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 bg-brand text-white text-sm font-semibold px-8 py-4 rounded-sm hover:bg-brand/90 transition-colors self-start"
              >
                <Mail size={15} /> Subscribe to Updates <ArrowRight size={14} />
              </Link>
              <p className="text-[11px] text-blue-300/60 mt-5">
                By subscribing you agree to receive marketing emails. Unsubscribe any time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
