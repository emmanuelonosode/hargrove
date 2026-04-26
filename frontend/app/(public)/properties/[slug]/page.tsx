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
  Flame, ShowerHead, Wifi, Fence,
  type LucideIcon,
} from "lucide-react";
import { fetchPropertyBySlug, fetchAllPropertySlugs, fetchProperties, toPropertyCardShape } from "@/lib/properties";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PropertyInquiryForm } from "@/components/public/PropertyInquiryForm";
import { VirtualTourButton } from "@/components/public/VirtualTourButton";
import { PropertyImageGallery } from "@/components/public/PropertyImageGallery";
import { PropertyCard } from "@/components/public/PropertyCard";
import { PropertyDetailMapLoader } from "@/components/public/PropertyDetailMapLoader";
import { FavoriteButton } from "@/components/public/FavoriteButton";
import type { DetailMarker } from "@/components/public/PropertyDetailMap";
import { formatPrice, formatNumber } from "@/lib/utils";

export const revalidate = 300;

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80";

export async function generateStaticParams() {
  const slugs = await fetchAllPropertySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const property = await fetchPropertyBySlug(decodedSlug);
    return {
      title: `${property.title} | Hasker & Co. Realty Group`,
      description: property.description?.slice(0, 160) ?? "",
      alternates: { canonical: `https://haskerrealtygroup.com/properties/${decodedSlug}` },
      openGraph: {
        title: `${property.title} | Hasker & Co. Realty Group`,
        description: property.description?.slice(0, 160) ?? "",
        type: "website",
        url: `https://haskerrealtygroup.com/properties/${decodedSlug}`,
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
      { "@type": "ListItem", position: 2, name: "Properties", item: "https://haskerrealtygroup.com/properties" },
      { "@type": "ListItem", position: 3, name: property.title, item: `https://haskerrealtygroup.com/properties/${decodedSlug}` },
    ],
  };

  const listingSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description ?? "",
    url: `https://haskerrealtygroup.com/properties/${property.slug}`,
    image: images.length > 0
      ? images.map((i) => i.image_url)
      : [FALLBACK_IMAGE],
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
                <Link href="/properties" className="hover:text-brand transition-colors">Properties</Link>
                <span>/</span>
                <span className="text-neutral-600 truncate">{property.city}, {property.state}</span>
              </nav>

              {/* Title + badges */}
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant={listingBadgeVariant}>{listingLabel}</Badge>
                  {property.is_featured && <Badge variant="featured">Featured</Badge>}
                  {property.status === "under-contract" && <Badge variant="under-contract">Under Contract</Badge>}
                  {(property as any).condition && (
                    <span className="text-xs font-medium px-2.5 py-0.5 bg-neutral-100 text-neutral-600 rounded-full capitalize">
                      {(property as any).condition === "new" ? "New Construction" : (property as any).condition}
                    </span>
                  )}
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-dark leading-tight mb-2">
                  {property.title}
                </h1>

                <div className="flex items-start gap-1.5 text-neutral-500 text-sm">
                  <MapPin size={14} className="text-brand shrink-0 mt-0.5" />
                  <span>
                    {property.address}
                    {(property as any).cross_street && ` (near ${(property as any).cross_street})`}
                    , {property.city}, {property.state} {property.zip_code}
                  </span>
                </div>
              </div>

              {/* ── Key stats bar ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: Bed,       label: "Bedrooms",    value: property.bedrooms ?? "—" },
                  { icon: Bath,      label: "Bathrooms",   value: property.bathrooms ?? "—" },
                  { icon: Maximize,  label: "Sq Ft",       value: property.sqft ? formatNumber(property.sqft) : "—" },
                  { icon: Home,      label: "Garage",      value: property.garage ? `${property.garage}-Car` : "None" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-neutral-50 border border-neutral-100 rounded-lg p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-brand/10 flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-brand" />
                    </div>
                    <div>
                      <p className="font-bold text-brand-dark text-lg leading-none">{value}</p>
                      <p className="text-xs text-neutral-400 uppercase tracking-wide mt-0.5">{label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Description ── */}
              {property.description && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">About This Property</h2>
                  <p className="text-neutral-600 leading-relaxed whitespace-pre-line">{property.description}</p>
                </div>
              )}

              {/* ── Property details grid ── */}
              <div>
                <h2 className="font-serif text-2xl font-bold text-brand-dark mb-5">Property Details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-5">
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
                    <div key={label}>
                      <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-1">{label}</p>
                      <p className="text-sm text-brand-dark font-medium capitalize">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Amenities ── */}
              {amenityCategories.length > 0 ? (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-brand-dark mb-6">Features &amp; Amenities</h2>
                  <div className="space-y-6">
                    {amenityCategories.map((cat: any) => (
                      <div key={cat.id ?? "other"}>
                        <p className="text-xs font-semibold tracking-widest uppercase text-brand mb-3 pb-1 border-b border-brand-muted">
                          {cat.name}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4">
                          {cat.amenities.map((a: any) => (
                            <div key={a.id} className="flex items-center gap-2 text-sm text-neutral-700">
                              <span className="w-6 h-6 rounded-md bg-brand/10 flex items-center justify-center shrink-0">
                                <AmenityIcon name={a.name} />
                              </span>
                              {a.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : amenities.length > 0 ? (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-brand-dark mb-5">Features &amp; Amenities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {amenities.map((a) => (
                      <div key={a.id} className="flex items-center gap-2 text-sm text-neutral-700">
                        <span className="w-6 h-6 rounded-md bg-brand/10 flex items-center justify-center shrink-0">
                          <AmenityIcon name={a.name} />
                        </span>
                        {a.name}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* ── Pet Policy Banner ── */}
              {isPetFriendly && (
                <div className="rounded-xl border-2 border-green-200 bg-green-50 p-5 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <PawPrint size={24} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-green-800 text-lg mb-1">Pets Welcome!</h3>
                    <p className="text-green-700 text-sm leading-relaxed">
                      This home welcomes your furry family members. Cats and dogs are welcome —
                      contact us for breed/weight restrictions and pet deposit details.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {[
                        { label: "Dogs OK", icon: "🐕" },
                        { label: "Cats OK", icon: "🐈" },
                        { label: "Pet Deposit May Apply", icon: "💰" },
                      ].map(({ label, icon }) => (
                        <span key={label} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200">
                          {icon} {label}
                        </span>
                      ))}
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
              <div id="schedule-form" className="lg:hidden">
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
                    <Button variant="accent" className="w-full mb-3" asChild>
                      <Link href={`/apply?property=${property.slug}`}>Apply Now</Link>
                    </Button>
                  )}
                  <a
                    href="#schedule-form"
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
                <h2 className="font-serif text-2xl font-bold text-brand-dark">Similar Homes in {property.city}</h2>
                <Link href={`/properties?q=${encodeURIComponent(property.city)}&listing_type=${property.listing_type}`} className="text-sm text-brand hover:underline">
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
            <FavoriteButton
              propertyId={property.id}
              size={18}
              className="shrink-0 w-11 h-11 rounded-lg border border-neutral-200 bg-neutral-50 hover:border-[#FF3B30]/30 hover:bg-[#FFF5F5]"
            />
            <a
              href="#schedule-form"
              className="shrink-0 h-11 px-5 bg-brand-dark text-white text-sm font-semibold rounded-lg flex items-center gap-1.5 hover:bg-brand transition-colors"
            >
              <Calendar size={14} /> Tour
            </a>
            {(property.listing_type === "for-rent" || property.listing_type === "for-lease") && (
              <Link
                href={`/apply?property=${property.slug}`}
                className="shrink-0 h-11 px-5 bg-brand text-white text-sm font-semibold rounded-lg flex items-center hover:opacity-90 transition-opacity"
              >
                Apply
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

// ── Amenity icon helper ───────────────────────────────────────────────────────
function AmenityIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  let Icon: LucideIcon = CheckCircle2;

  if (/granite|quartz|counter|island|kitchen/.test(n))      Icon = Utensils;
  else if (/dishwasher/.test(n))                             Icon = Utensils;
  else if (/stainless|appliance|refrigerator/.test(n))      Icon = Refrigerator;
  else if (/microwave/.test(n))                              Icon = Microwave;
  else if (/stove|gas|range|oven|fireplace/.test(n))        Icon = Flame;
  else if (/washer|dryer|laundry|washing/.test(n))          Icon = WashingMachine;
  else if (/air.condition|central.air|ac\b|hvac/.test(n))   Icon = Wind;
  else if (/heat|furnace/.test(n))                           Icon = Thermometer;
  else if (/shower/.test(n))                                 Icon = ShowerHead;
  else if (/electric|zap|utility|power/.test(n))            Icon = Zap;
  else if (/wifi|internet|cable/.test(n))                    Icon = Wifi;
  else if (/pool|swim/.test(n))                              Icon = Waves;
  else if (/garage|parking|car/.test(n))                     Icon = Car;
  else if (/yard|fence|patio|outdoor|garden/.test(n))       Icon = Fence;
  else if (/tree|park|trail|walk/.test(n))                   Icon = TreePine;
  else if (/gym|fitness|dumbbell|workout/.test(n))           Icon = Dumbbell;
  else if (/gated|security|guard/.test(n))                   Icon = Shield;
  else if (/pet|dog|cat|animal/.test(n))                     Icon = PawPrint;
  else if (/hoa|community|club/.test(n))                     Icon = Home;

  return <Icon size={14} className="text-brand shrink-0" />;
}
