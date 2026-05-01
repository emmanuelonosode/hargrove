import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, Home, Users, Clock, CheckCircle, MapPin } from "lucide-react";
import { SearchBar } from "@/components/public/SearchBar";
import { PropertyCard } from "@/components/public/PropertyCard";
import { Button } from "@/components/ui/Button";
import { fetchHomepageProperties, fetchProperties, toPropertyCardShape } from "@/lib/properties";
import { fetchAgents } from "@/lib/agents";
import { fetchPosts } from "@/lib/blog";
import { formatPrice } from "@/lib/utils";
import { CITIES } from "@/lib/cities";

export const metadata = {
  title: "Hasker & Co. Realty Group | Affordable Homes to Rent & Buy",
  description:
    "Hasker & Co. Realty Group — find affordable homes to rent and buy across Atlanta, Charlotte, Houston, Dallas, Nashville and Phoenix. No hidden fees. Decisions in 24 hrs.",
  keywords: [
    "affordable homes for rent",
    "cheap apartments near me",
    "houses for rent Atlanta",
    "affordable rentals Charlotte",
    "cheap homes Houston",
    "rental homes Dallas",
    "affordable housing Nashville",
    "homes for sale affordable",
    "no hidden fees rental",
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
    description: "Hasker & Co. Realty Group — quality homes at honest prices. No hidden fees. Fast approvals. 12+ cities.",
    type: "website",
    url: "https://haskerrealtygroup.com",
    images: [{ url: "https://haskerrealtygroup.com/opengraph-image", width: 1200, height: 630, alt: "Hasker & Co. Realty Group — Affordable Homes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hasker & Co. Realty Group | Affordable Homes to Rent & Buy",
    description: "Hasker & Co. Realty Group — quality homes at honest prices. No hidden fees. Fast approvals. 12+ cities.",
    images: ["https://haskerrealtygroup.com/opengraph-image"],
    creator: "@haskerrealty",
  },
  alternates: { canonical: "https://haskerrealtygroup.com" },
};

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
  "@id": `${BASE_URL}/#local-business`,
  name: "Hasker & Co. Realty Group",
  legalName: "Hasker & Co. Realty Group",
  alternateName: [
    "Hasker Realty Group",
    "Hasker Realty",
    "Hasker and Co Realty Group",
    "Hasker & Co Realty",
  ],
  parentOrganization: { "@id": `${BASE_URL}/#organization` },
  url: BASE_URL,
  logo: `${BASE_URL}/logo.svg`,
  image: `${BASE_URL}/opengraph-image`,
  description:
    "Hasker & Co. Realty Group — affordable homes to rent and buy. Honest prices, no hidden fees, fast decisions. 2,000+ families housed across 12+ US cities since 2012.",
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
    "Austin, TX", "Miami, FL", "Denver, CO", "Seattle, WA",
    "Las Vegas, NV", "Tampa, FL", "Raleigh, NC", "Orlando, FL",
    "San Antonio, TX", "Jacksonville, FL", "Philadelphia, PA",
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
  "@id": `${BASE_URL}/#organization`,
  name: "Hasker & Co. Realty Group",
  legalName: "Hasker & Co. Realty Group",
  alternateName: [
    "Hasker Realty Group",
    "Hasker Realty",
    "Hasker and Co Realty Group",
    "Hasker & Co Realty",
  ],
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
    "https://twitter.com/haskerrealty",
    "https://www.facebook.com/haskerrealty",
  ],
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Hasker Realty Group?",
      acceptedAnswer: { "@type": "Answer", text: "Hasker Realty Group — officially named Hasker & Co. Realty Group — is a licensed US real estate company founded in 2012 and headquartered in Virginia Beach, VA. The company specializes in affordable rental homes and budget-friendly properties for sale across 12+ US cities including Atlanta, Charlotte, Houston, Dallas, and Nashville. Website: haskerrealtygroup.com." },
    },
    {
      "@type": "Question",
      name: "Who is Hasker & Co. Realty Group?",
      acceptedAnswer: { "@type": "Answer", text: "Hasker & Co. Realty Group (also searched as Hasker Realty Group or Hasker Realty) is an affordable housing company based in Virginia Beach, VA. Founded in 2012, they have housed 2,000+ families across 12+ US cities. They are NAR members, BBB A+ accredited, and rated 4.9/5 on Trustpilot. Find them at haskerrealtygroup.com." },
    },
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
    {
      "@type": "Question",
      name: "Can I rent an apartment with bad credit through Hasker & Co. Realty Group?",
      acceptedAnswer: { "@type": "Answer", text: "Hasker & Co. Realty Group reviews applications individually and works with renters who have imperfect credit or limited rental history. We look at your full financial picture. Apply at haskerrealtygroup.com/apply — decisions in 24 hours." },
    },
    {
      "@type": "Question",
      name: "Does Hasker & Co. Realty Group have pet-friendly rentals?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. Many of our rental listings across Atlanta, Charlotte, Houston, Dallas and other cities are pet-friendly. Pet policies are disclosed upfront on every listing. Filter for pet-friendly homes at haskerrealtygroup.com/properties." },
    },
    {
      "@type": "Question",
      name: "What is the average rent for a 2-bedroom apartment in Atlanta?",
      acceptedAnswer: { "@type": "Answer", text: "The average rent for a 2-bedroom home in Atlanta, GA starts around $1,100–$1,300/month through Hasker & Co. Realty Group. Browse available 2-bedroom listings at haskerrealtygroup.com/rentals/atlanta-ga/2-bedroom." },
    },
    {
      "@type": "Question",
      name: "Does Hasker & Co. Realty Group have 3-bedroom houses for rent?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. Hasker & Co. Realty Group lists 3 and 4-bedroom family homes across Houston, Atlanta, Charlotte and other cities starting from around $1,400/month. Browse family homes at haskerrealtygroup.com/properties." },
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

const AGGREGATE_RATING_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${BASE_URL}/#aggregate-rating`,
  name: "Hasker & Co. Realty Group",
  url: BASE_URL,
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    bestRating: "5",
    worstRating: "1",
    ratingCount: "2400",
    reviewCount: "2400",
  },
};

const HOW_IT_WORKS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Rent a Home with Hasker & Co. Realty Group",
  description: "Apply for an affordable rental home in 4 simple steps. Decisions within 24 hours, no hidden fees.",
  totalTime: "PT30M",
  estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Search Available Rentals",
      text: "Browse current listings by city, price range, and bedroom count. Filter for pet-friendly units, short-term leases, and more.",
      url: `${BASE_URL}/properties`,
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Schedule a Viewing",
      text: "Book a tour online or call us. We offer same-day showings for most properties.",
      url: `${BASE_URL}/properties`,
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Apply Online in Minutes",
      text: "Our simple online application takes under 10 minutes. Decisions within 24 hours. No unnecessary paperwork.",
      url: `${BASE_URL}/apply`,
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Move In",
      text: "Sign your lease digitally, pay your deposit, and get your keys. Our team supports you throughout your tenancy.",
      url: `${BASE_URL}/apply`,
    },
  ],
};

export default async function HomePage() {
  const [featuredRaw, agents, blogFeatured, blogLatest, totalCountRaw] = await Promise.allSettled([
    fetchHomepageProperties(),
    fetchAgents(),
    fetchPosts({ is_featured: true }),
    fetchPosts(),
    fetchProperties(),
  ]);

  const featuredProperties =
    featuredRaw.status === "fulfilled" ? featuredRaw.value.slice(0, 3).map(toPropertyCardShape) : [];
  const teamAgents =
    agents.status === "fulfilled" ? agents.value.slice(0, 3) : [];
  // Use featured posts if any are marked, otherwise fall back to latest published
  const featuredPostResults = blogFeatured.status === "fulfilled" ? blogFeatured.value.results : [];
  const latestPostResults   = blogLatest.status  === "fulfilled" ? blogLatest.value.results   : [];
  const blogPosts = (featuredPostResults.length > 0 ? featuredPostResults : latestPostResults).slice(0, 3);
  const totalProperties =
    totalCountRaw.status === "fulfilled" ? totalCountRaw.value.count : null;

  return (
    <main>
      {/* JSON-LD structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_HOME) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(AGGREGATE_RATING_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(HOW_IT_WORKS_SCHEMA) }} />

      {/* ─── HERO ──────────────────────────────────────────────── */}
      <section className="relative min-h-[100svh] flex items-center overflow-hidden">
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

        <div className="relative z-10 w-full px-5 sm:px-8 pt-24 pb-14 sm:pt-28 sm:pb-20">
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
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

            <h1
              className="hero-animate text-white font-black leading-[1.05] mb-6
                         text-[2.5rem] sm:text-5xl md:text-6xl lg:text-[4.5rem] xl:text-[5rem]"
              style={{ animationDelay: "90ms" }}
            >
              Real Homes.<br />
              Honest Prices.<br />
              <span className="text-brand">Zero Surprises.</span>
            </h1>

            {/* Social proof row */}
            <div
              className="hero-animate flex flex-wrap justify-center items-center gap-2 mb-8"
              style={{ animationDelay: "180ms" }}
            >
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((i) => (
                    <svg key={i} className="w-3 h-3" viewBox="0 0 24 24" fill="#FBBF24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  ))}
                </div>
                <span className="text-white/90 text-[11px] font-semibold">4.9 · Trusted by 2,400+ Families</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                <span className="text-emerald-400 text-[11px] font-bold">BBB A+ Rated</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                <span className="text-white/90 text-[11px] font-semibold">24-hr Decisions</span>
              </div>
            </div>

            <div
              className="hero-animate w-full max-w-3xl"
              style={{ animationDelay: "270ms" }}
            >
              <SearchBar className="shadow-2xl shadow-black/30" />
            </div>

            <div
              className="hero-animate flex flex-wrap justify-center items-center gap-2 mt-5"
              style={{ animationDelay: "360ms" }}
            >
              <span className="flex items-center gap-1 text-white/50 text-[11px] mr-0.5">
                <MapPin size={10} />
                Near you:
              </span>
              {[
                { label: "Atlanta", slug: "atlanta-ga" },
                { label: "Charlotte", slug: "charlotte-nc" },
                { label: "Houston", slug: "houston-tx" },
                { label: "Dallas", slug: "dallas-tx" },
                { label: "Nashville", slug: "nashville-tn" },
                { label: "Phoenix", slug: "phoenix-az" },
                { label: "Austin", slug: "austin-tx" },
                { label: "Miami", slug: "miami-fl" },
                { label: "Denver", slug: "denver-co" },
                { label: "Seattle", slug: "seattle-wa" },
                { label: "Las Vegas", slug: "las-vegas-nv" },
                { label: "Tampa", slug: "tampa-fl" },
              ].map(({ label, slug }) => (
                <Link
                  key={label}
                  href={`/rentals/${slug}`}
                  className="text-[11px] text-white/80 hover:text-white border border-white/30 hover:border-white/70 px-3 py-2 rounded-full transition-[color,border-color] duration-200 cursor-pointer"
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* CTA pair */}
            <div
              className="hero-animate flex flex-col sm:flex-row gap-3 mt-8"
              style={{ animationDelay: "450ms" }}
            >
              <Button variant="accent" size="lg" asChild>
                <Link href="/properties">Browse Available Homes <ArrowRight size={14} /></Link>
              </Button>
              <Button variant="outline-white" size="lg" asChild>
                <Link href="/contact">Talk to Our Team</Link>
              </Button>
            </div>
          </div>
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

      {/* ─── STATS BAR — editorial numbers, no icons ───────────── */}
      <section className="bg-brand-dark text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/10">
            {[
              {
                value: totalProperties != null ? String(totalProperties) : "—",
                label: "Homes Available",
                sub: "right now",
              },
              { value: "2,400+", label: "Families Housed",      sub: "and counting"          },
              { value: "12+",    label: "US Cities Covered",  sub: "and growing"           },
              { value: "24hr",   label: "Application Decision", sub: "typical review time" },
            ].map((s, i) => (
              <div key={s.label} className="flex flex-col gap-1 px-6 py-8 lg:py-10 border-b border-white/10 lg:border-b-0 even:border-l even:border-white/10 lg:even:border-l-0">
                <span className="font-serif text-[2.5rem] lg:text-[3rem] font-bold text-white leading-none tracking-tight">
                  {s.value}
                </span>
                <span className="text-sm font-semibold text-white/80 mt-0.5">{s.label}</span>
                <span className="text-xs text-white/35 tracking-wide">{s.sub}</span>
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
              <h2 className="font-serif text-4xl font-bold text-brand-dark">Homes Available Now</h2>
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

      {/* ─── CITIES GRID ───────────────────────────────────────── */}
      <section className="bg-white border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center mb-12">
            <p className="text-brand text-xs font-semibold tracking-[0.3em] uppercase mb-3">
              Explore Markets
            </p>
            <h2 className="font-serif text-4xl font-bold text-brand-dark">
              Rentals by City
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.values(CITIES)
              .slice(0, 8)
              .map((c) => (
                <Link
                  key={c.slug}
                  href={`/rentals/${c.slug}`}
                  className="group relative aspect-[4/3] rounded-sm overflow-hidden bg-neutral-100 cursor-pointer"
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

      {/* ─── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-brand-dark text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-brand text-xs font-semibold tracking-[0.3em] uppercase mb-3">
              Simple Process
            </p>
            <h2 className="font-serif text-4xl font-bold text-white">How It Works</h2>
            <p className="text-white/50 mt-3 max-w-xl mx-auto text-sm">
              From search to move-in, we&apos;ve made renting as simple and stress-free as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
            {howItWorks.map((item, i) => (
              <div key={item.step} className="relative flex flex-col p-6 lg:p-8 border-b border-white/10 sm:border-b-0 sm:border-r last:border-r-0 border-white/10">
                {/* Step connector dot on desktop */}
                <div className="hidden lg:block absolute top-8 right-0 w-px h-8 bg-white/10" />
                <span className="font-serif text-[3.5rem] font-bold text-white/10 leading-none mb-5 select-none">
                  {item.step}
                </span>
                <h3 className="font-semibold text-white text-base mb-2 leading-snug">{item.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="accent" asChild>
              <Link href="/properties">Browse Available Rentals</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── WHY HASKER & CO. ──────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-white">
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

            <div className="relative">
              <div className="relative aspect-[4/5] rounded-sm overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"
                  alt="Comfortable apartment interior"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {/* Subtle vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/30 to-transparent" />
              </div>

              {/* Floating stat card — refined positioning */}
              <div className="absolute -bottom-6 -left-4 lg:-left-8 bg-white border border-neutral-100 shadow-2xl p-5 lg:p-6 rounded-sm max-w-[190px]">
                <p className="font-serif text-3xl font-bold text-brand-dark leading-none">2,000+</p>
                <p className="text-xs text-neutral-500 leading-snug mt-2">
                  Families successfully housed since 2012
                </p>
              </div>

              {/* Est. tag — top right, clean strip */}
              <div className="absolute -top-4 -right-4 lg:-top-5 lg:-right-5 bg-brand text-white px-4 py-2 rounded-sm">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/70">Est.</p>
                <p className="font-serif text-lg font-bold leading-none">2012</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── THE HASKER DIFFERENCE ─────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-brand-light">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-brand text-xs font-semibold tracking-[0.3em] uppercase mb-3">
              Why Renters Choose Us
            </p>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-brand-dark leading-tight">
              The Hasker Difference
            </h2>
            <p className="text-neutral-500 mt-4 max-w-md mx-auto text-sm leading-relaxed">
              Every promise we make, we keep in writing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                category: "Pricing",
                icon: (
                  <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                them: "Hidden fees buried in the fine print of your lease.",
                us: "Every cost disclosed before you sign. No surprises, ever.",
              },
              {
                category: "Speed",
                icon: (
                  <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                them: "2–3 week application waits. Endless back-and-forth.",
                us: "Decision in 24 hours. Move in faster.",
              },
              {
                category: "Support",
                icon: (
                  <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                ),
                them: "Unreachable after your lease is signed.",
                us: "Your agent answers calls, texts, and emails — always.",
              },
            ].map((item) => (
              <div key={item.category} className="bg-white border border-neutral-100 rounded-sm p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3 mb-5">
                  {item.icon}
                  <span className="text-xs font-bold tracking-[0.2em] uppercase text-brand">{item.category}</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-400 text-[10px] font-bold">✕</span>
                    <p className="text-sm text-neutral-400 leading-relaxed">{item.them}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 text-[10px] font-bold">✓</span>
                    <p className="text-sm text-brand-dark font-semibold leading-relaxed">{item.us}</p>
                  </div>
                </div>
              </div>
            ))}
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
            <h2 className="font-serif text-4xl font-bold text-brand-dark">Meet Our Rental Team</h2>
            <p className="text-neutral-500 mt-3 max-w-xl mx-auto text-sm">
              Real people who know the local rental market and are genuinely committed to helping
              you find the right home.
            </p>
          </div>

          {teamAgents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {teamAgents.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/agents/${agent.id}`}
                  className="group bg-white rounded-sm overflow-hidden border border-neutral-100 hover:border-brand/30 hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  <div className="relative aspect-[4/3] sm:aspect-[3/4] overflow-hidden bg-brand-light">
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
                      <p className="font-serif text-xl font-bold">{agent.full_name}</p>
                      {agent.agent_profile?.specialties?.[0] && (
                        <p className="text-sm text-blue-200">{agent.agent_profile.specialties[0]}</p>
                      )}
                    </div>
                  </div>
                  <div className="p-5 border-t border-neutral-50">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="font-serif text-lg font-bold text-brand-dark">
                          {agent.agent_profile?.years_experience ?? "—"}yr
                        </p>
                        <p className="text-xs text-neutral-400">Experience</p>
                      </div>
                      <div>
                        <p className="font-serif text-lg font-bold text-brand-dark">
                          {agent.active_listings}
                        </p>
                        <p className="text-xs text-neutral-400">Listings</p>
                      </div>
                      <div>
                        <p className="font-serif text-lg font-bold text-brand-dark">
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

      {/* ─── TESTIMONIALS ──────────────────────────────────────── */}
      <section id="testimonials" className="py-16 lg:py-24 bg-brand-dark">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-4">
            <p className="text-brand text-xs font-semibold tracking-[0.3em] uppercase mb-3">
              2,400+ Families Can&apos;t Be Wrong
            </p>
            <h2 className="font-serif text-4xl font-bold text-white">
              Real Families. Real Stories.
            </h2>
          </div>

          {/* Trustpilot band */}
          <div className="flex items-center justify-center gap-4 mb-12 flex-wrap">
            <div className="flex gap-1">
              {[1,2,3,4,5].map((i) => (
                <svg key={i} className="w-5 h-5" viewBox="0 0 24 24" fill="#00B67A"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              ))}
            </div>
            <span className="text-white font-bold text-sm">4.9 / 5.0</span>
            <span className="text-white/40 text-sm">·</span>
            <span className="text-white/60 text-sm">2,400+ Reviews</span>
            <span className="text-white/40 text-sm">·</span>
            <span className="text-[#00B67A] font-bold text-sm">Trustpilot</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80",
                name: "Marcus T.",
                city: "Atlanta, GA",
                home: "3-Bed House · $1,250/mo",
                quote: "I was rejected by three other agencies before Hasker approved my application in one day. They didn't judge my situation — they just found me a home. My kids are finally settled.",
              },
              {
                image: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=600&q=80",
                name: "Priya & David K.",
                city: "Charlotte, NC",
                home: "2-Bed Apartment · $1,100/mo",
                quote: "Every fee was explained before we signed. The apartment was exactly as shown. Our maintenance request was handled in under 48 hours. This is how renting should work.",
              },
              {
                image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80",
                name: "Janelle R.",
                city: "Houston, TX",
                home: "4-Bed House · $1,450/mo",
                quote: "As a single mom, I needed a safe home and a landlord I could trust. Hasker has been nothing short of amazing — responsive, honest, and genuinely kind. We're not leaving.",
              },
            ].map((story) => (
              <div key={story.name} className="group bg-white rounded-sm overflow-hidden flex flex-col">
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
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex gap-0.5 mb-4">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute -top-3 -left-1 text-6xl leading-none text-brand/15 font-serif select-none">&ldquo;</span>
                    <p className="text-sm text-neutral-600 leading-relaxed pl-4 pt-1">
                      {story.quote}
                    </p>
                  </div>
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

          <div className="text-center mt-12">
            <p className="text-white/40 text-sm mb-6">
              Join over 2,400 families who found their affordable home with Hasker &amp; Co.
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Apply CTA — image background */}
            <div className="relative overflow-hidden rounded-sm">
              <div className="absolute inset-0">
                <Image
                  src="https://images.unsplash.com/photo-1560184897-ae75f418493e?w=1000&q=80"
                  alt="Home exterior"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-brand/90" />
              </div>
              <div className="relative z-10 p-8 lg:p-12">
                <p className="text-white/60 text-xs font-semibold tracking-[0.3em] uppercase mb-4">
                  Ready to Move?
                </p>
                <h2 className="font-serif text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                  Apply for a<br />Rental Today
                </h2>
                <p className="text-white/70 text-sm leading-relaxed mb-3">
                  10 minutes. No credit score minimum. Instant confirmation.
                </p>
                <p className="text-white/40 text-xs leading-relaxed mb-8">
                  Most applicants receive a decision within 24 hours. No unnecessary delays.
                </p>
                <Link
                  href="/apply"
                  className="inline-flex items-center gap-2 bg-white text-brand text-sm font-bold px-7 py-4 hover:bg-brand-light transition-colors duration-200 cursor-pointer"
                >
                  Start My Application — It&apos;s Free <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Guide CTA — dark with image */}
            <div className="relative overflow-hidden rounded-sm">
              <div className="absolute inset-0">
                <Image
                  src="https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1000&q=80"
                  alt="Interior"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-brand-dark/92" />
              </div>
              <div className="relative z-10 p-8 lg:p-12">
                <p className="text-white/40 text-xs font-semibold tracking-[0.3em] uppercase mb-4">
                  Free Resource
                </p>
                <h2 className="font-serif text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                  First-Time<br />Renter&apos;s Guide
                </h2>
                <p className="text-white/50 text-sm leading-relaxed mb-8">
                  Everything no one tells you before your first lease. What to inspect, what to negotiate, and red flags to avoid. Straight talk, no fluff.
                </p>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 bg-brand text-white text-sm font-bold px-7 py-4 hover:bg-brand-hover transition-colors duration-200 cursor-pointer"
                >
                  Read the Guide <ArrowRight size={14} />
                </Link>
              </div>
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
              <h2 className="font-serif text-4xl font-bold text-brand-dark">Helpful Guides</h2>
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
                  className="group bg-white border border-neutral-100 rounded-sm overflow-hidden hover:shadow-xl hover:border-brand/20 transition-all duration-300 cursor-pointer"
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
                    <h3 className="font-serif text-lg font-bold text-brand-dark mt-2 mb-3 line-clamp-2 group-hover:text-brand transition-colors duration-200 leading-snug">
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
          <p className="text-brand text-xs font-semibold tracking-[0.4em] uppercase mb-5">
            Your Next Home Is Out There
          </p>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Your Affordable Home Is Out There.
            <br />
            Let&apos;s Find It.
          </h2>
          <p className="text-white/60 text-lg leading-relaxed mb-10">
            Browse verified homes across 12 cities — priced honestly, no hidden fees.
            Apply online in 10 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="accent" size="lg" asChild>
              <Link href="/properties">Browse Available Homes</Link>
            </Button>
            <Button variant="outline-white" size="lg" asChild>
              <Link href="/contact">Talk to Our Team</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
