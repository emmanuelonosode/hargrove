import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Bed, Bath, Maximize, MapPin, Calendar, Clock,
  Phone, Mail, Home,
  RotateCcw, Share2, Heart,
  Utensils, Zap, Waves, PawPrint, Thermometer,
  Wind, WashingMachine, Car, Shield, Dumbbell,
  TreePine, CheckCircle2, Refrigerator, Microwave,
  Flame, ShowerHead, Wifi, Fence, ChefHat, Users, Dog, Cat,
  type LucideIcon,
} from "lucide-react";
import { fetchPropertyBySlug, fetchProperties, toPropertyCardShape } from "@/lib/properties";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PropertyInquiryForm } from "@/components/public/PropertyInquiryForm";
import { PropertyIntentCapture } from "@/components/public/PropertyIntentCapture";
import { VirtualTourButton } from "@/components/public/VirtualTourButton";
import { PropertyImageGallery } from "@/components/public/PropertyImageGallery";
import { PropertyCard } from "@/components/public/PropertyCard";
import { PropertyDetailMapLoader } from "@/components/public/PropertyDetailMapLoader";
import { FavoriteButton } from "@/components/public/FavoriteButton";
import { PropertyLeadCTAs } from "@/components/public/PropertyLeadCTAs";
import type { DetailMarker } from "@/components/public/PropertyDetailMap";
import { PropertyPageTracker } from "@/components/public/PropertyPageTracker";
import { getAmenityIconSVG } from "@/components/public/AmenityIcons";
import { formatPrice, formatNumber } from "@/lib/utils";

export const revalidate = 300;

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80";

// Inject Cloudinary resize transformation so Google receives a 1200×630 image
function toOgImageUrl(url: string): string {
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", "/upload/c_fill,w_1200,h_630,f_jpg,q_auto/");
  }
  return url;
}

export async function generateStaticParams() {
  // Return empty — pages are built on-demand via ISR (dynamicParams = true by default)
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const property = await fetchPropertyBySlug(decodedSlug);

    const bedsLabel = property.bedrooms ? `${property.bedrooms}-Bed ` : "";
    const typeLabel =
      property.type === "residential" ? "House" :
      property.type === "condo" ? "Condo" :
      property.type === "townhouse" ? "Townhouse" :
      property.type === "apartment" ? "Apartment" : "Home";
    const actionLabel =
      property.listing_type === "for-sale" ? "for Sale" :
      property.listing_type === "for-lease" ? "for Lease" : "for Rent";
    const priceLabel = property.listing_type === "for-rent"
      ? ` – $${Number(property.price).toLocaleString()}/mo`
      : ` – $${Number(property.price).toLocaleString()}`;

    // Address-first title so address searches rank: "123 Main St, Atlanta GA — 3-Bed House for Rent"
    const streetAddress = property.address ?? "";
    const fullAddr = `${streetAddress}, ${property.city}, ${property.state}${property.zip_code ? " " + property.zip_code : ""}`;
    const seoTitle = streetAddress
      ? `${streetAddress} — ${bedsLabel}${typeLabel} ${actionLabel} in ${property.city}, ${property.state}${priceLabel}`
      : `${bedsLabel}${typeLabel} ${actionLabel} in ${property.city}, ${property.state}${priceLabel}`;

    // Description leads with address + features so it shows in snippet for address searches
    const featureList = [
      property.bedrooms ? `${property.bedrooms} bed` : null,
      property.bathrooms ? `${property.bathrooms} bath` : null,
      property.sqft ? `${Number(property.sqft).toLocaleString()} sqft` : null,
    ].filter(Boolean).join(", ");
    const addrPrefix = streetAddress ? `${fullAddr}. ` : "";
    const seoDesc = `${addrPrefix}${featureList ? featureList + ". " : ""}Affordable ${typeLabel.toLowerCase()} ${actionLabel} — inspected and move-in ready. Apply online, decision in 24 hours.`;

    const ogImage = property.images?.[0]?.image_url
      ? toOgImageUrl(property.images[0].image_url)
      : FALLBACK_IMAGE;

    return {
      title: `${seoTitle} | Hasker & Co. Realty Group`,
      description: seoDesc.slice(0, 160),
      keywords: [
        // Address-specific — ranks when someone Googles the exact address
        ...(streetAddress ? [
          streetAddress,
          `${streetAddress} ${property.city}`,
          `${streetAddress} ${property.city} ${property.state}`,
          `${fullAddr} rental`,
          `${fullAddr} for rent`,
        ] : []),
        // City + type keywords
        `${bedsLabel.trim()} ${typeLabel} ${actionLabel} ${property.city}`.trim(),
        `affordable ${typeLabel.toLowerCase()} ${property.city}`,
        `${property.city} ${typeLabel.toLowerCase()} ${actionLabel} move-in ready`,
        `${property.city} ${actionLabel}`,
      ],
      alternates: { canonical: `https://haskerrealtygroup.com/houses-for-rent/${decodedSlug}` },
      openGraph: {
        title: `${seoTitle} | Hasker & Co. Realty Group`,
        description: seoDesc.slice(0, 160),
        type: "website",
        url: `https://haskerrealtygroup.com/houses-for-rent/${decodedSlug}`,
        images: [{ url: ogImage, width: 1200, height: 630, alt: seoTitle }],
      },
      twitter: {
        card: "summary_large_image",
        title: `${seoTitle} | Hasker & Co. Realty Group`,
        description: seoDesc.slice(0, 160),
        images: [ogImage],
      },
    };
  } catch {
    return { title: "Property Not Found" };
  }
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  let property;
  try {
    property = await fetchPropertyBySlug(decodedSlug);
  } catch {
    notFound();
  }

  const images = property.images ?? [];
  const primaryImage = images.find((i) => i.is_primary) ?? images[0];
  const galleryImages = images.slice(0, 5);
  const amenityCategories = (property as any).amenity_categories ?? [];
  const amenities = amenityCategories.length === 0 ? (property.amenities ?? []) : [];
  const agent = property.agent;

  // Similar homes from same city (used for cards + map)
  const similarRaw = await fetchProperties({ q: property.city, listing_type: property.listing_type }).catch(() => null);
  const similarResults = (similarRaw?.results ?? []).filter((p) => p.slug !== property.slug);
  const similar = similarResults.slice(0, 3).map(toPropertyCardShape);

  // Map markers for the detail page map
  const currentMarker: DetailMarker = {
    slug: property.slug,
    title: property.title,
    price: Number(property.price),
    price_label: property.price_label ?? "",
    lat: Number((property as any).latitude ?? 0),
    lng: Number((property as any).longitude ?? 0),
    image_url: primaryImage?.image_url ?? null,
    beds: property.bedrooms ?? 0,
    baths: property.bathrooms ?? 0,
    city: property.city,
    state: property.state,
  };
  const nearbyMarkers: DetailMarker[] = similarResults
    .filter((p) => Number.isFinite(Number(p.latitude)) && Number(p.latitude) !== 0)
    .slice(0, 20)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      price: Number(p.price),
      price_label: p.price_label ?? "",
      lat: Number(p.latitude),
      lng: Number(p.longitude),
      image_url: p.primary_image_url ?? null,
      beds: p.bedrooms ?? 0,
      baths: p.bathrooms ?? 0,
      city: p.city,
      state: p.state,
    }));

  // Pet policy: check if any amenity is pet-related
  const allAmenityNames = [
    ...amenityCategories.flatMap((c: any) => c.amenities.map((a: any) => a.name as string)),
    ...(property.amenities ?? []).map((a) => a.name),
  ];
  const isPetFriendly = allAmenityNames.some((n) =>
    /pet|dog|cat|animal/i.test(n)
  );

  const listingLabel =
    property.listing_type === "for-sale" ? "For Sale" :
    property.listing_type === "for-rent" ? "For Rent" : "For Lease";

  const listingBadgeVariant =
    property.listing_type === "for-sale" ? "sale" :
    property.listing_type === "for-rent" ? "rent" : "accent";

  const priceDisplay =
    property.listing_type === "for-rent"
      ? formatPrice(property.price, { perMonth: true })
      : formatPrice(property.price);

  const fullAddress = `${property.address}, ${property.city}, ${property.state} ${property.zip_code}`;

  const virtualTourUrl = (property as any).virtual_tour_url || (property as any).tour_360_url;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://haskerrealtygroup.com" },
      { "@type": "ListItem", position: 2, name: "Properties", item: "https://haskerrealtygroup.com/houses-for-rent" },
      {
        "@type": "ListItem",
        position: 3,
        // Use address in breadcrumb so it appears in Google's breadcrumb trail for address searches
        name: property.address
          ? `${property.address}, ${property.city}, ${property.state}`
          : property.title,
        item: `https://haskerrealtygroup.com/houses-for-rent/${decodedSlug}`,
      },
    ],
  };

  const listingSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    // Lead with full address so Google indexes the address as the canonical name of this listing
    name: property.address
      ? `${property.address}, ${property.city}, ${property.state} ${property.zip_code ?? ""}`.trim()
      : property.title,
    alternateName: property.title,
    description: property.description ?? "",
    url: `https://haskerrealtygroup.com/houses-for-rent/${property.slug}`,
    image: images.length > 0
      ? images.map((img) => ({
          "@type": "ImageObject",
          url: toOgImageUrl(img.image_url ?? FALLBACK_IMAGE),
          width: 1200,
          height: 630,
          caption: img.caption ?? property.title,
        }))
      : [{ "@type": "ImageObject", url: FALLBACK_IMAGE, width: 1200, height: 630 }],
    numberOfRooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    floorSize: { "@type": "QuantitativeValue", value: property.sqft, unitCode: "FTK" },
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address,
      addressLocality: property.city,
      addressRegion: property.state,
      postalCode: property.zip_code,
      addressCountry: "US",
    },
    ...(Number(currentMarker.lat) !== 0 && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: currentMarker.lat,
        longitude: currentMarker.lng,
      },
    }),
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "USD",
      availability: property.status === "available" ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
    },
    datePosted: (property as any).created_at ?? undefined,
    petsAllowed: isPetFriendly,
    amenityFeature: allAmenityNames.slice(0, 20).map((name) => ({
      "@type": "LocationFeatureSpecification",
      name,
      value: true,
    })),
    ...(agent && {
      broker: {
        "@type": "RealEstateAgent",
        name: agent.full_name ?? `${agent.first_name} ${agent.last_name}`,
        ...(agent.email && { email: agent.email }),
        memberOf: {
          "@type": "Organization",
          name: "Hasker & Co. Realty Group",
          url: "https://haskerrealtygroup.com",
        },
      },
    }),
  };

  return (
    <main>
      <PropertyIntentCapture city={property.city} listingType={property.listing_type} />
      <PropertyPageTracker slug={property.slug} price={Number(property.price)} listingType={property.listing_type} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listingSchema) }} />

      <div className="pt-20 bg-white">

        {/* ── PHOTO GALLERY ──────────────────────────────────────── */}
        <div className="relative">
          <PropertyImageGallery
            images={images}
            title={property.title}
            fallback={FALLBACK_IMAGE}
          />
          {/* 360° tour pill — desktop overlay */}
          {virtualTourUrl && (
            <div className="hidden md:flex absolute bottom-4 left-4 z-10 gap-2">
              <a
                href={virtualTourUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/95 backdrop-blur-sm text-brand-dark text-xs font-semibold px-3 py-2 rounded-sm shadow-md flex items-center gap-1.5 hover:bg-brand hover:text-white transition-colors"
              >
                <RotateCcw size={13} />
                360° Virtual Tour
              </a>
            </div>
          )}
          {/* Save / Share — desktop overlay */}
          <div className="hidden md:flex absolute bottom-4 right-4 gap-2 z-10">
            <div className="bg-white/95 backdrop-blur-sm rounded-sm shadow-md overflow-hidden">
              <FavoriteButton
                propertyId={property.id}
                size={14}
                showText={true}
                className="text-xs font-medium px-3 text-neutral-500 hover:text-[#FF3B30] min-w-0 min-h-0 h-9"
              />
            </div>
            <button className="bg-white/95 backdrop-blur-sm text-neutral-500 hover:text-brand text-xs font-medium px-3 py-2 rounded-sm shadow-md flex items-center gap-1.5 transition-colors">
              <Share2 size={13} /> Share
            </button>
          </div>
        </div>

        {/* Mobile: 360 tour banner */}
        {virtualTourUrl && (
          <div className="md:hidden border-b border-[#F1F5F9] bg-neutral-50">
            <VirtualTourButton url={virtualTourUrl} thumbnailUrl={primaryImage?.image_url} mobile />
          </div>
        )}

        {/* ── TITLE BAND ─────────────────────────────────────────── */}
        <div className="border-b border-[#F1F5F9]">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-9">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-[#94A3B8] mb-5">
              <Link href="/" className="hover:text-brand transition-colors">Home</Link>
              <span>/</span>
              <Link href="/houses-for-rent" className="hover:text-brand transition-colors">Homes for Rent</Link>
              <span>/</span>
              <Link
                href={`/houses-for-rent?q=${encodeURIComponent(property.city)}&listing_type=${property.listing_type}`}
                className="hover:text-brand transition-colors"
              >
                {property.city}, {property.state}
              </Link>
              <span>/</span>
              <span className="text-brand-dark truncate max-w-[200px]">{property.address || property.title}</span>
            </nav>

            <div className="flex items-start justify-between gap-10">
              {/* Left: badges + address + city */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 mb-[14px]">
                  <Badge variant={listingBadgeVariant}>{listingLabel}</Badge>
                  {property.is_featured && <Badge variant="featured">Featured</Badge>}
                  {property.status === "available" && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-[10.5px] font-semibold tracking-[0.18em] uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Move-in ready
                    </span>
                  )}
                  {property.status === "under-contract" && <Badge variant="under-contract">Under Contract</Badge>}
                  {isPetFriendly && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-[10.5px] font-semibold tracking-[0.18em] uppercase bg-amber-50 text-amber-700 border border-amber-200">
                      Pet friendly
                    </span>
                  )}
                  {(property as any).condition && (() => {
                    const cond = (property as any).condition as string;
                    const label = cond === "new" ? "New Construction" : cond.charAt(0).toUpperCase() + cond.slice(1);
                    const cls =
                      cond === "new"            ? "bg-brand/10 text-brand border-brand/20" :
                      /good|excellent/.test(cond) ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      /fair/.test(cond)          ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                   "bg-neutral-100 text-neutral-600 border-neutral-200";
                    return <span className={`inline-flex items-center px-2.5 py-1 rounded-sm text-[10.5px] font-semibold tracking-[0.18em] uppercase border ${cls}`}>{label}</span>;
                  })()}
                </div>

                <h1 className="font-serif text-[36px] sm:text-[44px] lg:text-[48px] font-black leading-[1.05] tracking-[-0.02em] text-brand-dark mb-3">
                  {property.address || property.title}
                </h1>
                <div className="flex items-center gap-1.5 text-[15px] text-[#475569]">
                  <MapPin size={16} className="text-brand shrink-0" />
                  {property.city}, {property.state} {property.zip_code}
                </div>
              </div>

              {/* Right: price — desktop only */}
              <div className="hidden lg:block text-right shrink-0">
                <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-brand">{listingLabel}</p>
                <div className="font-serif text-[44px] font-bold text-brand-dark leading-none mt-1">
                  {formatPrice(property.price)}
                  {(property.listing_type === "for-rent" || property.listing_type === "for-lease") && (
                    <span className="font-sans text-[16px] font-normal text-[#475569] ml-1">/mo</span>
                  )}
                </div>
                <div className="text-[12px] text-[#94A3B8] mt-1.5">
                  {property.sqft ? `${formatPrice(Math.round(Number(property.price) / Number(property.sqft)))}/sq ft · ` : ""}No application fee
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SPEC STRIP ─────────────────────────────────────────── */}
        <div className="border-b border-[#F1F5F9]">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-[#F1F5F9]">
              {([
                { icon: <Bed      size={20} strokeWidth={1.8} />, value: property.bedrooms  ?? "—",                            label: "Bedrooms"   },
                { icon: <Bath     size={20} strokeWidth={1.8} />, value: property.bathrooms ?? "—",                            label: "Bathrooms"  },
                { icon: <Maximize size={20} strokeWidth={1.8} />, value: property.sqft ? formatNumber(property.sqft) : "—",   label: "Sq ft"      },
                { icon: <Car      size={20} strokeWidth={1.8} />, value: property.garage ? `${property.garage}-Car` : "—",    label: "Garage"     },
                { icon: <Fence    size={20} strokeWidth={1.8} />, value: property.lot_size  ? `${property.lot_size} ac` : "—", label: "Lot size"   },
                { icon: <Calendar size={20} strokeWidth={1.8} />, value: property.year_built ?? "—",                           label: "Year built" },
              ] as { icon: React.ReactNode; value: string | number; label: string }[]).map((s) => (
                <div key={s.label} className="bg-white px-5 py-6">
                  <div className="text-brand-dark">{s.icon}</div>
                  <div className="font-serif text-[24px] font-bold text-brand-dark leading-none mt-3">{String(s.value)}</div>
                  <div className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#94A3B8] mt-1.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">

            {/* LEFT — content */}
            <div className="flex-1 min-w-0">

              {/* About this home */}
              {property.description && (
                <section className="py-16 border-b border-[#F1F5F9]">
                  <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-brand">About this home</p>
                  <h2 className="font-serif text-[32px] font-bold text-brand-dark leading-[1.15] tracking-[-0.01em] mt-2.5 mb-6">
                    {property.title}
                  </h2>
                  <p className="text-[#475569] text-[16px] leading-[1.7] whitespace-pre-line max-w-[660px]">{property.description}</p>
                </section>
              )}

              {/* Features & amenities */}
              {(amenityCategories.length > 0 || amenities.length > 0) && (
                <section className="py-16 border-b border-[#F1F5F9]">
                  <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-brand">Features &amp; amenities</p>
                  <h2 className="font-serif text-[32px] font-bold text-brand-dark leading-[1.15] tracking-[-0.01em] mt-2.5 mb-8">
                    What&apos;s included.
                  </h2>
                  {amenityCategories.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-14 gap-y-8">
                      {amenityCategories.map((cat: any) => (
                        <div key={cat.id ?? "other"}>
                          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-brand mb-4">{cat.name}</p>
                          <ul className="list-none p-0 m-0">
                            {cat.amenities.map((a: any) => (
                              <li key={a.id} className="flex items-center gap-2.5 py-2.5 border-t border-[#F1F5F9] text-[13.5px] font-medium text-brand-dark">
                                {getAmenityIconSVG(a.name, 15, "text-brand shrink-0")}
                                {a.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-14">
                      <div>
                        <ul className="list-none p-0 m-0">
                          {amenities.map((a) => (
                            <li key={a.id} className="flex items-center gap-2.5 py-2.5 border-t border-[#F1F5F9] text-[13.5px] font-medium text-brand-dark">
                              {getAmenityIconSVG(a.name, 15, "text-brand shrink-0")}
                              {a.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Property details */}
              <section className="py-16 border-b border-[#F1F5F9]">
                <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-brand">The essentials</p>
                <h2 className="font-serif text-[32px] font-bold text-brand-dark leading-[1.15] tracking-[-0.01em] mt-2.5 mb-7">
                  Property details.
                </h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-14 m-0">
                  {([
                    ["Property type", property.type ? property.type.charAt(0).toUpperCase() + property.type.slice(1) : "—"],
                    ["Listing type",  listingLabel],
                    ["Status",        property.status ? property.status.replace("-", " ") : "—"],
                    ["Year built",    property.year_built ?? "N/A"],
                    ["Stories",       property.stories ?? "N/A"],
                    ["Lot size",      property.lot_size ? `${property.lot_size} ac` : "N/A"],
                    ["Neighborhood",  property.neighborhood || property.city],
                    ["ZIP code",      property.zip_code],
                    ...((property as any).condition ? [["Condition", (property as any).condition === "new" ? "New Construction" : (property as any).condition]] : []),
                  ] as [string, string | number][]).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-baseline py-[13px] border-t border-[#F1F5F9]">
                      <dt className="text-[12.5px] text-[#94A3B8] font-medium">{k}</dt>
                      <dd className="text-[14px] text-brand-dark font-semibold m-0 capitalize">{String(v)}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              {/* Pet policy */}
              {isPetFriendly && (
                <section className="py-9 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-5 bg-[#FBF9F4] border border-[#F1F5F9] rounded-sm p-[22px] lg:p-6">
                    <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <PawPrint size={26} className="text-amber-700" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10.5px] font-semibold tracking-[0.28em] uppercase text-amber-700 mb-1">Pet-friendly home</p>
                      <p className="font-serif text-[18px] font-bold text-brand-dark leading-tight">
                        Dogs and cats welcome. No breed restrictions.
                      </p>
                    </div>
                    <div className="hidden sm:block text-right text-[12px] text-[#475569] shrink-0">
                      <div className="mb-1">Pet deposit may apply</div>
                      <div className="text-[#94A3B8]">Contact for details</div>
                    </div>
                  </div>
                </section>
              )}

              {/* Neighborhood map */}
              <section className="py-16 border-b border-[#F1F5F9]">
                <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-brand">Location</p>
                <h2 className="font-serif text-[32px] font-bold text-brand-dark leading-[1.15] tracking-[-0.01em] mt-2.5 mb-1.5">
                  Neighborhood &amp; nearby homes.
                </h2>
                <p className="text-[14px] text-[#475569] mb-5 flex items-center gap-1.5">
                  <MapPin size={14} className="text-brand shrink-0" />
                  {fullAddress}
                </p>
                <div className="rounded-sm overflow-hidden border border-[#F1F5F9]" style={{ height: 400 }}>
                  <PropertyDetailMapLoader
                    current={currentMarker}
                    nearby={nearbyMarkers}
                  />
                </div>
                <p className="text-xs text-[#94A3B8] mt-2">
                  Hover price bubbles to preview nearby listings · Click to view
                </p>
              </section>

              {/* Virtual tour */}
              {virtualTourUrl && (
                <section className="py-16 border-b border-[#F1F5F9]">
                  <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-brand">360° virtual tour</p>
                  <h2 className="font-serif text-[32px] font-bold text-brand-dark leading-[1.15] tracking-[-0.01em] mt-2.5 mb-6">
                    Walk through, anytime.
                  </h2>
                  <VirtualTourButton
                    url={virtualTourUrl}
                    thumbnailUrl={primaryImage?.image_url}
                  />
                </section>
              )}

              {/* Mobile inquiry form */}
              <div id="schedule-form-mobile" className="lg:hidden py-10 scroll-mt-24">
                <PropertyInquiryForm
                  propertySlug={property.slug}
                  propertyTitle={property.title}
                  listingType={property.listing_type}
                  propertyId={property.id}
                  propertyCity={property.city}
                />
              </div>

            </div>

            {/* RIGHT — sticky sidebar */}
            <div className="hidden lg:block w-[340px] shrink-0 pt-16">
              <div className="sticky top-24 space-y-[18px]">

                {/* Main CTA card */}
                <div className="bg-[#FBF9F4] border border-[#F1F5F9] rounded-sm p-6">
                  <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-brand">Schedule a viewing</p>
                  <p className="font-serif text-[22px] font-bold text-brand-dark leading-[1.2] mt-2 mb-[14px]">
                    See it in person.
                  </p>
                  <p className="text-[13px] text-[#475569] leading-[1.55] mb-[18px]">
                    In-person, video, or phone — pick what works. A specialist confirms within 24 hours.
                  </p>
                  <a
                    href="#schedule-form"
                    className="flex items-center justify-center gap-2 w-full h-12 bg-brand-dark hover:bg-brand text-white rounded-sm text-[14px] font-medium tracking-[0.05em] transition-colors"
                  >
                    <Calendar size={15} />
                    Schedule a tour
                  </a>
                  <div className="mt-[18px] pt-[16px] border-t border-[#F1F5F9] flex flex-col gap-2.5">
                    {([
                      { Icon: CheckCircle2, text: "Listed price is what you pay" },
                      { Icon: Shield,       text: "Inspected before listing"      },
                      { Icon: Clock,        text: "24-hour application decisions" },
                    ] as { Icon: typeof CheckCircle2; text: string }[]).map(({ Icon, text }) => (
                      <div key={text} className="flex items-center gap-2.5">
                        <Icon size={14} className="text-brand shrink-0" strokeWidth={1.8} />
                        <span className="text-[12.5px] text-[#475569]">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Apply CTAs — rentals */}
                {(property.listing_type === "for-rent" || property.listing_type === "for-lease") && (
                  <div className="bg-white border border-[#F1F5F9] rounded-sm p-5">
                    <PropertyLeadCTAs
                      mode="sidebar"
                      propertyId={property.id}
                      propertySlug={property.slug}
                      propertyTitle={property.title}
                      propertyPrice={Number(property.price)}
                      propertyCity={property.city}
                    />
                  </div>
                )}
                {property.listing_type === "for-sale" && (
                  <div className="bg-white border border-[#F1F5F9] rounded-sm p-5">
                    <Button variant="accent" className="w-full" asChild>
                      <Link href={`/contact?property=${property.slug}&inquiry=purchase`}>Request Purchase Info</Link>
                    </Button>
                  </div>
                )}

                {/* Agent card */}
                {agent && (
                  <div className="bg-white border border-[#F1F5F9] rounded-sm p-[22px]">
                    <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-brand mb-[14px]">Listed by</p>
                    <div className="flex items-center gap-[14px] mb-[14px]">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 bg-[#EFF4FF]">
                        {agent.avatar_url ? (
                          <Image src={agent.avatar_url} alt={agent.full_name} fill className="object-cover" sizes="56px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-brand font-bold text-lg">
                            {agent.first_name[0]}{agent.last_name[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-brand-dark">{agent.full_name}</p>
                        {agent.agent_profile?.license_number && (
                          <p className="font-mono text-[10.5px] text-[#94A3B8] tracking-[0.04em] mt-0.5">
                            Lic# {agent.agent_profile.license_number}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="pt-[14px] border-t border-[#F1F5F9] flex flex-col gap-2">
                      {agent.phone && (
                        <a href={`tel:${agent.phone}`} className="flex items-center gap-2 text-[13px] text-[#475569] hover:text-brand transition-colors">
                          <Phone size={13} className="text-brand shrink-0" /> {agent.phone}
                        </a>
                      )}
                      <a href={`mailto:${agent.email}`} className="flex items-center gap-2 text-[13px] text-[#475569] hover:text-brand transition-colors">
                        <Mail size={13} className="text-brand shrink-0" /> {agent.email}
                      </a>
                    </div>
                  </div>
                )}

                {/* Social proof */}
                <div className="bg-white border border-[#F1F5F9] rounded-sm p-4">
                  <div className="flex items-center gap-1 mb-1.5">
                    {[1,2,3,4,5].map((i) => (
                      <svg key={i} className="w-[11px] h-[11px]" viewBox="0 0 24 24" fill="#00B67A">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                    <span className="font-sans text-[11px] font-semibold text-brand-dark ml-1">4.9 · Trustpilot</span>
                  </div>
                  <p className="font-serif italic text-[13px] leading-[1.45] text-[#475569] mb-1.5">
                    &ldquo;Approved in less than a day. No paperwork runaround.&rdquo;
                  </p>
                  <p className="text-[11px] text-[#94A3B8]">— Marcus T., {property.city}</p>
                </div>

                {/* Inquiry form */}
                <div id="schedule-form">
                  <PropertyInquiryForm
                    propertySlug={property.slug}
                    propertyTitle={property.title}
                    listingType={property.listing_type}
                    propertyId={property.id}
                    propertyCity={property.city}
                  />
                </div>

              </div>
            </div>

          </div>

          {/* ── SIMILAR HOMES ── */}
          {similar.length > 0 && (
            <section className="pt-16 pb-16 border-t border-[#F1F5F9]">
              <div className="flex items-end justify-between mb-7">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-brand">Keep exploring</p>
                  <h2 className="font-serif text-[32px] font-bold text-brand-dark leading-[1.15] tracking-[-0.01em] mt-2.5">
                    More homes in {property.city}.
                  </h2>
                </div>
                <Link
                  href={`/houses-for-rent?q=${encodeURIComponent(property.city)}&listing_type=${property.listing_type}`}
                  className="text-[13.5px] text-brand hover:underline font-medium"
                >
                  View all rentals →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {similar.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── MOBILE STICKY BAR ──────────────────────────────────── */}
        <div
          className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#F1F5F9] shadow-xl"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">{listingLabel}</p>
              <p className="font-serif text-xl font-bold text-brand-dark leading-tight">{priceDisplay}</p>
            </div>
            {(property.listing_type === "for-rent" || property.listing_type === "for-lease") ? (
              <div className="flex-1 max-w-[65%] flex justify-end">
                <PropertyLeadCTAs
                  mode="mobile-sticky"
                  propertyId={property.id}
                  propertySlug={property.slug}
                  propertyTitle={property.title}
                  propertyPrice={Number(property.price)}
                  propertyCity={property.city}
                />
              </div>
            ) : (
              <>
                <a
                  href="#schedule-form-mobile"
                  className="flex-1 h-12 border-2 border-brand-dark text-brand-dark text-sm font-bold rounded-xl flex items-center justify-center hover:bg-brand-dark hover:text-white transition-all"
                >
                  Book a Tour
                </a>
                {property.listing_type === "for-sale" && (
                  <Link
                    href={`/contact?property=${property.slug}&inquiry=purchase`}
                    className="flex-1 h-12 bg-brand text-white text-sm font-bold rounded-xl flex items-center justify-center hover:bg-brand-hover transition-colors shadow-md shadow-brand/20"
                  >
                    Inquire Now
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        {/* Spacer for mobile sticky bar */}
        <div className="lg:hidden h-20" />

      </div>
    </main>
  );
}

// ── Category icon + color helpers ────────────────────────────────────────────
function getCategoryIcon(iconName: string): LucideIcon {
  const map: Record<string, LucideIcon> = {
    Home, ChefHat, Zap, Users, PawPrint,
  };
  return map[iconName] ?? CheckCircle2;
}

function getCategoryColors(iconName: string): { iconCls: string; bgCls: string } {
  const map: Record<string, { iconCls: string; bgCls: string }> = {
    Home:     { iconCls: "text-brand",      bgCls: "bg-brand/10"    },
    ChefHat:  { iconCls: "text-orange-600", bgCls: "bg-orange-100"  },
    Zap:      { iconCls: "text-yellow-600", bgCls: "bg-yellow-100"  },
    Users:    { iconCls: "text-violet-600", bgCls: "bg-violet-100"  },
    PawPrint: { iconCls: "text-amber-600",  bgCls: "bg-amber-100"   },
  };
  return map[iconName] ?? { iconCls: "text-brand", bgCls: "bg-brand/10" };
}

// ── Amenity icon helper ───────────────────────────────────────────────────────
interface AmenityConfig { Icon: LucideIcon; iconCls: string; bgCls: string; }

function getAmenityConfig(name: string): AmenityConfig {
  const n = name.toLowerCase();
  if (/granite|quartz|counter|island|kitchen|dishwasher|utensil|cook/.test(n))
    return { Icon: Utensils,      iconCls: "text-orange-600", bgCls: "bg-orange-100" };
  if (/refrigerator|fridge/.test(n))
    return { Icon: Refrigerator,  iconCls: "text-orange-600", bgCls: "bg-orange-100" };
  if (/microwave/.test(n))
    return { Icon: Microwave,     iconCls: "text-orange-600", bgCls: "bg-orange-100" };
  if (/stove|range|oven/.test(n))
    return { Icon: Flame,         iconCls: "text-rose-600",   bgCls: "bg-rose-100"   };
  if (/fireplace/.test(n))
    return { Icon: Flame,         iconCls: "text-red-600",    bgCls: "bg-red-100"    };
  if (/stainless|appliance/.test(n))
    return { Icon: Refrigerator,  iconCls: "text-orange-600", bgCls: "bg-orange-100" };
  if (/washer|dryer|laundry|washing/.test(n))
    return { Icon: WashingMachine,iconCls: "text-blue-600",   bgCls: "bg-blue-100"   };
  if (/air.condition|central.air|\bac\b|hvac/.test(n))
    return { Icon: Wind,          iconCls: "text-cyan-600",   bgCls: "bg-cyan-100"   };
  if (/heat|furnace|thermostat/.test(n))
    return { Icon: Thermometer,   iconCls: "text-red-600",    bgCls: "bg-red-100"    };
  if (/shower|bath/.test(n))
    return { Icon: ShowerHead,    iconCls: "text-sky-600",    bgCls: "bg-sky-100"    };
  if (/electric|utility|power/.test(n))
    return { Icon: Zap,           iconCls: "text-yellow-600", bgCls: "bg-yellow-100" };
  if (/wifi|internet|cable|network/.test(n))
    return { Icon: Wifi,          iconCls: "text-violet-600", bgCls: "bg-violet-100" };
  if (/pool|swim/.test(n))
    return { Icon: Waves,         iconCls: "text-blue-600",   bgCls: "bg-blue-100"   };
  if (/garage|parking|car/.test(n))
    return { Icon: Car,           iconCls: "text-slate-600",  bgCls: "bg-slate-100"  };
  if (/yard|fence|patio|outdoor|garden|balcony/.test(n))
    return { Icon: Fence,         iconCls: "text-green-600",  bgCls: "bg-green-100"  };
  if (/tree|park|trail|walk|nature/.test(n))
    return { Icon: TreePine,      iconCls: "text-emerald-600",bgCls: "bg-emerald-100"};
  if (/gym|fitness|dumbbell|workout/.test(n))
    return { Icon: Dumbbell,      iconCls: "text-amber-600",  bgCls: "bg-amber-100"  };
  if (/gated|security|guard|camera|alarm/.test(n))
    return { Icon: Shield,        iconCls: "text-red-600",    bgCls: "bg-red-100"    };
  if (/pet|dog|cat|animal/.test(n))
    return { Icon: PawPrint,      iconCls: "text-teal-600",   bgCls: "bg-teal-100"   };
  if (/gas/.test(n))
    return { Icon: Flame,         iconCls: "text-rose-600",   bgCls: "bg-rose-100"   };
  if (/hoa|community|club/.test(n))
    return { Icon: Home,          iconCls: "text-indigo-600", bgCls: "bg-indigo-100" };
  return   { Icon: CheckCircle2,  iconCls: "text-brand",      bgCls: "bg-brand/10"   };
}
