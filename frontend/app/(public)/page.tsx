import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroSearch } from "@/components/public/HeroSearch";
import { FeaturedPropertiesSection } from "@/components/public/FeaturedPropertiesSection";
import { WorkersScene, PetScene } from "@/components/public/HomepageIllustrations";
import { fetchHomepageProperties, fetchProperties, toPropertyCardShape } from "@/lib/properties";
import { formatPrice } from "@/lib/utils";
import { CITIES, fetchAllCities, buildGenericCityData, type CityData } from "@/lib/cities";

export const metadata = {
  title: "Hasker & Co. Realty Group | Affordable Homes to Rent & Buy",
  description:
    "Hasker & Co. Realty Group — find affordable homes to rent and buy across Atlanta, Charlotte, Houston, Dallas, Nashville and Phoenix. Decisions in 24 hrs.",
  keywords: [
    "affordable homes for rent",
    "cheap apartments near me",
    "houses for rent Atlanta",
    "affordable rentals Charlotte",
    "cheap homes Houston",
    "rental homes Dallas",
    "affordable housing Nashville",
    "homes for sale affordable",
    "move-in ready rental",
    "24 hour rental approval",
    "pet friendly rentals",
    "rent with bad credit",
    "2 bedroom apartments for rent",
    "3 bedroom houses for rent affordable",
    "affordable housing for families",
    "first time renter apartments",
  ],
  openGraph: {
    title: "Hasker & Co. Realty Group | Affordable Homes to Rent & Buy",
    description: "Hasker & Co. Realty Group — quality homes, well-maintained and move-in ready. Fast approvals. 12+ cities.",
    type: "website",
    url: "https://haskerrealtygroup.com",
    images: [{ url: "https://haskerrealtygroup.com/opengraph-image", width: 1200, height: 630, alt: "Hasker & Co. Realty Group — Affordable Homes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hasker & Co. Realty Group | Affordable Homes to Rent & Buy",
    description: "Hasker & Co. Realty Group — quality homes, well-maintained and move-in ready. Fast approvals. 12+ cities.",
    images: ["https://haskerrealtygroup.com/opengraph-image"],
    creator: "@haskerrealty",
  },
  alternates: { canonical: "https://haskerrealtygroup.com" },
};

export const revalidate = 300;

const BASE_URL = "https://haskerrealtygroup.com";

const LOCAL_BUSINESS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "@id": `${BASE_URL}/#local-business`,
  name: "Hasker & Co. Realty Group",
  legalName: "Hasker & Co. Realty Group",
  alternateName: ["Hasker Realty Group", "Hasker Realty", "Hasker and Co Realty Group", "Hasker & Co Realty"],
  parentOrganization: { "@id": `${BASE_URL}/#organization` },
  url: BASE_URL,
  logo: `${BASE_URL}/logo.svg`,
  image: `${BASE_URL}/opengraph-image`,
  description: "Hasker & Co. Realty Group — affordable homes to rent and buy. Quality homes, move-in ready, fast decisions. 2,000+ families housed across 12+ US cities since 2012.",
  email: "info@haskerrealtygroup.com",
  priceRange: "$$",
  foundingDate: "2012",
  address: {
    "@type": "PostalAddress",
    streetAddress: "204 Colonial Hills Rd",
    addressLocality: "Winder",
    addressRegion: "GA",
    postalCode: "30680",
    addressCountry: "US",
  },
  geo: { "@type": "GeoCoordinates", latitude: 33.9940, longitude: -83.7196 },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "09:00", closes: "18:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday"], opens: "10:00", closes: "16:00" },
  ],
  areaServed: [
    "Atlanta, GA", "Charlotte, NC", "Houston, TX", "Dallas, TX", "Nashville, TN", "Phoenix, AZ",
    "Austin, TX", "Miami, FL", "Denver, CO", "Seattle, WA", "Las Vegas, NV", "Tampa, FL",
    "Raleigh, NC", "Orlando, FL", "San Antonio, TX", "Jacksonville, FL", "Philadelphia, PA",
  ],
  sameAs: [
    "https://www.instagram.com/haskerrealty",
    "https://www.linkedin.com/company/haskerrealty",
    "https://twitter.com/haskerrealty",
    "https://www.facebook.com/haskerrealty",
  ],
};

const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Hasker & Co. Realty Group",
  url: BASE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/homes-for-rent?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${BASE_URL}/#organization`,
  name: "Hasker & Co. Realty Group",
  legalName: "Hasker & Co. Realty Group",
  alternateName: ["Hasker Realty Group", "Hasker Realty", "Hasker and Co Realty Group", "Hasker & Co Realty"],
  url: BASE_URL,
  logo: `${BASE_URL}/logo.svg`,
  email: "info@haskerrealtygroup.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "204 Colonial Hills Rd",
    addressLocality: "Winder",
    addressRegion: "GA",
    postalCode: "30680",
    addressCountry: "US",
  },
  contactPoint: { "@type": "ContactPoint", email: "info@haskerrealtygroup.com", contactType: "customer service", availableLanguage: "English" },
  sameAs: [
    "https://www.instagram.com/haskerrealty",
    "https://www.linkedin.com/company/haskerrealty",
    "https://twitter.com/haskerrealty",
    "https://www.facebook.com/haskerrealty",
  ],
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What is Hasker Realty Group?", acceptedAnswer: { "@type": "Answer", text: "Hasker Realty Group — officially named Hasker & Co. Realty Group — is a licensed US real estate company founded in 2012 and headquartered in Winder, GA. The company specializes in affordable rental homes and budget-friendly properties for sale across 12+ US cities." } },
    { "@type": "Question", name: "How long does it take to get approved for a rental?", acceptedAnswer: { "@type": "Answer", text: "Hasker & Co. Realty Group reviews every rental application within 24 hours. You can apply online in under 10 minutes at haskerrealtygroup.com/apply." } },
    { "@type": "Question", name: "Does Hasker & Co. Realty Group charge hidden fees?", acceptedAnswer: { "@type": "Answer", text: "No. The listed price is what you pay. No administrative processing fees or convenience surcharges beyond the standard security deposit." } },
    { "@type": "Question", name: "Can I rent with bad credit through Hasker & Co. Realty Group?", acceptedAnswer: { "@type": "Answer", text: "Hasker & Co. Realty Group reviews applications individually and works with renters who have imperfect credit or limited rental history." } },
    { "@type": "Question", name: "Does Hasker & Co. Realty Group have pet-friendly rentals?", acceptedAnswer: { "@type": "Answer", text: "Yes. Many of our rental listings across Atlanta, Charlotte, Houston, Dallas and other cities are pet-friendly. Pet policies are disclosed upfront on every listing." } },
  ],
};

const BREADCRUMB_HOME = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: BASE_URL }],
};

const AGGREGATE_RATING_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${BASE_URL}/#aggregate-rating`,
  name: "Hasker & Co. Realty Group",
  url: BASE_URL,
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", bestRating: "5", worstRating: "1", ratingCount: "2400", reviewCount: "2400" },
};

const HOW_IT_WORKS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Rent a Home with Hasker & Co. Realty Group",
  description: "Apply for an affordable rental home in 3 simple steps. Decisions within 24 hours.",
  totalTime: "PT10M",
  estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
  step: [
    { "@type": "HowToStep", position: 1, name: "Browse available homes", text: "Filter by city, beds, and budget. Every listing has photos, full pricing, and pet policy.", url: `${BASE_URL}/homes-for-rent` },
    { "@type": "HowToStep", position: 2, name: "Apply in 10 minutes", text: "One online form. No paperwork run-around. Reviewed within 24 hours.", url: `${BASE_URL}/apply` },
    { "@type": "HowToStep", position: 3, name: "Move in", text: "Sign your lease, pay your deposit, get your keys. We handle the rest.", url: `${BASE_URL}/apply` },
  ],
};

const howItWorks = [
  { n: "01", title: "Browse available homes",  desc: "Filter by city, beds, and budget. Every listing has photos, full pricing, and pet policy." },
  { n: "02", title: "Apply in 10 minutes",     desc: "One online form. No paperwork run-around. Reviewed within 24 hours." },
  { n: "03", title: "Move in",                 desc: "Sign your lease, pay your deposit, get your keys. We handle the rest." },
];

const maintenancePromises = [
  { h: "30-point pre-listing inspection",  d: "Every home is checked before a single photo goes online. If it can't pass, it isn't listed." },
  { h: "Same-day maintenance response",    d: "Submit a request in the portal — a real person responds within the business day. No 7-day ticket queues." },
  { h: "In-house team, not third-party",   d: "Our own technicians service every home. They know the property, you, and the history." },
];

const whyPillars = [
  { num: "01", title: "Prices you can trust",        desc: "What you see is what you pay. We never inflate rents or add surprise move-in fees." },
  { num: "02", title: "24-hour decisions",            desc: "Apply in under 10 minutes. We review every application and respond within a day." },
  { num: "03", title: "Maintenance that shows up",   desc: "Submit a request, get a same-day response. We don't leave you waiting." },
  { num: "04", title: "Your whole family welcome",   desc: "Kids, pets, extended family. Most of our homes are pet-friendly. No breed restrictions on many." },
];

const faqs = [
  { q: "How long does it take to get approved?",               a: "Every application gets reviewed within 24 hours. Most renters hear back the same business day." },
  { q: "Do you charge hidden fees or admin charges?",          a: "No. The listed price is what you pay. Standard security deposit and that's it — no admin fees, no convenience surcharges." },
  { q: "Can I apply with limited credit or rental history?",   a: "Yes. We review every application individually and look at your full financial picture — not just a credit score." },
  { q: "Are pets allowed?",                                    a: "Most of our homes are pet-friendly. Each listing shows the policy up front. Pet deposits and rent vary by home." },
  { q: "How do I tour a property?",                            a: "Pick a time on any listing — in-person, video, or phone. A specialist confirms within 24 hours." },
  { q: "Do you handle maintenance after I move in?",           a: "Yes. Submit a request in the tenant portal and our team responds same day. We don't leave you waiting." },
];

const petTags = ["Dogs welcome", "Cats welcome", "$300 pet deposit", "$25/mo pet rent", "No breed restrictions"];

export default async function HomePage() {
  const [featuredRaw, totalCountRaw, allCitiesRaw] = await Promise.allSettled([
    fetchHomepageProperties(),
    fetchProperties(),
    fetchAllCities(),
  ]);

  const homepagePinned   = featuredRaw.status === "fulfilled" ? featuredRaw.value : [];
  const generalResults   = totalCountRaw.status === "fulfilled" ? (totalCountRaw.value.results ?? []) : [];
  const pinnedIds        = new Set(homepagePinned.map((p) => p.id));
  const featuredProperties = [
    ...homepagePinned,
    ...generalResults.filter((p) => !pinnedIds.has(p.id)),
  ].slice(0, 6).map(toPropertyCardShape);

  const totalProperties = totalCountRaw.status === "fulfilled" ? totalCountRaw.value.count : null;

  const dbCities = allCitiesRaw.status === "fulfilled" ? allCitiesRaw.value : [];
  const mergedCities: CityData[] = [
    ...Object.values(CITIES),
    ...dbCities.filter((c) => !CITIES[c.slug]).map((c) => buildGenericCityData(c)),
  ];

  return (
    <main>
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_HOME) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(AGGREGATE_RATING_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(HOW_IT_WORKS_SCHEMA) }} />

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden text-center" style={{ minHeight: 620 }}>
        <Image
          src="https://images.unsplash.com/photo-1560184897-ae75f418493e?w=1920&q=85"
          alt="Beautiful home available through Hasker & Co. Realty Group"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(11,31,58,0.25) 0%, rgba(11,31,58,0.65) 100%)" }} />

        <div className="relative z-10 w-full flex flex-col items-center px-5 sm:px-8 pt-28 pb-16">
          {/* Available pill */}
          <div className="inline-flex items-center gap-2 mb-6" style={{ background: "rgba(255,255,255,0.10)", backdropFilter: "blur(8px)", padding: "6px 14px", borderRadius: 9999 }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-[11px] font-semibold tracking-[0.22em] uppercase" style={{ color: "rgba(255,255,255,0.85)" }}>
              {totalProperties != null ? `${totalProperties} homes available now` : "Homes Available Now"}
            </span>
          </div>

          {/* H1 */}
          <h1 className="font-serif font-bold text-white leading-[1.05] mb-[18px] text-[2.6rem] sm:text-[3.5rem] lg:text-[4.5rem]" style={{ letterSpacing: "-0.02em", maxWidth: 900 }}>
            Best-maintained homes for rent,<br className="hidden sm:block" /> in 12+ U.S. cities.
          </h1>

          {/* Subhead */}
          <p className="text-[18px] leading-[1.55] mb-9 max-w-[540px]" style={{ color: "rgba(255,255,255,0.82)" }}>
            Well-maintained rentals at honest prices. No hidden fees. Decisions in 24 hours.
          </p>

          {/* Search */}
          <div className="w-full max-w-[760px] mb-7">
            <HeroSearch />
          </div>

          {/* Trust micro-line */}
          <p className="text-[12px] tracking-[0.05em]" style={{ color: "rgba(255,255,255,0.55)" }}>
            2,400+ families housed · BBB A+ · 4.9 on Trustpilot
          </p>
        </div>
      </section>

      {/* ── STATS STRIP ───────────────────────────────────────────── */}
      <section style={{ background: "#0B1F3A", color: "#fff" }}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {[
              { v: totalProperties != null ? String(totalProperties) : "—", l: "Homes available",      s: "right now" },
              { v: "2,400+",                                                  l: "Families housed",      s: "since 2012" },
              { v: "12+",                                                     l: "U.S. cities",          s: "and growing" },
              { v: "24h",                                                     l: "Application decisions", s: "typical review" },
            ].map((stat, i) => (
              <div key={stat.l} className="px-6 py-10" style={{ borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.12)" : "none" }}>
                <div className="font-serif font-bold text-white leading-none" style={{ fontSize: 44, letterSpacing: "-0.02em" }}>{stat.v}</div>
                <div className="font-semibold mt-[10px]" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.85)" }}>{stat.l}</div>
                <div className="mt-[3px]" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.04em" }}>{stat.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED RENTALS ──────────────────────────────────────── */}
      <FeaturedPropertiesSection properties={featuredProperties} totalCount={totalProperties} />

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section style={{ background: "#EFF4FF" }} className="py-[88px] px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-brand">Simple process</p>
            <h2 className="font-serif font-bold text-brand-dark leading-[1.12] mt-3" style={{ fontSize: 38, letterSpacing: "-0.015em" }}>
              From search to keys, in three steps.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 bg-white border border-[#F1F5F9]">
            {howItWorks.map((step, i) => (
              <div key={step.n} className="p-10" style={{ borderRight: i < 2 ? "1px solid #F1F5F9" : "none" }}>
                <div className="font-serif font-bold leading-none mb-5" style={{ fontSize: 64, color: "#DBEAFE" }}>{step.n}</div>
                <h3 className="font-serif font-bold text-brand-dark leading-[1.2] mb-[10px]" style={{ fontSize: 22 }}>{step.title}</h3>
                <p className="leading-[1.6]" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "#475569" }}>{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 bg-brand-dark text-white text-[14px] font-medium tracking-[0.05em] h-[50px] px-7 rounded-sm hover:bg-brand transition-colors"
            >
              Start a free application <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── MAINTENANCE PITCH ─────────────────────────────────────── */}
      <section className="py-[88px] px-8 border-t border-[#F1F5F9]" style={{ background: "#FBF9F4" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Illustration */}
            <div className="border border-[#F1F5F9] bg-white rounded-sm overflow-hidden">
              <WorkersScene />
            </div>
            {/* Copy */}
            <div>
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-brand">Quality you can see</p>
              <h2 className="font-serif font-bold text-brand-dark leading-[1.12] mt-[14px] mb-[14px]" style={{ fontSize: 42, letterSpacing: "-0.015em" }}>
                The best-maintained rentals on the market.
              </h2>
              <p className="leading-[1.65] mb-7" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15.5, color: "#475569", maxWidth: 460 }}>
                We don&apos;t list homes we wouldn&apos;t live in. Every property is inspected, cleaned, and turned by our in-house maintenance team before move-in — then supported the same way after.
              </p>
              <div className="flex flex-col gap-[18px]">
                {maintenancePromises.map((pr) => (
                  <div key={pr.h} className="grid gap-[14px] items-start" style={{ gridTemplateColumns: "22px 1fr" }}>
                    <div className="mt-1 w-[18px] h-[18px] rounded-full bg-brand flex items-center justify-center shrink-0">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold mb-[3px]" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14.5, color: "#0B1F3A" }}>{pr.h}</div>
                      <div className="leading-[1.55]" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "#475569" }}>{pr.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CITIES ────────────────────────────────────────────────── */}
      <section className="py-[88px] px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-brand">Where we operate</p>
              <h2 className="font-serif font-bold text-brand-dark leading-[1.12] mt-3" style={{ fontSize: 38, letterSpacing: "-0.015em" }}>
                Cities we serve.
              </h2>
              <p className="mt-3 max-w-[460px] leading-[1.6]" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "#475569" }}>
                Affordable rentals in Atlanta, Charlotte, Houston, Dallas, Nashville, Phoenix, Austin, Miami, Denver, Seattle, Las Vegas, and Tampa.
              </p>
            </div>
            <Link
              href="/homes-for-rent"
              className="shrink-0 inline-flex items-center gap-1.5 text-brand text-[14px] font-medium hover:opacity-80 transition-opacity"
            >
              See all cities <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {mergedCities.slice(0, 6).map((city) => (
              <Link
                key={city.slug}
                href={`/rentals/${city.slug}`}
                className="relative rounded-sm overflow-hidden block hover:opacity-90 transition-opacity"
                style={{ aspectRatio: "3 / 4" }}
              >
                <Image
                  src={city.heroImage}
                  alt={`Homes for rent in ${city.name}`}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(11,31,58,0) 40%, rgba(11,31,58,0.85) 100%)" }} />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <div className="font-serif font-bold leading-[1.1]" style={{ fontSize: 20 }}>{city.name}</div>
                  <div className="mt-0.5" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
                    {city.state} · from {city.avgRent}/mo
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PET PITCH ─────────────────────────────────────────────── */}
      <section className="py-[88px] px-8 bg-white border-t border-[#F1F5F9]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-brand">Paws welcome</p>
              <h2 className="font-serif font-bold text-brand-dark leading-[1.12] mt-[14px] mb-[14px]" style={{ fontSize: 42, letterSpacing: "-0.015em" }}>
                Bring your whole family.
              </h2>
              <p className="leading-[1.65] mb-6" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15.5, color: "#475569", maxWidth: 460 }}>
                Most of our homes welcome pets. No breed restrictions on the majority of listings, transparent deposits, and a tenant team that&apos;s genuinely happy you brought the dog.
              </p>
              <div className="flex flex-wrap gap-2 mb-7">
                {petTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center border border-[#F1F5F9] rounded-sm"
                    style={{ background: "#FBF9F4", color: "#0B1F3A", fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: 500, padding: "7px 12px" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                href="/homes-for-rent?q=pet"
                className="inline-flex items-center gap-1.5 text-brand text-[14px] font-medium hover:opacity-80 transition-opacity"
              >
                Browse pet-friendly rentals <ArrowRight size={14} />
              </Link>
            </div>
            {/* Illustration */}
            <div className="border border-[#F1F5F9] bg-white rounded-sm overflow-hidden">
              <PetScene />
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY HASKER ────────────────────────────────────────────── */}
      <section className="py-[88px] px-8 bg-white border-t border-[#F1F5F9]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-20 items-start">
            {/* Sticky left */}
            <div className="lg:sticky lg:top-24">
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-brand">Why Hasker &amp; Co.</p>
              <h2 className="font-serif font-bold text-brand-dark leading-[1.12] mt-3" style={{ fontSize: 42, letterSpacing: "-0.015em" }}>
                Quality homes.<br />Honest pricing.<br />Real support.
              </h2>
              <p className="mt-6 leading-[1.65]" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "#475569", maxWidth: 280 }}>
                Everyone deserves a quality home they can actually afford. We cut through the noise — no inflated prices, no hidden fees, no bait-and-switch listings.
              </p>
            </div>
            {/* Pillars */}
            <div>
              {whyPillars.map((pillar, i) => (
                <div
                  key={pillar.num}
                  className="grid gap-6 items-baseline py-7"
                  style={{ gridTemplateColumns: "80px 1fr", borderTop: i > 0 ? "1px solid #F1F5F9" : "none" }}
                >
                  <div className="font-serif font-bold leading-none" style={{ fontSize: 36, color: "#DBEAFE" }}>{pillar.num}</div>
                  <div>
                    <h3 className="font-serif font-bold text-brand-dark mb-2" style={{ fontSize: 22 }}>{pillar.title}</h3>
                    <p className="leading-[1.65]" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "#475569" }}>{pillar.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="py-[88px] px-8 border-t border-[#F1F5F9]" style={{ background: "#FBF9F4" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-brand">Common questions</p>
            <h2 className="font-serif font-bold text-brand-dark leading-[1.12] mt-3" style={{ fontSize: 38, letterSpacing: "-0.015em" }}>
              Renter FAQs.
            </h2>
          </div>
          <div className="mx-auto" style={{ maxWidth: 820 }}>
            {faqs.map((faq, i) => (
              <details key={i} className="group py-5 border-t border-[#F1F5F9]" open={i === 0}>
                <summary
                  className="flex items-center justify-between cursor-pointer font-serif font-bold text-brand-dark leading-[1.3] list-none"
                  style={{ fontSize: 19 }}
                >
                  <span>{faq.q}</span>
                  <span className="shrink-0 ml-4 text-brand text-[20px] leading-none select-none group-open:hidden">+</span>
                  <span className="shrink-0 ml-4 text-brand text-[20px] leading-none select-none hidden group-open:inline">−</span>
                </summary>
                <p className="leading-[1.65] mt-3.5" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: "#475569", maxWidth: 720 }}>{faq.a}</p>
              </details>
            ))}
            <div className="border-t border-[#F1F5F9]" />
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────── */}
      <section className="py-[88px] px-8 text-center" style={{ background: "#0B1F3A", color: "#fff" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-[11px] font-semibold tracking-[0.3em] uppercase" style={{ color: "#A9C5F6" }}>Ready when you are</p>
          <h2 className="font-serif font-bold text-white leading-[1.05] mt-3.5" style={{ fontSize: 48, letterSpacing: "-0.02em" }}>
            Find your next home.
          </h2>
          <p className="leading-[1.6] mt-[18px] mb-8 mx-auto" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 16, color: "rgba(255,255,255,0.7)", maxWidth: 540 }}>
            Browse {totalProperties ?? "hundreds of"} move-in ready rentals across 12 cities. Decisions in 24 hours. No hidden fees.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/homes-for-rent"
              className="inline-flex items-center justify-center gap-2 bg-brand text-white h-[50px] px-7 rounded-sm text-[14px] font-medium tracking-[0.05em] hover:bg-brand-hover transition-colors"
            >
              Browse homes <ArrowRight size={14} />
            </Link>
            <Link
              href="/apply"
              className="inline-flex items-center justify-center h-[50px] px-7 rounded-sm text-[14px] font-medium tracking-[0.05em] transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.4)", color: "#fff" }}
            >
              Start an application
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
