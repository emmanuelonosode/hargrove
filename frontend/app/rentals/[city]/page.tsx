import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  Clock, ShieldCheck, PawPrint, Home, ArrowRight,
  Bed, Bath, Maximize, MapPin, Star, TrendingUp, Users, Building,
} from "lucide-react";
import { CITIES, getAllCitySlugs, getCityBySlug, type CityData } from "@/lib/cities";
import { fetchProperties, toPropertyCardShape } from "@/lib/properties";
import { PropertyCard } from "@/components/public/PropertyCard";
import { Button } from "@/components/ui/Button";

export const revalidate = 3600;

/* ── Static Params ──────────────────────────────────────────────────── */

export function generateStaticParams() {
  return getAllCitySlugs().map((city) => ({ city }));
}

/* ── Dynamic SEO Metadata ───────────────────────────────────────────── */

export async function generateMetadata(
  { params }: { params: Promise<{ city: string }> }
): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) return { title: "City Not Found" };

  const title = `Affordable Homes & Apartments for Rent in ${city.name}, ${city.stateCode} | Hasker & Co.`;
  const description = `Browse comfortable, budget-friendly homes and apartments for rent in ${city.name}, ${city.state}. No hidden fees, 24-hour application decisions. Find your next home today.`;
  const url = `https://haskerrealtygroup.com/rentals/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      images: [{ url: city.heroImage, width: 1600, height: 900, alt: `Affordable homes in ${city.name}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [city.heroImage],
    },
  };
}

/* ── Trust badges ───────────────────────────────────────────────────── */

const TRUST_BADGES = [
  { icon: Clock,       label: "24-Hour Decisions" },
  { icon: ShieldCheck, label: "No Hidden Fees" },
  { icon: PawPrint,    label: "Pet-Friendly Options" },
  { icon: Star,        label: "4.9★ Trustpilot" },
  { icon: Users,       label: "2,000+ Families Housed" },
  { icon: Home,        label: "Verified Listings Only" },
];

/* ── Market stats ───────────────────────────────────────────────────── */

function MarketStats({ city }: { city: CityData }) {
  const stats = [
    { icon: TrendingUp, label: "Avg. Rent",   value: city.avgRent + "/mo" },
    { icon: Users,      label: "Metro Pop.",   value: city.population },
    { icon: Building,   label: "Market",       value: city.marketHighlight },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-white border border-neutral-100 rounded-sm p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-sm bg-brand-light flex items-center justify-center shrink-0">
            <s.icon size={18} className="text-brand" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 tracking-wide uppercase">{s.label}</p>
            <p className="text-base font-semibold text-brand-dark mt-0.5">{s.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Page Component ─────────────────────────────────────────────────── */

export default async function CityRentalsPage(
  { params }: { params: Promise<{ city: string }> }
) {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) notFound();

  // Fetch real properties for this city from the API
  let properties: import("@/types").Property[] = [];
  try {
    const data = await fetchProperties({ q: city.name, page_size: "6" });
    properties = data.results.map(toPropertyCardShape);
  } catch {
    // API may be down — page still renders with empty grid
  }

  // JSON-LD: CollectionPage + BreadcrumbList
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Affordable Homes for Rent in ${city.name}, ${city.stateCode}`,
    description: `Browse budget-friendly rental homes and apartments in ${city.name}, ${city.state}. No hidden fees, 24-hour application decisions.`,
    url: `https://haskerrealtygroup.com/rentals/${slug}`,
    isPartOf: { "@type": "WebSite", name: "Hasker & Co. Realty Group", url: "https://haskerrealtygroup.com" },
    about: {
      "@type": "City",
      name: city.name,
      containedInPlace: { "@type": "State", name: city.state, containedInPlace: { "@type": "Country", name: "United States" } },
    },
    provider: {
      "@type": "RealEstateAgent",
      name: "Hasker & Co. Realty Group",
      url: "https://haskerrealtygroup.com",
      telephone: "+14045550182",
      address: { "@type": "PostalAddress", addressLocality: "Virginia Beach", addressRegion: "VA", addressCountry: "US" },
    },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://haskerrealtygroup.com" },
      { "@type": "ListItem", position: 2, name: "Properties", item: "https://haskerrealtygroup.com/properties" },
      { "@type": "ListItem", position: 3, name: `${city.name}, ${city.stateCode}`, item: `https://haskerrealtygroup.com/rentals/${slug}` },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How much does it cost to rent a home in ${city.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The average rent in ${city.name} starts around ${city.avgRent}/month. Hasker & Co. Realty Group offers affordable rentals across ${city.name} with no hidden fees and transparent pricing on every listing.`,
        },
      },
      {
        "@type": "Question",
        name: `How do I apply for a rental in ${city.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `You can apply online at haskerrealtygroup.com/apply in under 10 minutes. Hasker & Co. Realty Group reviews every application within 24 hours. No paper forms required.`,
        },
      },
      {
        "@type": "Question",
        name: `Does Hasker & Co. Realty Group have pet-friendly rentals in ${city.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes. Several of our ${city.name} listings are pet-friendly. Pet policies are disclosed upfront on every listing. You can filter for pet-friendly homes at haskerrealtygroup.com/properties.`,
        },
      },
      {
        "@type": "Question",
        name: `Are there any hidden fees when renting through Hasker & Co. in ${city.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `No. Hasker & Co. Realty Group does not charge hidden administrative or processing fees. The price listed is the price you pay. Standard upfront costs are a security deposit (typically 1–2 months rent) and the first month's rent.`,
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[520px] lg:min-h-[560px] flex items-end overflow-hidden">
        <Image
          src={city.heroImage}
          alt={`Affordable rental homes in ${city.name}, ${city.stateCode}`}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-brand-dark/20" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 pb-14 pt-32">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-xs text-blue-200">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li className="text-blue-400">/</li>
              <li><Link href="/properties" className="hover:text-white transition-colors">Properties</Link></li>
              <li className="text-blue-400">/</li>
              <li className="text-white font-medium">{city.name}, {city.stateCode}</li>
            </ol>
          </nav>

          <p className="text-brand text-xs font-semibold tracking-[0.2em] uppercase mb-3 hero-animate" style={{ animationDelay: "0ms" }}>
            {city.stateCode} Rentals
          </p>
          <h1 className="font-serif text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight hero-animate" style={{ animationDelay: "80ms" }}>
            Find Your Next Home in {city.name}
          </h1>
          <p className="text-blue-100 text-lg lg:text-xl max-w-2xl mt-4 leading-relaxed hero-animate" style={{ animationDelay: "160ms" }}>
            {city.tagline} Browse affordable homes and apartments — no hidden fees, decisions in 24 hours.
          </p>

          <div className="flex flex-wrap gap-3 mt-8 hero-animate" style={{ animationDelay: "240ms" }}>
            <Button variant="accent" size="lg" asChild>
              <Link href={`/properties?q=${encodeURIComponent(city.name)}`}>
                Browse {city.name} Inventory
                <ArrowRight size={16} />
              </Link>
            </Button>
            <Button variant="outline-white" size="lg" asChild>
              <Link href="/apply">
                Apply Now — 10 Min
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ────────────────────────────────────────────── */}
      <section className="bg-brand-dark border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between gap-6 overflow-x-auto scrollbar-hide">
            {TRUST_BADGES.map((b) => (
              <div key={b.label} className="flex items-center gap-2.5 shrink-0">
                <b.icon size={16} className="text-brand" />
                <span className="text-white/80 text-xs font-medium tracking-wide whitespace-nowrap">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARKET STATS ─────────────────────────────────────────── */}
      <section className="bg-brand-light border-b border-brand-muted">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <MarketStats city={city} />
        </div>
      </section>

      {/* ── PROPERTY GRID ────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-brand text-xs font-semibold tracking-[0.2em] uppercase mb-2">Available Now</p>
              <h2 className="font-serif text-3xl lg:text-4xl font-bold text-brand-dark">
                Homes in {city.name}
              </h2>
            </div>
            <Link
              href={`/properties?q=${encodeURIComponent(city.name)}`}
              className="hidden sm:flex items-center gap-2 text-sm text-brand font-medium hover:underline"
            >
              View All {city.name} Listings
              <ArrowRight size={14} />
            </Link>
          </div>

          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-neutral-200 rounded-sm">
              <Home size={40} className="mx-auto text-neutral-300 mb-4" />
              <h3 className="font-serif text-xl font-semibold text-brand-dark mb-2">
                New listings coming soon
              </h3>
              <p className="text-neutral-500 text-sm max-w-md mx-auto mb-6">
                We&apos;re actively adding affordable homes in {city.name}. Check back soon or browse all available properties.
              </p>
              <Button variant="accent" asChild>
                <Link href="/properties">Browse All Properties</Link>
              </Button>
            </div>
          )}

          {/* Mobile CTA */}
          <div className="mt-8 sm:hidden">
            <Button variant="outline-blue" className="w-full" asChild>
              <Link href={`/properties?q=${encodeURIComponent(city.name)}`}>
                View All {city.name} Listings
                <ArrowRight size={14} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── SEO CONTENT BLOCK ────────────────────────────────────── */}
      <section className="bg-brand-light border-t border-brand-muted">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
          <p className="text-brand text-xs font-semibold tracking-[0.2em] uppercase mb-3">Market Guide</p>
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-brand-dark mb-8">
            Renting in {city.name}
          </h2>
          <div className="prose prose-neutral max-w-none prose-headings:font-serif prose-headings:text-brand-dark prose-p:text-neutral-600 prose-p:leading-relaxed">
            {city.seoContent.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          {/* Inline CTA */}
          <div className="mt-12 bg-brand-dark rounded-sm p-8 lg:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h3 className="font-serif text-xl lg:text-2xl font-bold text-white mb-2">
                Ready to find your home in {city.name}?
              </h3>
              <p className="text-blue-200 text-sm leading-relaxed max-w-lg">
                Apply online in under 10 minutes. We review every application within 24 hours — no hidden fees, no runaround.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Button variant="accent" asChild>
                <Link href="/apply">Apply Now</Link>
              </Button>
              <Button variant="outline-white" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── EXPLORE OTHER CITIES ─────────────────────────────────── */}
      <section className="bg-white border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
          <p className="text-brand text-xs font-semibold tracking-[0.2em] uppercase mb-2">Explore More</p>
          <h2 className="font-serif text-2xl lg:text-3xl font-bold text-brand-dark mb-8">
            Affordable Rentals in Other Cities
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.values(CITIES)
              .filter((c) => c.slug !== slug)
              .slice(0, 8)
              .map((c) => (
                <Link
                  key={c.slug}
                  href={`/rentals/${c.slug}`}
                  className="group relative aspect-[4/3] rounded-sm overflow-hidden bg-neutral-100"
                >
                  <Image
                    src={c.heroImage}
                    alt={`Affordable rentals in ${c.name}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-serif font-bold text-lg leading-tight">{c.name}</p>
                    <p className="text-blue-200 text-xs mt-0.5">From {c.avgRent}/mo</p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
