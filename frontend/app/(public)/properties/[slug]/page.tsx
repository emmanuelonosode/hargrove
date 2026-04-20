import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Bed, Bath, Maximize, MapPin, Calendar,
  Check, Phone, Mail, Home,
  RotateCcw, Share2, Heart,
} from "lucide-react";
import { fetchPropertyBySlug, fetchAllPropertySlugs, fetchProperties, toPropertyCardShape } from "@/lib/properties";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PropertyInquiryForm } from "@/components/public/PropertyInquiryForm";
import { PropertyCard } from "@/components/public/PropertyCard";
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
    const property = await fetchPropertyBySlug(slug);
    return {
      title: `${property.title} | Hasker & Co. Realty Group`,
      description: property.description?.slice(0, 160) ?? "",
      alternates: { canonical: `https://haskerrealtygroup.com/properties/${slug}` },
      openGraph: {
        title: `${property.title} | Hasker & Co. Realty Group`,
        description: property.description?.slice(0, 160) ?? "",
        type: "website",
        url: `https://haskerrealtygroup.com/properties/${slug}`,
        images: property.images?.[0]?.image_url ? [property.images[0].image_url] : [],
      },
    };
  } catch {
    return { title: "Property Not Found" };
  }
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let property;
  try {
    property = await fetchPropertyBySlug(slug);
  } catch {
    notFound();
  }

  const images = property.images ?? [];
  const primaryImage = images.find((i) => i.is_primary) ?? images[0];
  const galleryImages = images.slice(0, 5);
  const amenityCategories = (property as any).amenity_categories ?? [];
  const amenities = amenityCategories.length === 0 ? (property.amenities ?? []) : [];
  const agent = property.agent;

  // Similar homes from same city
  const similarRaw = await fetchProperties({ q: property.city, listing_type: property.listing_type }).catch(() => null);
  const similar = (similarRaw?.results ?? [])
    .filter((p) => p.slug !== property.slug)
    .slice(0, 3)
    .map(toPropertyCardShape);

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
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`;

  const virtualTourUrl = (property as any).virtual_tour_url || (property as any).tour_360_url;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://haskerrealtygroup.com" },
      { "@type": "ListItem", position: 2, name: "Properties", item: "https://haskerrealtygroup.com/properties" },
      { "@type": "ListItem", position: 3, name: property.title, item: `https://haskerrealtygroup.com/properties/${slug}` },
    ],
  };

  const listingSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description ?? "",
    url: `https://haskerrealtygroup.com/properties/${property.slug}`,
    image: primaryImage?.image_url ?? FALLBACK_IMAGE,
    numberOfRooms: property.bedrooms,
    floorSize: { "@type": "QuantitativeValue", value: property.sqft, unitCode: "FTK" },
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address,
      addressLocality: property.city,
      addressRegion: property.state,
      postalCode: property.zip_code,
      addressCountry: "US",
    },
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "USD",
      availability: property.status === "available" ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listingSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <div className="pt-20 pb-24 lg:pb-0 bg-white">

        {/* ── PHOTO GALLERY ──────────────────────────────────────── */}
        <div className="relative">
          {/* Desktop: 5-photo grid */}
          <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-1.5 h-[520px]">
            {/* Primary — spans 2 rows */}
            <div className="col-span-2 row-span-2 relative overflow-hidden">
              <Image
                src={primaryImage?.image_url ?? FALLBACK_IMAGE}
                alt={primaryImage?.caption ?? property.title}
                fill
                className="object-cover"
                priority
                sizes="50vw"
              />
            </div>
            {/* 4 small images */}
            {galleryImages.slice(1, 5).map((img, i) => (
              <div key={img.id} className="relative overflow-hidden bg-neutral-100">
                <Image
                  src={img.image_url ?? FALLBACK_IMAGE}
                  alt={img.caption ?? `Photo ${i + 2}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  sizes="25vw"
                />
                {/* "View all" overlay on last visible thumbnail */}
                {i === 3 && images.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">+{images.length - 5} photos</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile: single hero image */}
          <div className="md:hidden relative aspect-[4/3] bg-neutral-100">
            <Image
              src={primaryImage?.image_url ?? FALLBACK_IMAGE}
              alt={property.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            {images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-sm">
                1 / {images.length}
              </div>
            )}
          </div>

          {/* Mobile thumbnail strip */}
          {images.length > 1 && (
            <div className="md:hidden flex gap-1.5 overflow-x-auto px-4 py-2 bg-neutral-50 border-b border-neutral-100 scrollbar-hide">
              {images.map((img, idx) => (
                <div key={img.id} className="relative w-16 h-12 shrink-0 rounded overflow-hidden bg-neutral-200">
                  <Image src={img.image_url ?? FALLBACK_IMAGE} alt={`Photo ${idx + 1}`} fill className="object-cover" sizes="64px" />
                </div>
              ))}
            </div>
          )}

          {/* 360° Tour button overlay */}
          {virtualTourUrl && (
            <a
              href={virtualTourUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 left-4 bg-white text-brand-dark text-xs font-semibold px-3 py-2 rounded-md shadow-lg flex items-center gap-1.5 hover:bg-brand hover:text-white transition-colors z-10"
            >
              <RotateCcw size={13} />
              360° Virtual Tour
            </a>
          )}

          {/* Save / Share buttons */}
          <div className="absolute bottom-4 right-4 flex gap-2 z-10">
            <button className="bg-white text-neutral-500 hover:text-red-500 text-xs font-medium px-3 py-2 rounded-md shadow-lg flex items-center gap-1.5 transition-colors">
              <Heart size={13} /> Save
            </button>
            <button className="bg-white text-neutral-500 hover:text-brand text-xs font-medium px-3 py-2 rounded-md shadow-lg flex items-center gap-1.5 transition-colors">
              <Share2 size={13} /> Share
            </button>
          </div>
        </div>

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
                      <p className="text-[10px] text-neutral-400 uppercase tracking-wide mt-0.5">{label}</p>
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
                      <p className="text-[10px] font-semibold tracking-widest uppercase text-neutral-400 mb-1">{label}</p>
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2.5 gap-x-4">
                          {cat.amenities.map((a: any) => (
                            <div key={a.id} className="flex items-center gap-2 text-sm text-neutral-700">
                              <Check size={13} className="text-brand shrink-0" />
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
                        <Check size={13} className="text-brand shrink-0" />
                        {a.name}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* ── MAP ── */}
              <div>
                <h2 className="font-serif text-2xl font-bold text-brand-dark mb-2">Neighborhood Overview</h2>
                <p className="text-sm text-neutral-500 mb-4 flex items-center gap-1.5">
                  <MapPin size={13} className="text-brand" />
                  {fullAddress}
                </p>
                <div className="rounded-lg overflow-hidden border border-neutral-200 shadow-sm">
                  <iframe
                    src={mapEmbedUrl}
                    width="100%"
                    height="380"
                    style={{ border: 0, display: "block" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Map of ${fullAddress}`}
                  />
                </div>
                <a
                  href={`https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-brand mt-2 hover:underline"
                >
                  Open in Google Maps →
                </a>
              </div>

              {/* ── 360° Virtual Tour (inline embed if possible) ── */}
              {(property as any).virtual_tour_url && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">360° Virtual Tour</h2>
                  <div className="rounded-lg overflow-hidden border border-neutral-200 shadow-sm aspect-video">
                    <iframe
                      src={(property as any).virtual_tour_url}
                      width="100%"
                      height="100%"
                      style={{ border: 0, display: "block" }}
                      allowFullScreen
                      loading="lazy"
                      title="360° Virtual Tour"
                    />
                  </div>
                </div>
              )}

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
                    <p className="text-[10px] font-semibold tracking-widest uppercase text-neutral-400 mb-4">Listed By</p>
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

        {/* ── MOBILE STICKY BAR ── */}
        <div
          className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-neutral-200 shadow-xl"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">{listingLabel}</p>
              <p className="font-serif text-xl font-bold text-brand-dark leading-tight">{priceDisplay}</p>
            </div>
            <a
              href="#schedule-form"
              className="shrink-0 h-11 px-4 bg-brand-dark text-white text-sm font-medium rounded-md flex items-center gap-1.5 hover:bg-brand transition-colors"
            >
              <Calendar size={14} /> Tour
            </a>
            {(property.listing_type === "for-rent" || property.listing_type === "for-lease") && (
              <Link
                href={`/apply?property=${property.slug}`}
                className="shrink-0 h-11 px-4 bg-brand text-white text-sm font-medium rounded-md flex items-center hover:bg-brand-hover transition-colors"
              >
                Apply
              </Link>
            )}
          </div>

          {/* Mobile inquiry form — below sticky bar via scrolling */}
          <div className="px-4 pb-4 pt-2 border-t border-neutral-100 bg-neutral-50">
            <div id="schedule-form-mobile">
              <PropertyInquiryForm
                propertySlug={property.slug}
                propertyTitle={property.title}
                listingType={property.listing_type}
              />
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
