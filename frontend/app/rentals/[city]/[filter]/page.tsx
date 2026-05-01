import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, Home, Bed, Bath, MapPin, Building2 } from "lucide-react";
import {
  CITIES, getAllCitySlugs, fetchAllCities, resolveCityData, type CityData,
} from "@/lib/cities";
import { fetchProperties, toPropertyCardShape } from "@/lib/properties";
import { PropertyCard } from "@/components/public/PropertyCard";
import { Button } from "@/components/ui/Button";

export const revalidate = 300;

/* ── Filter parsing ─────────────────────────────────────────────────── */

const PROPERTY_TYPE_MAP = {
  "condos":            { apiType: "condo",       label: "Condo",            plural: "Condos" },
  "townhouses":        { apiType: "townhouse",    label: "Townhouse",        plural: "Townhouses" },
  "residential-homes": { apiType: "residential",  label: "Residential Home", plural: "Residential Homes" },
  "commercial-spaces": { apiType: "commercial",   label: "Commercial Space", plural: "Commercial Spaces" },
  "land-lots":         { apiType: "land",          label: "Land / Lot",       plural: "Land & Lots" },
} as const;

type FilterSpec =
  | { kind: "bedroom"; count: number }
  | { kind: "property_type"; apiType: string; label: string; plural: string };

function parseFilter(filter: string): FilterSpec | null {
  const bedMatch = filter.match(/^(\d+)-bedroom$/);
  if (bedMatch) {
    const n = parseInt(bedMatch[1], 10);
    if (n >= 1 && n <= 10) return { kind: "bedroom", count: n };
  }
  const typeData = PROPERTY_TYPE_MAP[filter as keyof typeof PROPERTY_TYPE_MAP];
  if (typeData) return { kind: "property_type", ...typeData };
  return null;
}

function getFilterLabel(spec: FilterSpec): string {
  return spec.kind === "bedroom" ? `${spec.count}-Bedroom` : spec.plural;
}

/* ── Static params ──────────────────────────────────────────────────── */

export async function generateStaticParams() {
  const dbCities = await fetchAllCities();
  const all = [...new Set([...getAllCitySlugs(), ...dbCities.map((c) => c.slug)])];
  const filters = [
    "condos", "townhouses", "residential-homes", "commercial-spaces", "land-lots",
    "1-bedroom", "2-bedroom", "3-bedroom", "4-bedroom", "5-bedroom",
  ];
  return all.flatMap((city) => filters.map((filter) => ({ city, filter })));
}

/* ── Metadata ───────────────────────────────────────────────────────── */

export async function generateMetadata(
  { params }: { params: Promise<{ city: string; filter: string }> }
): Promise<Metadata> {
  const { city: slug, filter } = await params;
  const spec = parseFilter(filter);
  if (!spec) return { title: "Not Found" };

  const city = await resolveCityData(slug);
  if (!city) return { title: "Not Found" };

  const filterLabel = getFilterLabel(spec);
  const title = `${filterLabel} Rentals in ${city.name}, ${city.stateCode} | Hasker & Co. Realty Group`;
  const description = `Find ${filterLabel.toLowerCase()} rentals in ${city.name}, ${city.stateCode}. Transparent pricing, no hidden fees, 24-hour approval decisions. Browse current availability.`;
  const url = `https://haskerrealtygroup.com/rentals/${slug}/${filter}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, type: "website", url },
  };
}

/* ── Page component ─────────────────────────────────────────────────── */

export default async function CityFilterPage(
  { params }: { params: Promise<{ city: string; filter: string }> }
) {
  const { city: slug, filter } = await params;

  const spec = parseFilter(filter);
  if (!spec) notFound();

  const city = await resolveCityData(slug);
  if (!city) notFound();

  const filterLabel = getFilterLabel(spec);
  const pageUrl = `https://haskerrealtygroup.com/rentals/${slug}/${filter}`;

  // Fetch filtered properties
  let properties: import("@/types").Property[] = [];
  let totalCount = 0;
  try {
    const fetchParams: import("@/lib/properties").FetchPropertiesParams = {
      q: city.name,
      listing_type: "for-rent",
      page_size: "12",
    };
    if (spec.kind === "bedroom") {
      fetchParams.beds = String(spec.count);
    } else {
      fetchParams.type = spec.apiType;
    }
    const data = await fetchProperties(fetchParams);
    properties = data.results.map(toPropertyCardShape);
    totalCount = data.count;
  } catch {
    // API down — renders empty state
  }

  // Sibling filter links
  const siblingFilters = [
    { slug: "condos",            label: "Condos" },
    { slug: "townhouses",        label: "Townhouses" },
    { slug: "residential-homes", label: "Homes" },
    { slug: "1-bedroom",         label: "1 Bed" },
    { slug: "2-bedroom",         label: "2 Bed" },
    { slug: "3-bedroom",         label: "3 Bed" },
    { slug: "4-bedroom",         label: "4 Bed" },
  ].filter((f) => f.slug !== filter);

  // JSON-LD schemas
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${filterLabel} Rentals in ${city.name}, ${city.stateCode}`,
    description: `Browse ${filterLabel.toLowerCase()} rental listings in ${city.name}, ${city.stateCode}. No hidden fees, 24-hour decisions.`,
    url: pageUrl,
    isPartOf: { "@type": "WebSite", name: "Hasker & Co. Realty Group", url: "https://haskerrealtygroup.com" },
    about: {
      "@type": "City",
      name: city.name,
      containedInPlace: { "@type": "State", name: city.stateCode, containedInPlace: { "@type": "Country", name: "United States" } },
    },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",       item: "https://haskerrealtygroup.com" },
      { "@type": "ListItem", position: 2, name: "Properties", item: "https://haskerrealtygroup.com/properties" },
      { "@type": "ListItem", position: 3, name: `${city.name}, ${city.stateCode}`, item: `https://haskerrealtygroup.com/rentals/${slug}` },
      { "@type": "ListItem", position: 4, name: filterLabel,  item: pageUrl },
    ],
  };

  const faqItems =
    spec.kind === "bedroom"
      ? [
          {
            q: `How much does a ${spec.count}-bedroom rental cost in ${city.name}?`,
            a: `${spec.count}-bedroom rentals in ${city.name} start around ${city.avgRent}/month. Hasker & Co. offers transparent pricing with no hidden fees on every listing.`,
          },
          {
            q: `Are ${spec.count}-bedroom homes available to rent in ${city.name}?`,
            a: `Yes. Hasker & Co. Realty Group maintains verified ${spec.count}-bedroom rental listings in ${city.name}. Browse current availability above and apply in under 10 minutes.`,
          },
        ]
      : [
          {
            q: `Are there ${spec.plural.toLowerCase()} for rent in ${city.name}?`,
            a: `Yes. Hasker & Co. lists verified ${spec.plural.toLowerCase()} in ${city.name} with transparent pricing and no hidden fees. Current listings are shown above.`,
          },
          {
            q: `How much does it cost to rent a ${spec.label.toLowerCase()} in ${city.name}?`,
            a: `Rental prices for ${spec.plural.toLowerCase()} in ${city.name} vary by size and location. Check our current listings above for up-to-date pricing starting around ${city.avgRent}/month.`,
          },
        ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-[380px] lg:min-h-[420px] flex items-end overflow-hidden">
        <Image
          src={city.heroImage}
          alt={`${filterLabel} rentals in ${city.name}, ${city.stateCode}`}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-brand-dark/20" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 pb-12 pt-28">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex items-center gap-2 text-xs text-blue-200">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li className="text-blue-400">/</li>
              <li><Link href="/properties" className="hover:text-white transition-colors">Properties</Link></li>
              <li className="text-blue-400">/</li>
              <li><Link href={`/rentals/${slug}`} className="hover:text-white transition-colors">{city.name}, {city.stateCode}</Link></li>
              <li className="text-blue-400">/</li>
              <li className="text-white font-medium">{filterLabel}</li>
            </ol>
          </nav>

          <p className="text-brand text-xs font-semibold tracking-[0.2em] uppercase mb-2">
            {city.stateCode} · {filterLabel}
          </p>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-white leading-tight">
            {filterLabel} Rentals in {city.name}, {city.stateCode}
          </h1>
          {totalCount > 0 && (
            <p className="text-blue-200 text-base mt-3">
              {totalCount} listing{totalCount !== 1 ? "s" : ""} available now
            </p>
          )}

          <div className="flex flex-wrap gap-3 mt-6">
            <Button variant="accent" size="lg" asChild>
              <Link href={`/properties?q=${encodeURIComponent(city.name)}&type=${spec.kind === "property_type" ? spec.apiType : ""}&beds=${spec.kind === "bedroom" ? spec.count : ""}`}>
                Browse {filterLabel} Listings
                <ArrowRight size={16} />
              </Link>
            </Button>
            <Button variant="outline-white" size="lg" asChild>
              <Link href="/apply">Apply Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── FILTER PILLS ──────────────────────────────────────────────── */}
      <section className="bg-brand-dark border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <span className="text-blue-300 text-xs font-medium shrink-0 mr-1">Also in {city.name}:</span>
            {siblingFilters.map((f) => (
              <Link
                key={f.slug}
                href={`/rentals/${slug}/${f.slug}`}
                className="shrink-0 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
              >
                {f.label}
              </Link>
            ))}
            <Link
              href={`/rentals/${slug}`}
              className="shrink-0 px-3 py-1.5 rounded-full border border-white/20 hover:bg-white/10 text-blue-200 text-xs font-medium transition-colors"
            >
              All {city.name} rentals
            </Link>
          </div>
        </div>
      </section>

      {/* ── PROPERTY GRID ─────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 lg:py-18">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-brand text-xs font-semibold tracking-[0.2em] uppercase mb-2">Available Now</p>
              <h2 className="font-serif text-3xl lg:text-4xl font-bold text-brand-dark">
                {filterLabel} in {city.name}
              </h2>
            </div>
            {totalCount > 12 && (
              <Link
                href={`/properties?q=${encodeURIComponent(city.name)}`}
                className="hidden sm:flex items-center gap-2 text-sm text-brand font-medium hover:underline"
              >
                View all {totalCount} listings
                <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-neutral-100 rounded-sm bg-neutral-50">
              <Building2 size={40} className="mx-auto text-neutral-300 mb-4" />
              <h3 className="font-serif text-xl font-bold text-brand-dark mb-2">
                No {filterLabel.toLowerCase()} available right now
              </h3>
              <p className="text-neutral-500 text-sm mb-6 max-w-sm mx-auto">
                Our inventory changes weekly. Browse all {city.name} listings or get notified when one becomes available.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="accent" asChild>
                  <Link href={`/rentals/${slug}`}>All {city.name} Rentals</Link>
                </Button>
                <Button variant="outline-blue" asChild>
                  <Link href="/properties">Browse All Cities</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="bg-brand-dark text-white py-16 lg:py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <p className="text-blue-300 text-xs font-semibold tracking-[0.3em] uppercase mb-3">Common Questions</p>
            <h2 className="font-serif text-3xl font-bold">
              {filterLabel} Rentals in {city.name} — FAQ
            </h2>
          </div>
          <div className="space-y-3">
            {faqItems.map((faq) => (
              <details key={faq.q} className="group border border-white/10 rounded-sm overflow-hidden bg-white/5">
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

      {/* ── BACK TO CITY ──────────────────────────────────────────────── */}
      <section className="bg-white border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-serif text-xl font-bold text-brand-dark">
              Not finding the right fit?
            </p>
            <p className="text-neutral-500 text-sm mt-1">
              Browse all available rentals in {city.name} or apply and tell us what you need.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button variant="outline-blue" asChild>
              <Link href={`/rentals/${slug}`}>All {city.name} Rentals</Link>
            </Button>
            <Button variant="accent" asChild>
              <Link href="/apply">Apply Now <ArrowRight size={14} /></Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
