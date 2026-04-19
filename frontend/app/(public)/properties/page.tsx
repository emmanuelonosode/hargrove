import { Suspense } from "react";
import { SlidersHorizontal } from "lucide-react";
import { SearchBar } from "@/components/public/SearchBar";
import { PropertyCard } from "@/components/public/PropertyCard";
import { fetchProperties, toPropertyCardShape } from "@/lib/properties";

export const revalidate = 300;

export const metadata = {
  title: "Affordable Homes to Rent & Buy — Hasker & Co. Realty Group",
  description:
    "Browse affordable apartments, rental homes, and homes for sale in Atlanta, Charlotte, Houston, Dallas, Nashville, Phoenix, Austin, Denver, Tampa & Raleigh. Honest prices, no hidden fees.",
  alternates: { canonical: "https://haskerrealtygroup.com/properties" },
  openGraph: {
    title: "Affordable Homes to Rent & Buy — Hasker & Co. Realty Group",
    description: "Browse affordable rentals and homes for sale. Honest prices, no hidden fees.",
    type: "website",
    url: "https://haskerrealtygroup.com/properties",
  },
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PropertiesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const q           = params.q            as string | undefined;
  const beds        = params.beds         as string | undefined;
  const minPrice    = params.minPrice     as string | undefined;
  const maxPrice    = params.maxPrice     as string | undefined;
  const listingType = params.listing_type as string | undefined;

  let filtered: ReturnType<typeof toPropertyCardShape>[] = [];

  try {
    const data = await fetchProperties({
      listing_type: listingType, // undefined = all types
      q,
      beds,
      min_price: minPrice,
      max_price: maxPrice,
    });
    filtered = data.results.map(toPropertyCardShape);
  } catch {
    // API offline — graceful empty state
  }

  const hasFilters = q ?? beds ?? minPrice ?? maxPrice ?? listingType;

  // Build bedroom filter hrefs — preserve listing_type param if active
  const ltSuffix = listingType ? `&listing_type=${listingType}` : "";
  const bedroomFilters = [
    { label: "All",       href: "/properties" + (listingType ? `?listing_type=${listingType}` : "") },
    { label: "Studio",    href: `/properties?beds=0${ltSuffix}` },
    { label: "1-Bedroom", href: `/properties?beds=1${ltSuffix}` },
    { label: "2-Bedroom", href: `/properties?beds=2${ltSuffix}` },
    { label: "3-Bedroom", href: `/properties?beds=3${ltSuffix}` },
    { label: "4+ Beds",   href: `/properties?beds=4${ltSuffix}` },
  ];

  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://haskerrealtygroup.com" }, { "@type": "ListItem", position: 2, name: "Properties", item: "https://haskerrealtygroup.com/properties" }] };

  return (
    <div className="pt-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {/* Search hero */}
      <div className="bg-brand-dark pt-14 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-serif text-3xl font-bold text-white mb-1">
            {hasFilters ? "Search Results" : "Available Properties"}
          </h1>
          <p className="text-blue-100 text-sm mb-8">
            {filtered.length} {filtered.length === 1 ? "property" : "properties"}
            {listingType === "for-rent" ? " for rent" : listingType === "for-sale" ? " for sale" : " available"}
            {q ? ` matching "${q}"` : ""}
          </p>
          <Suspense>
            <SearchBar dark className="max-w-5xl" />
          </Suspense>
        </div>
      </div>

      {/* Listings */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        {/* Filter bar */}
        <div className="space-y-4 mb-8">
          {/* Listing type tabs */}
          <div className="flex gap-2 flex-wrap">
            {[
              { label: "All Properties", value: "" },
              { label: "For Rent",       value: "for-rent" },
              { label: "For Sale",       value: "for-sale" },
            ].map((tab) => {
              const isActive = (listingType ?? "") === tab.value;
              const href = tab.value
                ? `/properties?listing_type=${tab.value}${beds ? `&beds=${beds}` : ""}${q ? `&q=${q}` : ""}`
                : `/properties${beds ? `?beds=${beds}` : ""}${q ? `${beds ? "&" : "?"}q=${q}` : ""}`;
              return (
                <a
                  key={tab.value}
                  href={href}
                  className={`px-5 py-2.5 text-sm font-medium rounded-sm border transition-colors ${
                    isActive
                      ? "bg-brand-dark text-white border-brand-dark"
                      : "bg-white text-neutral-600 border-neutral-200 hover:border-brand-dark hover:text-brand-dark"
                  }`}
                >
                  {tab.label}
                </a>
              );
            })}
          </div>

          {/* Bedroom filters + sort */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-2 flex-wrap">
              {bedroomFilters.map((filter) => {
                const bedsParam = new URL(`http://x${filter.href}`).searchParams.get("beds");
                const isActive =
                  filter.href.startsWith("/properties") && !bedsParam
                    ? !beds
                    : beds === bedsParam;
                return (
                  <a
                    key={filter.label}
                    href={filter.href}
                    className={`px-4 py-2 text-xs font-medium tracking-wide rounded-sm border transition-colors ${
                      isActive
                        ? "bg-brand text-white border-brand"
                        : "bg-white text-brand-dark border-neutral-200 hover:border-brand-dark"
                    }`}
                  >
                    {filter.label}
                  </a>
                );
              })}
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline">Sort: Lowest Price</span>
            </div>
          </div>
        </div>

        {filtered.length > 0 ? (
          <>
            <h2 className="sr-only">Rental Listings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered
                .slice()
                .sort((a, b) => a.price - b.price)
                .map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
            </div>
          </>
        ) : (
          <div className="text-center py-24">
            <h3 className="font-serif text-2xl text-brand-dark mb-3">No Properties Found</h3>
            <p className="text-neutral-500 text-sm mb-6">
              Try adjusting your search or browse all available properties.
            </p>
            <a
              href="/properties"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
            >
              Clear filters
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
