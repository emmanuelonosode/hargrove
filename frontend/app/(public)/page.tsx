import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, Home, Users, Clock, CheckCircle, MapPin } from "lucide-react";
import { SearchBar } from "@/components/public/SearchBar";
import { PropertyCard } from "@/components/public/PropertyCard";
import { Button } from "@/components/ui/Button";
import { fetchFeaturedProperties, fetchProperties, toPropertyCardShape } from "@/lib/properties";
import { fetchAgents } from "@/lib/agents";
import { fetchPosts } from "@/lib/blog";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Affordable Homes to Rent & Buy | Hasker & Co. Realty Group",
  description:
    "Find your affordable home with Hasker & Co. Realty Group. Cheap rentals and homes for sale in Atlanta, Charlotte, Houston, Dallas, Nashville and Phoenix. No hidden fees. Decisions in 24 hrs.",
  keywords: [
    "affordable homes for rent",
    "cheap apartments near me",
    "houses for rent Atlanta",
    "affordable rentals Charlotte",
    "cheap homes Houston",
    "rental homes Dallas",
    "affordable housing Nashville",
    "homes for sale affordable",
  ],
  openGraph: {
    title: "Affordable Homes to Rent & Buy | Hasker & Co. Realty Group",
    description: "Quality homes at honest prices. No hidden fees. Fast approvals. 12+ cities.",
    type: "website",
    url: "https://haskerrealtygroup.com",
  },
  alternates: { canonical: "https://haskerrealtygroup.com" },
};

// Static marketing stats (non-dynamic values remain honest copy)
const marketingStats = [
  { icon: Users,        label: "Families Housed", value: "2,000+", sublabel: "and counting" },
  { icon: CheckCircle,  label: "Cities Covered",  value: "12+",   sublabel: "and growing" },
  { icon: Clock,        label: "Response Time",   value: "24hr",  sublabel: "application review" },
];

const howItWorks = [
  {
    step: "01",
    title: "Search Available Rentals",
    desc: "Browse our current listings by city, price range, and bedroom count. Filter for pet-friendly units, short-term leases, and more.",
  },
  {
    step: "02",
    title: "Schedule a Viewing",
    desc: "Found something you like? Book a tour online or give us a call. We offer same-day showings for most properties.",
  },
  {
    step: "03",
    title: "Apply Online in Minutes",
    desc: "Our simple online application takes less than 10 minutes. Decisions within 24–48 hours. No unnecessary paperwork.",
  },
  {
    step: "04",
    title: "Move In",
    desc: "Sign your lease digitally, pay your deposit, and get your keys. Our team is here to support you throughout your tenancy.",
  },
];

export const revalidate = 300;

const BASE_URL = "https://haskerrealtygroup.com";

const LOCAL_BUSINESS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Hasker & Co. Realty Group",
  url: BASE_URL,
  logo: `${BASE_URL}/logo.svg`,
  image: `${BASE_URL}/og-image.jpg`,
  description:
    "Affordable homes to rent and buy. Honest prices, no hidden fees, fast decisions. 2,000+ families housed across 12+ cities since 2012.",
  email: "info@haskerrealtygroup.com",
  priceRange: "$$",
  foundingDate: "2012",
  address: {
    "@type": "PostalAddress",
    streetAddress: "213 Bob Ln",
    addressLocality: "Virginia Beach",
    addressRegion: "VA",
    postalCode: "23454",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 36.7335,
    longitude: -76.0435,
  },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "09:00", closes: "18:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday"], opens: "10:00", closes: "16:00" },
  ],
  areaServed: [
    "Atlanta, GA", "Charlotte, NC", "Houston, TX",
    "Dallas, TX", "Nashville, TN", "Phoenix, AZ",
    "Austin, TX", "Denver, CO", "Tampa, FL", "Raleigh, NC",
  ],
  sameAs: [
    "https://www.instagram.com/haskerrealty",
    "https://www.linkedin.com/company/haskerrealty",
  ],
};

const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Hasker & Co. Realty Group",
  url: BASE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/properties?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Hasker & Co. Realty Group",
  url: BASE_URL,
  logo: `${BASE_URL}/logo.svg`,
  email: "info@haskerrealtygroup.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "213 Bob Ln",
    addressLocality: "Virginia Beach",
    addressRegion: "VA",
    postalCode: "23454",
    addressCountry: "US",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: "info@haskerrealtygroup.com",
    contactType: "customer service",
    availableLanguage: "English",
  },
  sameAs: [
    "https://www.instagram.com/haskerrealty",
    "https://www.linkedin.com/company/haskerrealty",
  ],
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Where can I find cheap apartments to rent in Atlanta?",
      acceptedAnswer: { "@type": "Answer", text: "Hasker & Co. Realty Group lists affordable rentals in Atlanta, GA starting from around $950/month. They specialize in budget-friendly housing with no hidden fees and respond to applications within 24 hours. Browse listings at haskerrealtygroup.com/properties." },
    },
    {
      "@type": "Question",
      name: "How do I find affordable homes for a large family in the US?",
      acceptedAnswer: { "@type": "Answer", text: "Hasker & Co. Realty Group has 3 and 4-bedroom houses from around $1,400/month across cities like Houston, Atlanta, and Charlotte. Many are pet-friendly and welcome large households. Apply online at haskerrealtygroup.com/apply. Decisions in 24 hours." },
    },
    {
      "@type": "Question",
      name: "What is the most affordable way to rent a house in America?",
      acceptedAnswer: { "@type": "Answer", text: "Hasker & Co. Realty Group focuses exclusively on affordable rentals across 12+ US cities. There are no hidden admin fees. You pay the listed price plus the standard security deposit. Studios start from $800/mo and family homes from $1,400/mo." },
    },
    {
      "@type": "Question",
      name: "How long does it take to get approved for a rental?",
      acceptedAnswer: { "@type": "Answer", text: "Hasker & Co. Realty Group reviews every rental application within 24 hours. You can apply online in under 10 minutes at haskerrealtygroup.com/apply." },
    },
    {
      "@type": "Question",
      name: "Does Hasker & Co. Realty Group charge hidden fees?",
      acceptedAnswer: { "@type": "Answer", text: "No. Hasker & Co. Realty Group's policy is that the listed price is what you pay. No administrative processing fees or convenience surcharges beyond the standard security deposit." },
    },
  ],
};

const BREADCRUMB_HOME = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
  ],
};

export default async function HomePage() {
  const [featuredRaw, agents, blogData, totalCountRaw] = await Promise.allSettled([
    fetchFeaturedProperties(),
    fetchAgents(),
    fetchPosts({ is_featured: true }),
    fetchProperties(), // all published — for total count
  ]);

  const featuredProperties =
    featuredRaw.status === "fulfilled" ? featuredRaw.value.slice(0, 3).map(toPropertyCardShape) : [];
  const teamAgents =
    agents.status === "fulfilled" ? agents.value.slice(0, 3) : [];
  const blogPosts =
    blogData.status === "fulfilled" ? blogData.value.results.slice(0, 3) : [];
  const totalProperties =
    totalCountRaw.status === "fulfilled" ? totalCountRaw.value.count : null;

  return (
    <>
      {/* JSON-LD structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_HOME) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />

      {/* ─── HERO ──────────────────────────────────────────────── */}
      <section className="relative min-h-[100svh] flex items-center overflow-hidden">

        {/* ── Background image ── */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&q=90"
            alt="Beautiful home with warm sunlight — find your perfect rental"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(11,31,58,0.55) 0%, rgba(11,31,58,0.70) 40%, rgba(11,31,58,0.88) 75%, rgba(11,31,58,0.96) 100%)",
            }}
          />
        </div>

        {/* ── Content — centered single column ── */}
        <div className="relative z-10 w-full px-5 sm:px-8 pt-24 pb-14 sm:pt-28 sm:pb-20">
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center">

            {/* Eyebrow pill */}
            <div
              className="hero-animate inline-flex items-center gap-2.5 mb-8
                         bg-white/10 backdrop-blur-sm border border-white/20
                         rounded-full px-5 py-2.5"
              style={{ animationDelay: "0ms" }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-white/90 text-[11px] font-semibold tracking-[0.2em] uppercase">
                {totalProperties != null ? `${totalProperties} ${totalProperties === 1 ? "Property" : "Properties"} Available Now` : "Properties Available Now"}
              </span>
            </div>

            {/* Headline */}
            <h1
              className="hero-animate text-white font-black leading-[1.08] mb-6
                         text-[2.5rem] sm:text-5xl md:text-6xl lg:text-[4.5rem] xl:text-[5rem]"
              style={{ animationDelay: "90ms" }}
            >
              Comfortable Living,<br />
              Within Your Budget.
            </h1>

            {/* Subtitle */}
            <p
              className="hero-animate text-white/90 text-base sm:text-lg leading-relaxed mb-10 max-w-xl"
              style={{ animationDelay: "180ms" }}
            >
              Quality homes at honest prices. Studios to 4-bedroom houses in 12+ cities.
              No hidden fees. No runaround.
            </p>

            {/* Search bar — WHITE, max contrast, undeniable CTA */}
            <div
              className="hero-animate w-full max-w-3xl"
              style={{ animationDelay: "270ms" }}
            >
              <SearchBar className="shadow-2xl shadow-black/30" />
            </div>

            {/* City quick-filters */}
            <div
              className="hero-animate flex flex-wrap justify-center items-center gap-2 mt-5"
              style={{ animationDelay: "360ms" }}
            >
              <span className="flex items-center gap-1 text-white/50 text-[11px] mr-0.5">
                <MapPin size={10} />
                Near you:
              </span>
              {["Atlanta", "Charlotte", "Houston", "Dallas", "Nashville", "Phoenix"].map((city) => (
                <Link
                  key={city}
                  href={`/properties?q=${city}`}
                  className="
                    text-[11px] text-white/80 hover:text-white
                    border border-white/30 hover:border-white/70
                    px-3 py-2 rounded-full
                    transition-[color,border-color] duration-200 cursor-pointer
                  "
                >
                  {city}
                </Link>
              ))}
            </div>

          </div>
        </div>

        {/* ── Scroll indicator — centered bottom ── */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20
                        flex flex-col items-center gap-2 text-white/30">
          <span className="text-[9px] tracking-[0.28em] uppercase">Scroll</span>
          <div className="w-0.5 h-7 rounded-full bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </section>

      {/* ─── TRUST BAR — infinite marquee ──────────────────────── */}
      <section className="bg-white border-b border-neutral-100 py-4 overflow-hidden">
        <div
          style={{
            display: "flex",
            width: "max-content",
            animation: "marquee 30s linear infinite",
            willChange: "transform",
          }}
        >
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center gap-x-10 pr-10 shrink-0" aria-hidden={copy === 1}>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map((i) => (
                    <svg key={i} className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#00B67A">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-[11px] font-bold text-neutral-800">4.9 Excellent</span>
                <span className="text-[10px] text-neutral-400">2,400+ reviews · Trustpilot</span>
              </div>

              <div className="h-5 w-px bg-neutral-200 shrink-0" />

              <div className="flex items-center gap-2 shrink-0">
                <div className="w-6 h-6 rounded bg-[#003087] flex items-center justify-center shrink-0">
                  <span className="text-white font-black text-[9px] leading-none">BBB</span>
                </div>
                <span className="text-[11px] font-bold text-neutral-800">A+ Accredited</span>
                <span className="text-[10px] text-neutral-400">Better Business Bureau</span>
              </div>

              <div className="h-5 w-px bg-neutral-200 shrink-0" />

              <div className="flex items-center gap-2 shrink-0">
                <svg className="w-4 h-4 text-brand shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 013 10c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286z"/>
                </svg>
                <span className="text-[11px] font-bold text-neutral-800">Licensed &amp; Insured</span>
                <span className="text-[10px] text-neutral-400">All 6 states · Since 2012</span>
              </div>

              <div className="h-5 w-px bg-neutral-200 shrink-0" />

              <div className="flex items-center gap-2 shrink-0">
                <svg className="w-4 h-4 text-brand shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                <span className="text-[11px] font-bold text-neutral-800">Equal Housing</span>
                <span className="text-[10px] text-neutral-400">Fair Housing Act compliant</span>
              </div>

              <div className="h-5 w-px bg-neutral-200 shrink-0" />

              <div className="flex items-center gap-2 shrink-0">
                <svg className="w-4 h-4 text-brand shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                <span className="text-[11px] font-bold text-neutral-800">NAR Member</span>
                <span className="text-[10px] text-neutral-400">National Association of Realtors</span>
              </div>

              <div className="h-5 w-px bg-neutral-200 shrink-0" />

              <div className="flex items-center gap-2 shrink-0">
                <svg className="w-4 h-4 text-brand shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span className="text-[11px] font-bold text-neutral-800">24hr Decisions</span>
                <span className="text-[10px] text-neutral-400">Fast application review</span>
              </div>

              <div className="h-5 w-px bg-neutral-200 shrink-0" />

              <div className="flex items-center gap-2 shrink-0">
                <svg className="w-4 h-4 text-brand shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span className="text-[11px] font-bold text-neutral-800">2,000+ Families Housed</span>
                <span className="text-[10px] text-neutral-400">Across 12+ cities</span>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* ─── STATS BAR ─────────────────────────────────────────── */}
      <section className="bg-brand text-white py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 lg:gap-8">
            <div className="flex flex-col items-center text-center">
              <Home size={20} className="text-blue-200 mb-3" />
              <span className="font-sans text-3xl font-bold text-white">
                {totalProperties != null ? `${totalProperties}` : "—"}
              </span>
              <span className="text-sm font-medium text-white/80 mt-0.5">Properties</span>
              <span className="text-xs text-blue-200/80 mt-0.5">available now</span>
            </div>
            {marketingStats.map(({ icon: Icon, label, value, sublabel }) => (
              <div key={label} className="flex flex-col items-center text-center">
                <Icon size={20} className="text-blue-200 mb-3" />
                <span className="font-sans text-3xl font-bold text-white">{value}</span>
                <span className="text-sm font-medium text-white/80 mt-0.5">{label}</span>
                <span className="text-xs text-blue-200/80 mt-0.5">{sublabel}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AVAILABLE RENTALS ─────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-brand-light">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
            <div>
              <p className="text-brand text-xs font-semibold tracking-[0.3em] uppercase mb-3">
                Move-In Ready
              </p>
              <h2 className="font-sans text-4xl font-bold text-brand-dark">Homes Available Now</h2>
              <p className="text-neutral-500 mt-2 text-sm">Affordable rentals &amp; homes for sale, updated daily and priced honestly.</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/properties" className="flex items-center gap-2">
                View All Properties <ArrowRight size={16} />
              </Link>
            </Button>
          </div>

          {featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-neutral-400">
              <p className="font-sans text-lg font-medium">New listings coming soon.</p>
              <p className="text-sm mt-2">Check back shortly or browse all available rentals.</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-brand text-xs font-semibold tracking-[0.3em] uppercase mb-3">
              Simple Process
            </p>
            <h2 className="font-sans text-4xl font-bold text-brand-dark">How It Works</h2>
            <p className="text-neutral-500 mt-3 max-w-xl mx-auto">
              From search to move-in, we&apos;ve made renting as simple and stress-free as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item) => (
              <div key={item.step} className="flex flex-col">
                <span className="font-sans text-5xl font-black text-brand/20 mb-4 leading-none">
                  {item.step}
                </span>
                <h3 className="font-semibold text-brand-dark text-base mb-2">{item.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="primary" asChild>
              <Link href="/properties">Browse Available Rentals</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── WHY HASKER & CO. ──────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-brand-light">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-brand text-xs font-semibold tracking-[0.3em] uppercase mb-4">
                Why Hasker & Co.
              </p>
              <h2 className="font-serif text-4xl lg:text-5xl font-bold text-brand-dark leading-tight mb-6">
                Good Homes.
                <br />
                Fair Prices.
                <br />
                No Surprises.
              </h2>
              <p className="text-neutral-600 leading-relaxed mb-8">
                Everyone deserves a quality home they can actually afford. Hasker & Co. Realty Group
                cuts through the noise. No inflated prices, no hidden admin fees, no bait-and-switch
                listings. Just honest homes for real families.
              </p>

              <div className="space-y-5">
                {[
                  {
                    title: "Prices You Can Trust",
                    desc: "What you see is what you pay. We never inflate rents or add surprise move-in fees beyond the standard security deposit.",
                  },
                  {
                    title: "24-Hour Application Decisions",
                    desc: "Apply online in under 10 minutes. Our team reviews every application and responds within 24 hours. No unnecessary waiting.",
                  },
                  {
                    title: "Maintenance That Shows Up",
                    desc: "Our maintenance team responds fast. When something needs fixing in your home, you won't be waiting weeks for a call back.",
                  },
                  {
                    title: "Your Whole Family Welcome",
                    desc: "Kids, pets, extended family. We work with you. Many of our homes are pet-friendly and we'll always be upfront about policies.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-1 bg-brand rounded-full shrink-0" />
                    <div>
                      <h3 className="font-semibold text-brand-dark mb-0.5 text-base">{item.title}</h3>
                      <p className="text-sm text-neutral-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-10">
                <Button variant="primary" asChild>
                  <Link href="/contact">Get in Touch</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/apply" className="flex items-center gap-2">
                    Apply Now <ArrowRight size={14} />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative pb-10 lg:pb-0">
              <div className="relative aspect-[4/5] rounded-sm overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"
                  alt="Comfortable apartment interior"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              {/* Stat card — absolute on desktop, inline push on mobile */}
              <div className="absolute bottom-0 left-3 lg:-bottom-6 lg:-left-6 bg-white border border-neutral-100 shadow-xl p-4 lg:p-5 rounded-sm max-w-[200px] lg:max-w-[210px]">
                <p className="font-sans text-3xl font-bold text-brand-dark">2,000+</p>
                <p className="text-xs text-neutral-500 leading-snug mt-1">
                  Families successfully housed since 2012
                </p>
              </div>
              <div className="absolute -top-3 -right-3 lg:-top-4 lg:-right-4 bg-brand text-white p-3 lg:p-4 rounded-sm">
                <CheckCircle size={28} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TECHNOLOGY EDGE / FOUNDER CREDENTIALS ─────────────── */}
      <section className="py-16 lg:py-24 bg-brand-dark text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-brand text-xs font-semibold tracking-[0.3em] uppercase mb-4">
                Our Edge
              </p>
              <h2 className="font-serif text-4xl lg:text-5xl font-bold leading-tight mb-6">
                Built on Real Systems Expertise
              </h2>
              <p className="text-blue-100 leading-relaxed mb-4">
                Hasker &amp; Co. Realty Group is led by an Information Systems specialist trained in
                database architecture, information security, and AI-driven workflows. That academic
                foundation shapes how we protect your data, match you to properties precisely, and
                move faster than traditional agencies.
              </p>
              <p className="text-blue-200 text-sm leading-relaxed">
                Our technology infrastructure is built to the standards of academic Information Systems
                study at the university level — not retrofitted from off-the-shelf tools.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  title: "Database Architecture",
                  desc: "Secure, structured property and applicant data with no cross-contamination or data leaks.",
                },
                {
                  title: "Information Security",
                  desc: "Your personal details are encrypted end-to-end. We comply with U.S. data privacy standards.",
                },
                {
                  title: "AI-Driven Matching",
                  desc: "We use intelligent workflows to match applicants to available homes faster than manual review.",
                },
              ].map((item) => (
                <div key={item.title} className="bg-white/5 border border-white/10 rounded-sm p-5">
                  <h3 className="font-semibold text-white text-sm mb-2">{item.title}</h3>
                  <p className="text-blue-200 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── AGENT TEAM ────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-brand text-xs font-semibold tracking-[0.3em] uppercase mb-3">
              Our People
            </p>
            <h2 className="font-sans text-4xl font-bold text-brand-dark">Meet Our Rental Team</h2>
            <p className="text-neutral-500 mt-3 max-w-xl mx-auto">
              Real people who know the local rental market and are genuinely committed to helping
              you find the right home.
            </p>
          </div>

          {teamAgents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamAgents.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/agents/${agent.id}`}
                  className="group bg-white rounded-sm overflow-hidden border border-neutral-100 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative aspect-[4/3] sm:aspect-[3/4] overflow-hidden bg-brand-muted">
                    {agent.avatar_url ? (
                      <Image
                        src={agent.avatar_url}
                        alt={agent.full_name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-brand text-white text-4xl font-bold font-sans">
                        {agent.first_name[0]}{agent.last_name[0]}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="font-sans text-xl font-bold">{agent.full_name}</p>
                      {agent.agent_profile?.specialties?.[0] && (
                        <p className="text-sm text-blue-200">{agent.agent_profile.specialties[0]}</p>
                      )}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="font-sans text-lg font-bold text-brand-dark">
                          {agent.agent_profile?.years_experience ?? "—"}yr
                        </p>
                        <p className="text-xs text-neutral-400">Experience</p>
                      </div>
                      <div>
                        <p className="font-sans text-lg font-bold text-brand-dark">
                          {agent.active_listings}
                        </p>
                        <p className="text-xs text-neutral-400">Listings</p>
                      </div>
                      <div>
                        <p className="font-sans text-lg font-bold text-brand-dark">
                          {agent.agent_profile?.total_sales
                            ? formatPrice(agent.agent_profile.total_sales, { compact: true })
                            : "—"}
                        </p>
                        <p className="text-xs text-neutral-400">Volume</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {(agent.agent_profile?.specialties ?? []).slice(0, 2).map((s) => (
                        <span
                          key={s}
                          className="text-[10px] tracking-wide bg-brand-light text-brand-dark px-2 py-1 rounded-sm border border-brand-muted"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-neutral-400 py-8">Meet our team in person. Contact us to get started.</p>
          )}

          <div className="text-center mt-10">
            <Button variant="outline" asChild>
              <Link href="/agents">Meet the Full Team</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── HAPPY FAMILIES ────────────────────────────────────── */}
      <section id="testimonials" className="py-16 lg:py-24 bg-brand-dark">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-14">
            <p className="text-blue-300 text-xs font-semibold tracking-[0.3em] uppercase mb-3">
              Real Stories
            </p>
            <h2 className="font-sans text-4xl font-bold text-white">
              Real Families. Affordable Homes.
            </h2>
            <p className="text-blue-100/70 mt-3 max-w-lg mx-auto">
              Over 2,000 families have found their home through Hasker &amp; Co.
              Here are a few of their stories.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80",
                name: "The Williams Family",
                city: "Charlotte, NC",
                home: "3-Bedroom House · $1,750/mo",
                quote: "We'd been priced out everywhere else. Hasker & Co. found us a beautiful 3-bedroom in Charlotte that fit our budget perfectly. The kids finally have their own rooms — we're genuinely grateful.",
              },
              {
                image: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=600&q=80",
                name: "Marcus & Denise T.",
                city: "Atlanta, GA",
                home: "2-Bedroom Apartment · $1,095/mo",
                quote: "After months of getting hit with hidden fees everywhere, Hasker & Co. was a breath of fresh air. What they quoted is what we paid. We moved in within two weeks of applying. No games.",
              },
              {
                image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80",
                name: "The Rodriguez Family",
                city: "Houston, TX",
                home: "3-Bedroom Home · $1,450/mo",
                quote: "Relocating with three kids is no joke. Hasker & Co. handled everything remotely — virtual tour, digital lease, the works. We pulled up to our new home and it was exactly as advertised.",
              },
            ].map((story) => (
              <div
                key={story.name}
                className="group bg-white rounded-sm overflow-hidden flex flex-col"
              >
                {/* Photo */}
                <div className="relative aspect-[4/3] overflow-hidden shrink-0">
                  <Image
                    src={story.image}
                    alt={`${story.name} — affordable home through Hasker & Co. Realty`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <span className="inline-flex items-center gap-1 bg-brand text-white text-[10px] font-semibold tracking-wide px-2.5 py-1 rounded-sm">
                      {story.home}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col flex-1">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <div className="relative flex-1">
                    <span className="absolute -top-3 -left-1 text-6xl leading-none text-brand/15 font-serif select-none">&ldquo;</span>
                    <p className="text-sm text-neutral-600 leading-relaxed pl-4 pt-1">
                      {story.quote}
                    </p>
                  </div>

                  {/* Attribution */}
                  <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-brand-dark text-sm">{story.name}</p>
                      <p className="text-brand text-xs mt-0.5 flex items-center gap-1">
                        <MapPin size={10} />
                        {story.city}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-brand-light border border-brand-muted flex items-center justify-center">
                      <CheckCircle size={14} className="text-brand" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-blue-100/60 text-sm mb-6">
              Join over 2,000 families who found their affordable home with Hasker &amp; Co.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="accent" size="lg" asChild>
                <Link href="/properties">Browse Affordable Homes</Link>
              </Button>
              <Button variant="outline-white" asChild>
                <Link href="/contact" className="flex items-center gap-2">
                  Talk to Our Team <ArrowRight size={14} />
                </Link>
              </Button>
            </div>
          </div>

        </div>
      </section>

      {/* ─── LEAD MAGNETS ──────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-brand-light border border-brand-muted rounded-sm p-7 lg:p-10">
              <p className="text-brand text-xs font-semibold tracking-[0.3em] uppercase mb-4">
                Ready to Move?
              </p>
              <h3 className="font-sans text-3xl font-bold text-brand-dark mb-4">
                Apply for a
                <br />
                Rental Today
              </h3>
              <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                Our online rental application is quick and paperless. Most applicants receive a
                decision within 24 hours. No unnecessary delays.
              </p>
              <Button variant="primary" asChild>
                <Link href="/apply">Start Your Application</Link>
              </Button>
            </div>

            <div className="bg-brand-dark rounded-sm p-7 lg:p-10 text-white">
              <p className="text-blue-300 text-xs font-semibold tracking-[0.3em] uppercase mb-4">
                Free Resource
              </p>
              <h3 className="font-sans text-3xl font-bold mb-4">
                First-Time
                <br />
                Renter&apos;s Guide
              </h3>
              <p className="text-blue-100 text-sm leading-relaxed mb-6">
                Everything you need to know before signing a lease: what to inspect, what to
                negotiate, and red flags to watch out for. Written by our rental experts.
              </p>
              <Button variant="accent" asChild>
                <Link href="/blog">Read the Guide</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BLOG PREVIEW ──────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-brand-light">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
            <div>
              <p className="text-brand text-xs font-semibold tracking-[0.3em] uppercase mb-3">
                Renter Resources
              </p>
              <h2 className="font-sans text-4xl font-bold text-brand-dark">Helpful Guides</h2>
            </div>
            <Button variant="outline" asChild>
              <Link href="/blog" className="flex items-center gap-2">
                All Articles <ArrowRight size={16} />
              </Link>
            </Button>
          </div>

          {blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group bg-white border border-neutral-100 rounded-sm overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-brand-light">
                    <Image
                      src={post.featured_image_url ?? "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80"}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-brand text-xs font-semibold tracking-widest uppercase">
                      {post.category_display}
                    </span>
                    <h3 className="font-sans text-lg font-semibold text-brand-dark mt-2 mb-3 line-clamp-2 group-hover:text-brand transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-sm text-neutral-500 leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
                      <span className="text-xs text-neutral-400">
                        {post.published_at ? new Date(post.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""}
                      </span>
                      <span className="text-xs text-neutral-400">{post.read_time_minutes} min read</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-neutral-400">
              <p className="text-sm">No articles published yet. Check back soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── FINAL CTA ─────────────────────────────────────────── */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1920&q=80"
            alt="Comfortable home interior"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-brand-dark/85" />
        </div>
        <div className="relative z-10 text-center text-white max-w-3xl mx-auto px-6">
          <p className="text-blue-300 text-xs font-semibold tracking-[0.4em] uppercase mb-5">
            Your Next Home Is Waiting
          </p>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Your Affordable Home
            <br />
            Is Waiting for You.
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed mb-10">
            Browse homes right now or reach out to our team. We respond fast,
            keep pricing honest, and work hard to get your family into a home you love.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="accent" size="lg" asChild>
              <Link href="/properties">See Available Homes</Link>
            </Button>
            <Button variant="outline-white" size="lg" asChild>
              <Link href="/contact">Talk to Our Team</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
