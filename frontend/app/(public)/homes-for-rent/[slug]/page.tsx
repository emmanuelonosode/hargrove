import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Bed, Bath, Maximize, MapPin, Calendar,
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
import type { DetailMarker } from "@/components/public/PropertyDetailMap";
import { PropertyPageTracker } from "@/components/public/PropertyPageTracker";
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
      alternates: { canonical: `https://haskerrealtygroup.com/homes-for-rent/${decodedSlug}` },
      openGraph: {
        title: `${seoTitle} | Hasker & Co. Realty Group`,
        description: seoDesc.slice(0, 160),
        type: "website",
        url: `https://haskerrealtygroup.com/homes-for-rent/${decodedSlug}`,
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
      { "@type": "ListItem", position: 2, name: "Properties", item: "https://haskerrealtygroup.com/homes-for-rent" },
      {
        "@type": "ListItem",
        position: 3,
        // Use address in breadcrumb so it appears in Google's breadcrumb trail for address searches
        name: property.address
          ? `${property.address}, ${property.city}, ${property.state}`
          : property.title,
        item: `https://haskerrealtygroup.com/homes-for-rent/${decodedSlug}`,
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
    url: `https://haskerrealtygroup.com/homes-for-rent/${property.slug}`,
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

          {/* 360° Tour pill — desktop overlay on gallery */}
          {virtualTourUrl && (
            <div className="hidden md:flex absolute bottom-4 left-4 z-10 gap-2">
              <a
                href={virtualTourUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/95 backdrop-blur-sm text-brand-dark text-xs font-semibold px-3 py-2 rounded-lg shadow-lg flex items-center gap-1.5 hover:bg-brand hover:text-white transition-colors"
              >
                <RotateCcw size={13} />
                360° Virtual Tour
              </a>
            </div>
          )}

          {/* Save / Share — desktop overlay */}
          <div className="hidden md:flex absolute bottom-4 right-4 gap-2 z-10">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
              <FavoriteButton
                propertyId={property.id}
                size={14}
                showText={true}
                className="text-xs font-medium px-3 text-neutral-500 hover:text-[#FF3B30] min-w-0 min-h-0 h-9"
              />
            </div>
            <button className="bg-white/95 backdrop-blur-sm text-neutral-500 hover:text-brand text-xs font-medium px-3 py-2 rounded-lg shadow-lg flex items-center gap-1.5 transition-colors">
              <Share2 size={13} /> Share
            </button>
          </div>
        </div>

        {/* Mobile: 360 tour banner (below gallery, above content) */}
        {virtualTourUrl && (
          <div className="md:hidden border-b border-neutral-100 bg-neutral-50">
            <VirtualTourButton url={virtualTourUrl} thumbnailUrl={primaryImage?.image_url} mobile />
          </div>
        )}

        {/* ── MAIN CONTENT ────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* LEFT — property details */}
            <div className="lg:col-span-2 space-y-10">

              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-xs text-neutral-400">
                <Link href="/" className="hover:text-brand transition-colors">Home</Link>
                <span>/</span>
                <Link href="/homes-for-rent" className="hover:text-brand transition-colors">Homes for Rent</Link>
                <span>/</span>
                <span className="text-neutral-600 truncate">{property.city}, {property.state}</span>
              </nav>

              {/* Title + badges */}
              <div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant={listingBadgeVariant}>{listingLabel}</Badge>
                  {property.is_featured && <Badge variant="featured">Featured</Badge>}
                  {property.status === "under-contract" && <Badge variant="under-contract">Under Contract</Badge>}
                  {(property as any).condition && (() => {
                    const cond = (property as any).condition as string;
                    const label = cond === "new" ? "New Construction" : cond.charAt(0).toUpperCase() + cond.slice(1);
                    const cls =
                      cond === "new"       ? "bg-brand/10 text-brand border-brand/20" :
                      /good|excellent/.test(cond) ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      /fair/.test(cond)    ? "bg-amber-50 text-amber-700 border-amber-200" :
                                            "bg-neutral-100 text-neutral-600 border-neutral-200";
                    return (
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${cls}`}>
                        {label}
                      </span>
                    );
                  })()}
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-neutral-800 leading-tight mb-3">
                  {property.title}
                </h1>

                <div className="flex items-start gap-2 text-neutral-500 text-sm">
                  <MapPin size={15} className="text-brand shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    {property.address}, {property.city}, {property.state} {property.zip_code}
                  </span>
                </div>
              </div>

              {/* ── Key stats bar ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: Bed,      label: "Bedrooms",  value: property.bedrooms ?? "—",                           iconCls: "text-blue-600",   bgCls: "bg-blue-50"   },
                  { icon: Bath,     label: "Bathrooms", value: property.bathrooms ?? "—",                          iconCls: "text-teal-600",   bgCls: "bg-teal-50"   },
                  { icon: Maximize, label: "Sq Ft",     value: property.sqft ? formatNumber(property.sqft) : "—",  iconCls: "text-amber-600",  bgCls: "bg-amber-50"  },
                  { icon: Home,     label: "Garage",    value: property.garage ? `${property.garage}-Car` : "None",iconCls: "text-slate-600",  bgCls: "bg-slate-100" },
                ].map(({ icon: Icon, label, value, iconCls, bgCls }) => (
                  <div key={label} className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${bgCls}`}>
                      <Icon size={20} className={iconCls} />
                    </div>
                    <div>
                      <p className="font-black text-brand-dark text-[1.5rem] leading-none">{value}</p>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.12em] mt-1">{label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Description ── */}
              {property.description && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">About This Property</h2>
                  <p className="text-neutral-600 text-[15px] leading-[1.8] whitespace-pre-line">{property.description}</p>
                </div>
              )}

              {/* ── Property details grid ── */}
              <div>
                <h2 className="font-serif text-2xl font-bold text-brand-dark mb-5">Property Details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Property Type",  value: property.type?.charAt(0).toUpperCase() + property.type?.slice(1) },
                    { label: "Listing Type",   value: listingLabel },
                    { label: "Status",         value: property.status?.replace("-", " ") },
                    { label: "Year Built",     value: property.year_built ?? "N/A" },
                    { label: "Stories",        value: property.stories ?? "N/A" },
                    { label: "Lot Size",       value: property.lot_size ? `${property.lot_size} ac` : "N/A" },
                    { label: "Neighborhood",   value: property.neighborhood || property.city },
                    { label: "ZIP Code",       value: property.zip_code },
                    ...((property as any).condition ? [{ label: "Condition", value: (property as any).condition === "new" ? "New Construction" : (property as any).condition }] : []),
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3.5">
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-neutral-400 mb-1">{label}</p>
                      <p className="text-[14px] text-brand-dark font-bold capitalize">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Amenities ── */}
              {amenityCategories.length > 0 ? (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-brand-dark mb-7">Features &amp; Amenities</h2>
                  <div className="space-y-8">
                    {amenityCategories.map((cat: any) => {
                      const CatIcon = getCategoryIcon(cat.icon);
                      const { iconCls: catIconCls, bgCls: catBgCls } = getCategoryColors(cat.icon);
                      return (
                        <div key={cat.id ?? "other"}>
                          {/* Category header with icon */}
                          <div className="flex items-center gap-2.5 mb-4">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${catBgCls}`}>
                              <CatIcon size={16} className={catIconCls} />
                            </div>
                            <span className="text-[13px] font-bold text-neutral-700">{cat.name}</span>
                            <div className="flex-1 h-px bg-neutral-100 ml-1" />
                          </div>
                          {/* Amenity list */}
                          <div className="grid grid-cols-2 gap-x-8 gap-y-0">
                            {cat.amenities.map((a: any) => {
                              const { Icon, iconCls } = getAmenityConfig(a.name);
                              return (
                                <div key={a.id} className="flex items-center gap-2.5 py-2.5 border-b border-neutral-100 last:border-0">
                                  <Icon size={15} className={`${iconCls} shrink-0`} strokeWidth={1.8} />
                                  <span className="text-[13px] font-medium text-neutral-700 leading-tight">{a.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : amenities.length > 0 ? (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-brand-dark mb-6">Features &amp; Amenities</h2>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-0">
                    {amenities.map((a) => {
                      const { Icon, iconCls } = getAmenityConfig(a.name);
                      return (
                        <div key={a.id} className="flex items-center gap-2.5 py-2.5 border-b border-neutral-100 last:border-0">
                          <Icon size={15} className={`${iconCls} shrink-0`} strokeWidth={1.8} />
                          <span className="text-[13px] font-medium text-neutral-700 leading-tight">{a.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* ── Pet Policy Banner ── */}
              {isPetFriendly && (
                <div className="relative overflow-hidden rounded-2xl bg-amber-50 border border-amber-200">
                  {/* Decorative background paws */}
                  <PawPrint size={140} className="absolute -right-8 -top-8 text-amber-300 opacity-[0.18] rotate-12 pointer-events-none" />
                  <PawPrint size={72} className="absolute right-16 bottom-2 text-amber-300 opacity-[0.12] -rotate-6 pointer-events-none" />

                  <div className="relative p-6 sm:p-8">
                    <div className="flex items-start gap-5">
                      <div className="shrink-0 w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-200/60">
                        <PawPrint size={26} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black tracking-[0.25em] uppercase text-amber-600 mb-1">Pet Friendly Home</p>
                        <h3 className="font-serif text-2xl font-bold text-amber-950 mb-2">Pets Are Welcome Here</h3>
                        <p className="text-amber-800/70 text-sm leading-relaxed mb-5">
                          Your four-legged family members are part of this home too. Dogs and cats are welcome — reach out for breed, weight, and deposit details.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {([
                            { label: "Dogs Welcome", Icon: Dog },
                            { label: "Cats Welcome", Icon: Cat },
                            { label: "Deposit May Apply", Icon: PawPrint },
                          ] as { label: string; Icon: LucideIcon }[]).map(({ label, Icon }) => (
                            <span key={label} className="inline-flex items-center gap-1.5 text-[12px] font-bold bg-white text-amber-700 px-3.5 py-2 rounded-full border border-amber-200 shadow-sm">
                              <Icon size={13} /> {label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Neighborhood Map ── */}
              <div>
                <h2 className="font-serif text-2xl font-bold text-brand-dark mb-1">Neighborhood &amp; Nearby Homes</h2>
                <p className="text-sm text-neutral-500 mb-4 flex items-center gap-1.5">
                  <MapPin size={13} className="text-brand" />
                  {fullAddress}
                </p>
                <div className="rounded-xl overflow-hidden border border-neutral-200 shadow-sm" style={{ height: 400 }}>
                  <PropertyDetailMapLoader
                    current={currentMarker}
                    nearby={nearbyMarkers}
                  />
                </div>
                <p className="text-xs text-neutral-400 mt-2">
                  Hover price bubbles to preview nearby listings · Click to view
                </p>
              </div>

              {/* ── 360° Virtual Tour ── */}
              {(property as any).virtual_tour_url && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">360° Virtual Tour</h2>
                  <VirtualTourButton
                    url={(property as any).virtual_tour_url}
                    thumbnailUrl={primaryImage?.image_url}
                  />
                </div>
              )}

              {/* ── Mobile inquiry form (inline, not fixed) ── */}
              <div id="schedule-form-mobile" className="lg:hidden scroll-mt-24">
                <h2 className="font-serif text-2xl font-bold text-brand-dark mb-1">Schedule a Viewing</h2>
                <p className="text-neutral-500 text-sm mb-5">Response within 24 hours.</p>
                <div className="bg-brand-dark text-white rounded-xl p-5">
                  <PropertyInquiryForm
                    propertySlug={property.slug}
                    propertyTitle={property.title}
                    listingType={property.listing_type}
                  />
                </div>
              </div>

            </div>

            {/* RIGHT — sticky sidebar */}
            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-5">

                {/* Price card */}
                <div className="bg-white border border-neutral-200 rounded-xl shadow-md p-6">
                  <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-1">{listingLabel}</p>
                  <p className="font-serif text-4xl font-bold text-brand-dark mb-1">{priceDisplay}</p>
                  {property.sqft && property.listing_type !== "for-rent" && (
                    <p className="text-xs text-neutral-400 mb-5">{formatPrice(Math.round(property.price / property.sqft))}/sqft</p>
                  )}

                  {(property.listing_type === "for-rent" || property.listing_type === "for-lease") && (
                    <>
                      <p className="text-xs text-amber-600 font-medium flex items-center gap-1.5 mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block shrink-0" />
                        Properties like this typically rent within 5–7 days
                      </p>

                      {/* Social proof */}
                      <div className="bg-neutral-50 border border-neutral-100 rounded-lg px-4 py-3 mb-4">
                        <div className="flex items-center gap-0.5 mb-1">
                          {[1,2,3,4,5].map((i) => (
                            <svg key={i} className="w-3 h-3" viewBox="0 0 24 24" fill="#F59E0B">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          ))}
                        </div>
                        <p className="text-[12px] text-neutral-600 leading-snug italic">
                          &ldquo;Approved in less than a day. The whole process was so easy — no paperwork runaround.&rdquo;
                        </p>
                        <p className="text-[11px] text-neutral-400 mt-1 font-medium">— Marcus T., {property.city}</p>
                      </div>

                      <Button variant="accent" className="w-full mb-3" asChild>
                        <Link href={`/apply?property=${property.slug}`}>Apply Free — Decision in 24 Hours</Link>
                      </Button>
                    </>
                  )}
                  {property.listing_type === "for-sale" && (
                    <Button variant="accent" className="w-full mb-3" asChild>
                      <Link href={`/contact?property=${property.slug}&inquiry=purchase`}>Request Purchase Info</Link>
                    </Button>
                  )}
                  <a
                    href="#schedule-form-mobile"
                    className="w-full flex items-center justify-center gap-2 border border-brand-dark text-brand-dark text-sm font-semibold py-2.5 rounded-md hover:bg-brand-dark hover:text-white transition-colors"
                  >
                    <Calendar size={14} />
                    Schedule a Tour
                  </a>
                </div>

                {/* Agent card */}
                {agent && (
                  <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
                    <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-4">Listed By</p>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-neutral-100">
                        {agent.avatar_url ? (
                          <Image src={agent.avatar_url} alt={agent.full_name} fill className="object-cover" sizes="48px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-brand text-white text-base font-bold">
                            {agent.first_name[0]}{agent.last_name[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-brand-dark text-sm">{agent.full_name}</p>
                        {agent.agent_profile?.license_number && (
                          <p className="text-xs text-neutral-400">Lic# {agent.agent_profile.license_number}</p>
                        )}
                      </div>
                    </div>
                    {agent.phone && (
                      <a href={`tel:${agent.phone}`} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-brand transition-colors mb-2">
                        <Phone size={13} /> {agent.phone}
                      </a>
                    )}
                    <a href={`mailto:${agent.email}`} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-brand transition-colors">
                      <Mail size={13} /> {agent.email}
                    </a>
                  </div>
                )}

                {/* Inquiry form */}
                <div id="schedule-form" className="bg-brand-dark text-white rounded-xl p-5">
                  <h3 className="font-serif text-lg font-bold mb-1">Schedule a Viewing</h3>
                  <p className="text-blue-100 text-xs mb-4">Response within 24 hours.</p>
                  <PropertyInquiryForm
                    propertySlug={property.slug}
                    propertyTitle={property.title}
                    listingType={property.listing_type}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── SIMILAR HOMES ── */}
          {similar.length > 0 && (
            <section className="mt-16 pt-10 border-t border-neutral-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-brand-dark">More Affordable Homes in {property.city}</h2>
                  <p className="text-xs text-neutral-500 mt-1">Browse and compare — no account needed</p>
                </div>
                <Link href={`/homes-for-rent?q=${encodeURIComponent(property.city)}&listing_type=${property.listing_type}`} className="text-sm text-brand hover:underline">
                  View all →
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

        {/* ── MOBILE STICKY BAR (action buttons only — no form) ── */}
        <div
          className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-neutral-200 shadow-xl"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">{listingLabel}</p>
              <p className="font-serif text-xl font-bold text-brand-dark leading-tight">{priceDisplay}</p>
            </div>
            <a
              href="#schedule-form-mobile"
              className="shrink-0 h-11 px-5 bg-brand-dark text-white text-sm font-semibold rounded-lg flex items-center gap-1.5 hover:bg-brand transition-colors"
            >
              <Calendar size={14} /> Tour
            </a>
            {(property.listing_type === "for-rent" || property.listing_type === "for-lease") && (
              <Link
                href={`/apply?property=${property.slug}`}
                className="shrink-0 h-11 px-5 bg-brand text-white text-sm font-semibold rounded-lg flex items-center hover:opacity-90 transition-opacity"
              >
                Apply Free
              </Link>
            )}
            {property.listing_type === "for-sale" && (
              <Link
                href={`/contact?property=${property.slug}&inquiry=purchase`}
                className="shrink-0 h-11 px-5 bg-brand text-white text-sm font-semibold rounded-lg flex items-center hover:opacity-90 transition-opacity"
              >
                Inquire
              </Link>
            )}
          </div>
        </div>

        {/* Spacer so mobile sticky bar doesn't cover last section */}
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
