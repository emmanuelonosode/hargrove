import { Suspense } from "react";
import dynamic from "next/dynamic";
import { SearchBar } from "@/components/public/SearchBar";
import { PropertyCard } from "@/components/public/PropertyCard";
import { fetchProperties, toPropertyCardShape, PropertyListItemAPI } from "@/lib/properties";
import { SortBar } from "@/components/public/SortBar";
import type { MapMarker } from "@/components/public/PropertiesMap";

// Load map client-side only (Leaflet needs window)
const PropertiesMap = dynamic(
  () => import("@/components/public/PropertiesMap").then((m) => m.PropertiesMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-neutral-100 animate-pulse" /> }
);

export const revalidate = 300;

export const metadata = {
  title: "Homes to Rent & Buy Across America | Hasker & Co. Realty Group",
  description:
    "Browse affordable apartments, rental homes, and homes for sale across America — Atlanta, Charlotte, Houston, Miami, Phoenix, Seattle and more. Honest prices, no hidden fees.",
  alternates: { canonical: "https://haskerrealtygroup.com/properties" },
  openGraph: {
    title: "Homes to Rent & Buy Across America | Hasker & Co. Realty Group",
    description: "Browse affordable rentals and homes for sale. Honest prices, no hidden fees.",
    type: "website",
    url: "https://haskerrealtygroup.com/properties",
  },
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const PAGE_SIZE = 24;

const SORT_OPTIONS = [
  { value: "newest",     label: "Newest" },
  { value: "price_asc",  label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "beds_desc",  label: "Most Bedrooms" },
  { value: "sqft_desc",  label: "Largest" },
];

const BED_FILTERS = [
  { label: "Any",    value: "" },
  { label: "Studio", value: "0" },
  { label: "1+",     value: "1" },
  { label: "2+",     value: "2" },
  { label: "3+",     value: "3" },
  { label: "4+",     value: "4" },
];

export default async function PropertiesPage({ searchParams }: PageProps) {
  const params      = await searchParams;
  const q           = params.q            as string | undefined;
  const beds        = params.beds         as string | undefined;
  const minPrice    = params.minPrice     as string | undefined;
  const maxPrice    = params.maxPrice     as string | undefined;
  const listingType = params.listing_type as string | undefined;
  const state       = params.state        as string | undefined;
  const sort        = params.sort         as string | undefined;
  const type        = params.type         as string | undefined;
  const page        = params.page         as string | undefined;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10));

  let results: PropertyListItemAPI[] = [];
  let total = 0;

  try {
    const data = await fetchProperties({
      listing_type: listingType,
      q,
      beds,
      min_price: minPrice,
      max_price: maxPrice,
      ...(state && { q: `${q ?? ""} ${state}`.trim() }),
      ...(sort && { sort }),
      page_size: String(PAGE_SIZE),
      page: String(currentPage),
    });
    results = data.results;
    total = data.count;
  } catch {
    // API offline — show empty state
  }

  const filtered = results.map(toPropertyCardShape);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasFilters = q ?? beds ?? minPrice ?? maxPrice ?? listingType ?? state;

  // Map markers from results that have coordinates
  const markers: MapMarker[] = results
    .filter((p) => p.latitude && p.longitude)
    .map((p) => ({
      slug:        p.slug,
      title:       p.title,
      price:       p.price,
      price_label: p.price_label,
      city:        p.city,
      state:       p.state,
      lat:         p.latitude!,
      lng:         p.longitude!,
      image_url:   p.primary_image_url,
      beds:        p.bedrooms,
      baths:       p.bathrooms,
    }));

  function buildHref(changes: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const base = { q, beds, minPrice, maxPrice, listing_type: listingType, state, sort, type, page };
    const merged = { ...base, ...changes };
    Object.entries(merged).forEach(([k, v]) => { if (v) p.set(k, v); });
    const str = p.toString();
    return `/properties${str ? `?${str}` : ""}`;
  }

  // Page range for pagination bar
  const pageRange: number[] = [];
  const delta = 2;
  for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
    pageRange.push(i);
  }

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://haskerrealtygroup.com" },
      { "@type": "ListItem", position: 2, name: "Properties", item: "https://haskerrealtygroup.com/properties" },
    ],
  };

  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end   = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <div className="pt-20 bg-white min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      {/* ── Search hero ── */}
      <div className="bg-brand-dark py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-baseline gap-3 mb-6">
            <h1 className="font-serif text-3xl font-bold text-white">
              {hasFilters ? "Search Results" : "All Properties"}
            </h1>
            {total > 0 && (
              <span className="text-blue-200 text-sm">
                {total.toLocaleString()} {total === 1 ? "property" : "properties"}
                {listingType === "for-rent" ? " for rent" : listingType === "for-sale" ? " for sale" : ""}
                {q ? ` matching "${q}"` : ""}
              </span>
            )}
          </div>
          <Suspense>
            <SearchBar dark className="max-w-5xl" />
          </Suspense>
        </div>
      </div>

      {/* ── Filter + Sort bar ── */}
      <div className="border-b border-neutral-100 bg-white sticky top-20 z-30 shadow-sm">
        <div className="max-w-full px-4 lg:px-8 py-3 flex flex-wrap items-center gap-3">
          {/* Listing type */}
          <div className="flex gap-1.5">
            {[
              { label: "All",      value: "" },
              { label: "For Rent", value: "for-rent" },
              { label: "For Sale", value: "for-sale" },
            ].map((tab) => (
              <a
                key={tab.value}
                href={buildHref({ listing_type: tab.value || undefined, page: undefined })}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                  (listingType ?? "") === tab.value
                    ? "bg-brand-dark text-white border-brand-dark"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-brand-dark hover:text-brand-dark"
                }`}
              >
                {tab.label}
              </a>
            ))}
          </div>

          {/* Beds */}
          <div className="flex gap-1.5 border-l border-neutral-200 pl-3">
            {BED_FILTERS.map((b) => (
              <a
                key={b.value}
                href={buildHref({ beds: b.value || undefined, page: undefined })}
                className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                  (beds ?? "") === b.value
                    ? "bg-brand text-white border-brand"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-brand"
                }`}
              >
                {b.label}
              </a>
            ))}
          </div>

          {/* Sort */}
          <div className="ml-auto">
            <Suspense>
              <SortBar options={SORT_OPTIONS} current={sort ?? "newest"} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* ── Split layout: grid left, map right ── */}
      {filtered.length > 0 ? (
        <div className="flex h-[calc(100vh-8rem)] overflow-hidden">

          {/* Left: scrollable grid */}
          <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-8">
            {/* Count + page info */}
            <p className="text-xs text-neutral-500 mb-5">
              Showing {start.toLocaleString()}–{end.toLocaleString()} of {total.toLocaleString()} properties
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-10 flex-wrap">
                {/* Prev */}
                {currentPage > 1 && (
                  <a
                    href={buildHref({ page: String(currentPage - 1) })}
                    className="px-3 py-1.5 text-sm rounded-md border border-neutral-200 text-neutral-600 hover:border-brand hover:text-brand transition-colors"
                  >
                    ← Prev
                  </a>
                )}

                {/* First page */}
                {pageRange[0] > 1 && (
                  <>
                    <a href={buildHref({ page: "1" })} className="px-3 py-1.5 text-sm rounded-md border border-neutral-200 hover:border-brand hover:text-brand transition-colors">1</a>
                    {pageRange[0] > 2 && <span className="px-1 text-neutral-400 text-sm">…</span>}
                  </>
                )}

                {/* Page range */}
                {pageRange.map((p) => (
                  <a
                    key={p}
                    href={buildHref({ page: String(p) })}
                    className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                      p === currentPage
                        ? "bg-brand text-white border-brand"
                        : "border-neutral-200 text-neutral-600 hover:border-brand hover:text-brand"
                    }`}
                  >
                    {p}
                  </a>
                ))}

                {/* Last page */}
                {pageRange[pageRange.length - 1] < totalPages && (
                  <>
                    {pageRange[pageRange.length - 1] < totalPages - 1 && <span className="px-1 text-neutral-400 text-sm">…</span>}
                    <a href={buildHref({ page: String(totalPages) })} className="px-3 py-1.5 text-sm rounded-md border border-neutral-200 hover:border-brand hover:text-brand transition-colors">{totalPages}</a>
                  </>
                )}

                {/* Next */}
                {currentPage < totalPages && (
                  <a
                    href={buildHref({ page: String(currentPage + 1) })}
                    className="px-3 py-1.5 text-sm rounded-md border border-neutral-200 text-neutral-600 hover:border-brand hover:text-brand transition-colors"
                  >
                    Next →
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Right: sticky map (hidden on mobile) */}
          <div className="hidden lg:block w-[44%] xl:w-[42%] shrink-0 sticky top-0 h-full border-l border-neutral-200">
            <PropertiesMap markers={markers} />
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h3 className="font-serif text-2xl text-brand-dark mb-2">No Properties Found</h3>
          <p className="text-neutral-500 text-sm mb-6 max-w-xs mx-auto">
            Try broadening your search — different city, remove a filter, or check back soon for new listings.
          </p>
          <a href="/properties" className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline">
            ← Clear all filters
          </a>
        </div>
      )}
    </div>
  );
}
