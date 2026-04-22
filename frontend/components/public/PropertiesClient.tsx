"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Search, ChevronDown, Heart, SlidersHorizontal,
  List, Map as MapIcon, Layers,
} from "lucide-react";
import { PropertiesMapLoader } from "./PropertiesMapLoader";
import type { MapMarker, MapBounds } from "./PropertiesMap";
import type { PropertyListItemAPI } from "@/lib/properties";

interface Props {
  initialResults: PropertyListItemAPI[];
  initialTotal: number;
  initialPage: number;
  initialQ?: string;
  initialBeds?: string;
  initialMinPrice?: string;
  initialMaxPrice?: string;
  initialListingType?: string;
  initialSort?: string;
}

const PAGE_SIZE = 24;

const PRICE_RANGES = [
  { label: "Any",          value: "" },
  { label: "Under $1,000", value: "0-1000" },
  { label: "$1,000–$1,500",value: "1000-1500" },
  { label: "$1,500–$2,000",value: "1500-2000" },
  { label: "$2,000–$2,500",value: "2000-2500" },
  { label: "$2,500–$3,500",value: "2500-3500" },
  { label: "$3,500+",      value: "3500" },
];

const BEDS_OPTIONS = [
  { label: "Any",    value: "" },
  { label: "Studio", value: "0" },
  { label: "1+",     value: "1" },
  { label: "2+",     value: "2" },
  { label: "3+",     value: "3" },
  { label: "4+",     value: "4" },
];

const SORT_OPTIONS = [
  { label: "Newest",       value: "newest" },
  { label: "Price: Low",   value: "price_asc" },
  { label: "Price: High",  value: "price_desc" },
  { label: "Most Beds",    value: "beds_desc" },
  { label: "Largest",      value: "sqft_desc" },
];

export function PropertiesClient({
  initialResults,
  initialTotal,
  initialPage,
  initialQ = "",
  initialBeds = "",
  initialMinPrice = "",
  initialMaxPrice = "",
  initialListingType = "",
  initialSort = "newest",
}: Props) {
  const router = useRouter();

  // Filter state
  const [q, setQ] = useState(initialQ);
  const [beds, setBeds] = useState(initialBeds);
  const [listingType, setListingType] = useState(initialListingType);
  const [sort, setSort] = useState(initialSort);
  const [priceRange, setPriceRange] = useState(
    initialMinPrice ? (initialMaxPrice ? `${initialMinPrice}-${initialMaxPrice}` : initialMinPrice) : ""
  );

  // Map-search state
  const [mapResults, setMapResults] = useState<PropertyListItemAPI[] | null>(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [searchOnMove, setSearchOnMove] = useState(true);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  // Mobile view
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const results = mapResults ?? initialResults;
  const displayTotal = mapResults ? mapResults.length : initialTotal;
  const totalPages = Math.ceil(initialTotal / PAGE_SIZE);

  // ── URL helpers ──────────────────────────────────────────────────────────
  function buildUrl(overrides: Record<string, string | undefined> = {}) {
    const p = new URLSearchParams();
    const [prMin, prMax] = (priceRange || "").split("-");
    const base: Record<string, string | undefined> = {
      q:            q || undefined,
      beds:         beds || undefined,
      listing_type: listingType || undefined,
      minPrice:     prMin || undefined,
      maxPrice:     prMax || undefined,
      sort:         sort !== "newest" ? sort : undefined,
      page:         initialPage > 1 ? String(initialPage) : undefined,
    };
    Object.entries({ ...base, ...overrides }).forEach(([k, v]) => { if (v) p.set(k, v); });
    const qs = p.toString();
    return `/properties${qs ? `?${qs}` : ""}`;
  }

  function navigate(overrides: Record<string, string | undefined> = {}) {
    setMapResults(null);
    router.push(buildUrl({ ...overrides, page: undefined }));
  }

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); navigate(); };

  // ── Map search ───────────────────────────────────────────────────────────
  const handleBoundsChange = useCallback(async (bounds: MapBounds) => {
    if (!searchOnMove) return;
    // Skip degenerate bounds (map not yet sized)
    if (bounds.north === bounds.south || bounds.east === bounds.west) return;

    setMapLoading(true);
    try {
      const apiBase = "";
      const p = new URLSearchParams({
        is_published: "true",
        lat_min: bounds.south.toFixed(6),
        lat_max: bounds.north.toFixed(6),
        lng_min: bounds.west.toFixed(6),
        lng_max: bounds.east.toFixed(6),
        page_size: "200",
        ...(beds && { beds }),
        ...(listingType && { listing_type: listingType }),
        ...(q && { q }),
      });
      const res = await fetch(`${apiBase}/api/v1/properties/?${p}`);
      if (res.ok) setMapResults((await res.json()).results);
    } finally {
      setMapLoading(false);
    }
  }, [searchOnMove, beds, listingType, q]);

  const handleMarkerClick = useCallback((slug: string) => {
    setActiveSlug(slug);
    setMobileView("list");
    cardRefs.current[slug]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  const markers: MapMarker[] = results
    .filter((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude) && p.latitude !== 0 && p.longitude !== 0)
    .map((p) => ({
      slug: p.slug, title: p.title, price: p.price, price_label: p.price_label,
      city: p.city, state: p.state, lat: p.latitude!, lng: p.longitude!,
      image_url: p.primary_image_url, beds: p.bedrooms, baths: p.bathrooms,
    }));

  const activeFiltersCount = [q, beds, listingType, priceRange].filter(Boolean).length;

  return (
    <div className="pt-20 h-screen overflow-hidden flex flex-col bg-white">

      {/* ── Filter bar ──────────────────────────────────────────────────── */}
      <div className="shrink-0 bg-white border-b border-neutral-200 z-30">
        <form onSubmit={handleSearch} className="flex items-center h-14 px-3 gap-1.5">

          {/* Location */}
          <div className="flex items-center gap-2 flex-1 min-w-0 bg-white border border-neutral-300 rounded-lg px-3 h-11 hover:border-neutral-400 transition-colors">
            <Search size={14} className="text-neutral-400 shrink-0" />
            <input
              type="text"
              placeholder="City, state or zip"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="flex-1 text-sm text-brand-dark placeholder:text-neutral-400 outline-none bg-transparent min-w-0"
            />
          </div>

          {/* Pricing */}
          <FilterSelect
            value={priceRange}
            onChange={(v) => {
              setPriceRange(v);
              const [min, max] = v.split("-");
              navigate({ minPrice: min || undefined, maxPrice: max || undefined });
            }}
            label="Pricing"
          >
            {PRICE_RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </FilterSelect>

          {/* Beds / Baths */}
          <FilterSelect
            value={beds}
            onChange={(v) => { setBeds(v); navigate({ beds: v || undefined }); }}
            label="Beds / Baths"
          >
            {BEDS_OPTIONS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </FilterSelect>

          {/* Type */}
          <FilterSelect
            value={listingType}
            onChange={(v) => { setListingType(v); navigate({ listing_type: v || undefined }); }}
            label="Type"
          >
            <option value="">All Types</option>
            <option value="for-rent">For Rent</option>
            <option value="for-sale">For Sale</option>
          </FilterSelect>

          {/* All Filters */}
          <button
            type="button"
            className={`hidden md:flex items-center gap-1.5 h-11 px-3 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap ${
              activeFiltersCount > 0
                ? "bg-brand text-white border-brand"
                : "border-neutral-300 text-neutral-600 hover:border-neutral-400"
            }`}
          >
            <SlidersHorizontal size={14} />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-0.5 bg-white/30 rounded-full w-5 h-5 flex items-center justify-center text-[11px] font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Save search */}
          <button
            type="button"
            className="hidden lg:flex items-center h-11 px-3 text-xs font-semibold text-brand border border-brand rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
          >
            Save search
          </button>

          <button type="submit" className="sr-only">Search</button>
        </form>
      </div>

      {/* ── Main split: Map LEFT, Cards RIGHT ───────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* ── LEFT: Map ────────────────────────────────────────────────── */}
        <div
          className={`${mobileView === "list" ? "hidden" : "flex"} lg:flex flex-col relative flex-1 min-w-0`}
        >
          {/* Map — absolutely fills the container */}
          <div className="absolute inset-0 z-0">
            <PropertiesMapLoader
              markers={markers}
              activeSlug={activeSlug}
              onMarkerClick={handleMarkerClick}
              onBoundsChange={handleBoundsChange}
            />
          </div>

          {/* Top overlay row */}
          <div className="relative z-[1000] flex items-start justify-between p-3 pointer-events-none">
            {/* Map/Satellite toggle */}
            <div className="flex rounded-lg overflow-hidden shadow-md border border-neutral-200 text-xs font-semibold pointer-events-auto">
              <button className="bg-white px-3 py-2 text-brand-dark flex items-center gap-1.5 hover:bg-neutral-50 transition-colors">
                <Layers size={12} /> Map
              </button>
              <button className="bg-neutral-100 px-3 py-2 text-neutral-500 border-l border-neutral-200 hover:bg-neutral-200 transition-colors">
                Satellite
              </button>
            </div>

            {/* Listing count badge */}
            <div className="bg-white/95 backdrop-blur-sm shadow-md rounded-lg px-3 py-2 pointer-events-none">
              <p className="text-xs font-bold text-brand-dark">
                {mapLoading ? "Searching…" : `${displayTotal.toLocaleString()} homes`}
              </p>
              <p className="text-[10px] text-neutral-400">Pan to explore</p>
            </div>
          </div>

          {/* Search-as-I-move pill — bottom center */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] pointer-events-auto">
            <label className="flex items-center gap-2 bg-white shadow-xl rounded-full px-5 py-2.5 border border-neutral-200 cursor-pointer select-none hover:bg-neutral-50 transition-colors">
              <input
                type="checkbox"
                checked={searchOnMove}
                onChange={(e) => {
                  setSearchOnMove(e.target.checked);
                  if (!e.target.checked) setMapResults(null);
                }}
                className="accent-brand w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-bold text-brand-dark whitespace-nowrap">
                {searchOnMove ? "Searching as I move" : "Search as I move"}
              </span>
              {mapLoading && (
                <span className="w-3 h-3 border-2 border-brand border-t-transparent rounded-full animate-spin shrink-0" />
              )}
            </label>
          </div>
        </div>

        {/* ── RIGHT: Cards panel ────────────────────────────────────────── */}
        <div
          className={`${mobileView === "map" ? "hidden" : "flex"} lg:flex w-full lg:w-[38%] xl:w-[36%] shrink-0 flex-col border-l border-neutral-200 bg-white`}
        >
          {/* Panel header */}
          <div className="shrink-0 px-4 py-2.5 border-b border-neutral-100 flex items-center justify-between gap-3 bg-white">
            <p className="text-sm font-semibold text-brand-dark">
              {mapLoading
                ? "Searching…"
                : <>{displayTotal.toLocaleString()} <span className="text-neutral-400 font-normal">results found</span></>
              }
            </p>
            <div className="flex items-center gap-2">
              {mapResults && (
                <button onClick={() => setMapResults(null)} className="text-[11px] text-brand hover:underline">
                  Reset
                </button>
              )}
              {/* Sort */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); navigate({ sort: e.target.value }); }}
                  className="appearance-none text-xs font-semibold text-neutral-600 bg-transparent outline-none cursor-pointer pr-4 py-1"
                >
                  {SORT_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Card grid */}
          <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
            {mapLoading ? (
              <div className="p-3 grid grid-cols-2 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-neutral-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8 py-16">
                <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-3">
                  <Search size={20} className="text-neutral-300" />
                </div>
                <p className="text-brand-dark font-semibold mb-1">No homes found</p>
                <p className="text-neutral-400 text-sm mb-4">
                  Try widening your filters or moving the map to a different area.
                </p>
                <a href="/properties" className="text-sm text-brand font-semibold hover:underline">
                  Clear all filters
                </a>
              </div>
            ) : (
              <div className="p-3 grid grid-cols-2 gap-3">
                {results.map((p) => (
                  <div
                    key={p.slug}
                    ref={(el) => { cardRefs.current[p.slug] = el; }}
                    onMouseEnter={() => setActiveSlug(p.slug)}
                    onMouseLeave={() => setActiveSlug(null)}
                  >
                    <PropertyCard property={p} isActive={activeSlug === p.slug} />
                  </div>
                ))}

                {/* Pagination (when not in map-search mode) */}
                {!mapResults && totalPages > 1 && (
                  <div className="col-span-2">
                    <PaginationBar
                      currentPage={initialPage}
                      totalPages={totalPages}
                      buildHref={(pg) => buildUrl({ page: String(pg) })}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile floating toggle button ───────────────────────────────── */}
      <div className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => setMobileView(mobileView === "list" ? "map" : "list")}
          className="flex items-center gap-2.5 bg-brand-dark text-white pl-5 pr-6 py-3.5 rounded-full shadow-2xl text-sm font-bold active:scale-95 transition-transform border-2 border-white/20"
          style={{ WebkitTapHighlightColor: "transparent" } as React.CSSProperties}
        >
          {mobileView === "list" ? (
            <><MapIcon size={18} /> Show Map</>
          ) : (
            <><List size={18} /> Show Listings</>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Filter select ─────────────────────────────────────────────────────────

function FilterSelect({
  value,
  onChange,
  label,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  children: React.ReactNode;
}) {
  const active = !!value;
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none h-11 pl-3 pr-8 rounded-lg border text-xs font-semibold outline-none cursor-pointer transition-colors ${
          active
            ? "border-brand text-brand bg-blue-50"
            : "border-neutral-300 text-neutral-600 bg-white hover:border-neutral-400"
        }`}
      >
        <option value="" disabled hidden>{label}</option>
        {children}
      </select>
      <ChevronDown
        size={13}
        className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${active ? "text-brand" : "text-neutral-400"}`}
      />
    </div>
  );
}

// ── Property card (portrait, IH-style) ───────────────────────────────────

function PropertyCard({ property, isActive }: { property: PropertyListItemAPI; isActive: boolean }) {
  const availDate = "Now";

  return (
    <Link
      href={`/properties/${property.slug}`}
      className={`flex flex-col rounded-xl overflow-hidden border bg-white group transition-all duration-150 ${
        isActive
          ? "border-brand shadow-lg ring-1 ring-brand/20"
          : "border-neutral-200 hover:shadow-md hover:border-neutral-300"
      }`}
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
        {property.primary_image_url ? (
          <Image
            src={property.primary_image_url}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 1024px) 50vw, 20vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
            <span className="text-neutral-400 text-xs">No photo</span>
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {property.is_featured && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">
              Featured
            </span>
          )}
        </div>

        {/* Self tour badge */}
        <div className="absolute top-2 right-10">
          <span className="bg-white/95 text-brand-dark text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-sm">
            Self Tour
          </span>
        </div>

        {/* Heart */}
        <button
          onClick={(e) => e.preventDefault()}
          className="absolute top-1 right-1 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center text-neutral-400 hover:text-red-500 transition-colors shadow-sm"
          aria-label="Save"
        >
          <Heart size={14} />
        </button>

        {/* Listing type badge */}
        <div className="absolute bottom-2 left-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide ${
            property.listing_type === "for-sale"
              ? "bg-green-600 text-white"
              : "bg-brand text-white"
          }`}>
            {property.listing_type === "for-sale" ? "For Sale" : "For Rent"}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-2.5 flex flex-col gap-0.5">
        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-bold text-brand-dark">
            ${property.price.toLocaleString()}
          </span>
          <span className="text-xs text-neutral-400">
            {property.listing_type === "for-sale" ? "" : "/mo"}
          </span>
        </div>

        {property.listing_type !== "for-sale" && (
          <p className="text-xs text-neutral-400">12 month lease</p>
        )}

        {/* Beds · Baths · Sqft */}
        <p className="text-xs text-neutral-600 font-medium">
          {property.bedrooms === 0
            ? "Studio"
            : `${property.bedrooms} ${property.bedrooms === 1 ? "bed" : "beds"}`}{" "}
          · {property.bathrooms} {property.bathrooms === 1 ? "bath" : "baths"}
          {property.sqft > 0 && ` · ${property.sqft.toLocaleString()} sqft`}
        </p>

        {/* Address */}
        {property.address && (
          <p className="text-xs text-neutral-400 truncate">{property.address}</p>
        )}
        <p className="text-xs text-neutral-400 truncate">
          {property.city}, {property.state}
        </p>

        {/* Availability */}
        <p className="text-xs font-bold text-neutral-600 mt-0.5 uppercase tracking-wide">
          Available:{" "}
          <span className="text-green-600">{availDate}</span>
        </p>
      </div>
    </Link>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────

function PaginationBar({
  currentPage,
  totalPages,
  buildHref,
}: {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  const delta = 1;
  const pages: number[] = [];
  for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
    pages.push(i);
  }
  const cls = "px-4 py-3 text-xs rounded-lg border transition-colors min-h-[44px] flex items-center justify-center";
  const inactive = "border-neutral-200 text-neutral-500 hover:border-brand hover:text-brand";
  const active = "bg-brand text-white border-brand";

  return (
    <div className="flex items-center justify-center gap-1.5 py-4 flex-wrap">
      {currentPage > 1 && (
        <a href={buildHref(currentPage - 1)} className={`${cls} ${inactive}`}>← Prev</a>
      )}
      {pages[0] > 1 && (
        <>
          <a href={buildHref(1)} className={`${cls} ${inactive}`}>1</a>
          {pages[0] > 2 && <span className="text-neutral-300 text-xs">…</span>}
        </>
      )}
      {pages.map((p) => (
        <a key={p} href={buildHref(p)} className={`${cls} ${p === currentPage ? active : inactive}`}>{p}</a>
      ))}
      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="text-neutral-300 text-xs">…</span>}
          <a href={buildHref(totalPages)} className={`${cls} ${inactive}`}>{totalPages}</a>
        </>
      )}
      {currentPage < totalPages && (
        <a href={buildHref(currentPage + 1)} className={`${cls} ${inactive}`}>Next →</a>
      )}
    </div>
  );
}
