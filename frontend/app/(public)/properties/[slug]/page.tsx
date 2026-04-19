import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Bed, Bath, Maximize, MapPin, Calendar,
  Check, Phone, Mail, ArrowLeft, Home,
} from "lucide-react";
import { fetchPropertyBySlug, fetchAllPropertySlugs } from "@/lib/properties";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PropertyInquiryForm } from "@/components/public/PropertyInquiryForm";
import { formatPrice, formatNumber } from "@/lib/utils";

export const revalidate = 300;

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80";

export async function generateStaticParams() {
  const slugs = await fetchAllPropertySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  try {
    const { slug } = await params;
    const property = await fetchPropertyBySlug(slug);
    return {
      title: `${property.title} — Hasker & Co. Realty Group`,
      description: property.description?.slice(0, 160) ?? "",
      alternates: { canonical: `https://haskerrealtygroup.com/properties/${slug}` },
      openGraph: { title: `${property.title} — Hasker & Co. Realty Group`, description: property.description?.slice(0, 160) ?? "", type: "website", url: `https://haskerrealtygroup.com/properties/${slug}` },
    };
  } catch {
    return { title: "Property Not Found" };
  }
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let property;
  try {
    property = await fetchPropertyBySlug(slug);
  } catch {
    notFound();
  }

  const images = property.images ?? [];
  const primaryImage = images.find((i) => i.is_primary) ?? images[0];
  const otherImages  = images.filter((i) => !i.is_primary);
  const amenities    = property.amenities ?? [];
  const agent        = property.agent;

  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://haskerrealtygroup.com" }, { "@type": "ListItem", position: 2, name: "Properties", item: "https://haskerrealtygroup.com/properties" }, { "@type": "ListItem", position: 3, name: property.title, item: `https://haskerrealtygroup.com/properties/${slug}` }] };

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

  const listingSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description ?? "",
    url: `https://haskerrealtygroup.com/properties/${property.slug}`,
    image: (primaryImage?.image_url ?? FALLBACK_IMAGE),
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
      availability: property.status === "available"
        ? "https://schema.org/InStock"
        : "https://schema.org/SoldOut",
    },
  };

  return (
    <>
      {/* JSON-LD structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listingSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      {/* ── Main content — extra bottom padding on mobile for sticky bar ── */}
      <div className="pt-20 pb-28 lg:pb-0">
        {/* Breadcrumb */}
        <div className="bg-brand-light border-b border-brand-muted">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center gap-2 text-xs text-neutral-500">
            <Link href="/" className="hover:text-brand transition-colors">Home</Link>
            <span>/</span>
            <Link href="/properties" className="hover:text-brand transition-colors">Available Rentals</Link>
            <span>/</span>
            <span className="text-brand-dark truncate max-w-[180px] sm:max-w-xs">{property.title}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-10">
          {/* Back */}
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-brand transition-colors mb-6"
          >
            <ArrowLeft size={14} /> Back to available rentals
          </Link>

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6 lg:mb-8">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant={listingBadgeVariant}>{listingLabel}</Badge>
                {property.is_featured && <Badge variant="featured">Featured</Badge>}
                {property.status === "under-contract" && (
                  <Badge variant="under-contract">Under Contract</Badge>
                )}
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-dark leading-tight mb-2">
                {property.title}
              </h1>
              <div className="flex items-center gap-2 text-neutral-500 text-sm">
                <MapPin size={14} className="text-brand shrink-0" />
                <span>{property.address}, {property.city}, {property.state} {property.zip_code}</span>
              </div>
            </div>
            {/* Price — hidden on mobile (shown in sticky bar) */}
            <div className="hidden lg:block shrink-0 text-right">
              <p className="font-serif text-4xl font-bold text-brand-dark">{priceDisplay}</p>
              {property.sqft && property.listing_type !== "for-rent" && (
                <p className="text-xs text-neutral-500 mt-1">
                  {formatPrice(Math.round(property.price / property.sqft))}/sqft
                </p>
              )}
            </div>
            {/* Mobile price inline */}
            <div className="lg:hidden">
              <p className="font-serif text-3xl font-bold text-brand-dark">{priceDisplay}</p>
              {property.sqft && property.listing_type !== "for-rent" && (
                <p className="text-xs text-neutral-500 mt-0.5">
                  {formatPrice(Math.round(property.price / property.sqft))}/sqft
                </p>
              )}
            </div>
          </div>

          {/* ── Desktop image gallery ── */}
          <div className="hidden md:grid grid-cols-4 gap-2 mb-10 rounded-sm overflow-hidden">
            <div className="col-span-2 relative aspect-auto row-span-2">
              <Image
                src={primaryImage?.image_url ?? FALLBACK_IMAGE}
                alt={primaryImage?.caption ?? property.title}
                fill
                className="object-cover"
                priority
                sizes="50vw"
              />
            </div>
            {otherImages.slice(0, 4).map((img) => (
              <div key={img.id} className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={img.image_url ?? FALLBACK_IMAGE}
                  alt={img.caption ?? ""}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                  sizes="25vw"
                />
              </div>
            ))}
          </div>

          {/* ── Mobile image gallery ── */}
          <div className="md:hidden mb-8">
            <div className="relative aspect-[4/3] rounded-sm overflow-hidden bg-neutral-100">
              <Image
                src={primaryImage?.image_url ?? FALLBACK_IMAGE}
                alt={primaryImage?.caption ?? property.title}
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
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 mt-2 -mx-6 px-6 scrollbar-hide">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    className="relative w-[72px] h-14 shrink-0 rounded-sm overflow-hidden bg-neutral-100"
                  >
                    <Image
                      src={img.image_url ?? FALLBACK_IMAGE}
                      alt={img.caption ?? `Photo ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="72px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content + sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            {/* Left: Details */}
            <div className="lg:col-span-2 space-y-10">
              {/* Key stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { icon: Bed,      label: "Bedrooms",    value: property.bedrooms },
                  { icon: Bath,     label: "Bathrooms",   value: property.bathrooms },
                  { icon: Maximize, label: "Square Feet", value: formatNumber(property.sqft) },
                  { icon: Home,     label: "Lot Size",    value: property.lot_size ? `${property.lot_size} ac` : "N/A" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-brand-light rounded-sm p-4 text-center">
                    <Icon size={18} className="text-brand mx-auto mb-2" />
                    <p className="font-serif text-xl font-bold text-brand-dark">{value}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              {property.description && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                    About This Property
                  </h2>
                  <p className="text-neutral-600 leading-relaxed">{property.description}</p>
                </div>
              )}

              {/* Property details */}
              <div>
                <h2 className="font-serif text-2xl font-bold text-brand-dark mb-5">
                  Property Details
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-4">
                  {[
                    { label: "Property Type", value: property.type.charAt(0).toUpperCase() + property.type.slice(1) },
                    { label: "Listing Type",  value: listingLabel },
                    { label: "Status",        value: property.status.replace("-", " ") },
                    { label: "Year Built",    value: property.year_built ?? "N/A" },
                    { label: "Garage",        value: property.garage ? `${property.garage}-Car` : "N/A" },
                    { label: "Stories",       value: property.stories ?? "N/A" },
                    { label: "City",          value: property.city },
                    { label: "State",         value: property.state },
                    { label: "ZIP",           value: property.zip_code },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs font-semibold tracking-wide text-neutral-400 uppercase mb-1">
                        {label}
                      </p>
                      <p className="text-sm text-brand-dark font-medium capitalize">
                        {String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              {amenities.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-brand-dark mb-5">
                    Features &amp; Amenities
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {amenities.map((amenity) => (
                      <div key={amenity.id} className="flex items-center gap-2 text-sm text-neutral-700">
                        <Check size={14} className="text-brand shrink-0" />
                        {amenity.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile-only: Quick apply CTA */}
              {(property.listing_type === "for-rent" || property.listing_type === "for-lease") && (
                <div className="lg:hidden bg-brand-light border border-brand-muted rounded-sm p-5">
                  <p className="font-serif text-lg font-bold text-brand-dark mb-2">
                    Ready to Apply?
                  </p>
                  <p className="text-sm text-neutral-500 mb-4">
                    Online rental application — decision within 24 hours.
                  </p>
                  <Button variant="accent" className="w-full" asChild>
                    <Link href={`/apply?property=${property.slug}`}>
                      Start Application
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Right: Agent + inquiry */}
            <div className="space-y-6">
              {/* Agent card */}
              {agent && (
                <div className="bg-brand-light border border-brand-muted rounded-sm p-6">
                  <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-4">
                    Listed By
                  </p>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 bg-brand-muted">
                      {agent.avatar_url ? (
                        <Image
                          src={agent.avatar_url}
                          alt={agent.full_name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-brand text-white text-lg font-bold">
                          {agent.first_name[0]}{agent.last_name[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-brand-dark">{agent.full_name}</p>
                      {agent.agent_profile?.specialties?.[0] && (
                        <p className="text-xs text-neutral-500">{agent.agent_profile.specialties[0]}</p>
                      )}
                      {agent.agent_profile?.license_number && (
                        <p className="text-xs text-neutral-400 mt-0.5">Lic# {agent.agent_profile.license_number}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {agent.phone && (
                      <a
                        href={`tel:${agent.phone}`}
                        className="flex items-center gap-2 text-sm text-neutral-600 hover:text-brand transition-colors"
                      >
                        <Phone size={14} /> {agent.phone}
                      </a>
                    )}
                    <a
                      href={`mailto:${agent.email}`}
                      className="flex items-center gap-2 text-sm text-neutral-600 hover:text-brand transition-colors"
                    >
                      <Mail size={14} /> {agent.email}
                    </a>
                  </div>
                </div>
              )}

              {/* Inquiry form */}
              <div id="schedule-form" className="bg-brand-dark text-white rounded-sm p-6">
                <h3 className="font-serif text-xl font-bold mb-1">Schedule a Viewing</h3>
                <p className="text-blue-100 text-xs mb-5">
                  A rental specialist will get back to you within 24 hours.
                </p>
                <PropertyInquiryForm
                  propertySlug={property.slug}
                  propertyTitle={property.title}
                  listingType={property.listing_type}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky CTA bar ── */}
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
            className="shrink-0 h-11 px-4 bg-brand-dark text-white text-sm font-medium rounded-sm flex items-center gap-1.5 hover:bg-brand transition-colors"
          >
            <Calendar size={14} />
            <span className="hidden xs:inline">Schedule</span>
            <span className="xs:hidden">View</span>
          </a>
          {(property.listing_type === "for-rent" || property.listing_type === "for-lease") && (
            <Link
              href={`/apply?property=${property.slug}`}
              className="shrink-0 h-11 px-4 bg-brand text-white text-sm font-medium rounded-sm flex items-center hover:bg-brand-hover transition-colors"
            >
              Apply Now
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
