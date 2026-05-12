"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Search, ChevronDown, SlidersHorizontal, MapPin, X,
  List, Map as MapIcon, Layers, BedDouble, DollarSign, ArrowRight,
} from "lucide-react";
import { FavoriteButton } from "./FavoriteButton";
import { captureSearchIntent } from "@/lib/tracking";
import { PropertiesMapLoader } from "./PropertiesMapLoader";
import type { MapMarker, MapBounds } from "./PropertiesMap";
import type { PropertyListItemAPI } from "@/lib/properties";

const LOCATION_SUGGESTIONS = [
  { city: "Atlanta",      state: "GA" },
  { city: "Charlotte",    state: "NC" },
  { city: "Houston",      state: "TX" },
  { city: "Dallas",       state: "TX" },
  { city: "Nashville",    state: "TN" },
  { city: "Phoenix",      state: "AZ" },
  { city: "Austin",       state: "TX" },
  { city: "Miami",        state: "FL" },
  { city: "Denver",       state: "CO" },
  { city: "Seattle",      state: "WA" },
  { city: "Las Vegas",    state: "NV" },
  { city: "Tampa",        state: "FL" },
  { city: "Orlando",      state: "FL" },
  { city: "Raleigh",      state: "NC" },
  { city: "San Antonio",  state: "TX" },
  { city: "Jacksonville", state: "FL" },
  { city: "Winder",       state: "GA" },
];

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
  { label: "Any Price",        value: "" },
  { label: "Under $800",       value: "0-800" },
  { label: "$800 – $1,200",    value: "800-1200" },
  { label: "$1,200 – $1,800",  value: "1200-1800" },
  { label: "$1,800 – $2,500",  value: "1800-2500" },
  { label: "$2,500 – $3,500",  value: "2500-3500" },
  { label: "$3,500+",          value: "3500" },
];

const BEDS_OPTIONS = [
  { label: "Any Beds", value: "" },
  { label: "Studio",   value: "0" },
  { label: "1+ Bed",   value: "1" },
  { label: "2+ Beds",  value: "2" },
  { label: "3+ Beds",  value: "3" },
  { label: "4+ Beds",  value: "4" },
];

const SORT_OPTIONS = [
  { label: "Best Match",   value: "diverse" },
  { label: "Newest First", value: "newest" },
  { label: "Price: Low → High",  value: "price_asc" },
  { label: "Price: High → Low",  value: "price_desc" },
  { label: "Most Bedrooms",value: "beds_desc" },
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

  const [q, setQ]                   = useState(initialQ);
  const [beds, setBeds]             = useState(initialBeds);
  const [listingType, setListingType] = useState(initialListingType);
  const [sort, setSort]             = useState(initialSort);
  const [priceRange, setPriceRange] = useState(
    initialMinPrice ? (initialMaxPrice ? `${initialMinPrice}-${initialMaxPrice}` : initialMinPrice) : ""
  );

  const [mapResults, setMapResults]     = useState<PropertyListItemAPI[] | null>(null);
  const [mapLoading, setMapLoading]     = useState(false);
  const [searchOnMove, setSearchOnMove] = useState(true);
  const [activeSlug, setActiveSlug]     = useState<string | null>(null);
  const [mobileView, setMobileView]     = useState<"list" | "map">("list");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const cardRefs      = useRef<Record<string, HTMLDivElement | null>>({});
  const locationRef   = useRef<HTMLDivElement>(null);
  const locationInput = useRef<HTMLInputElement>(null);
  const [locOpen, setLocOpen]   = useState(false);
  const [locIndex, setLocIndex] = useState(-1);

  const locSuggestions = q.trim().length === 0
    ? LOCATION_SUGGESTIONS.slice(0, 6)
    : LOCATION_SUGGESTIONS.filter((s) =>
        s.city.toLowerCase().startsWith(q.trim().toLowerCase()) ||
        `${s.city}, ${s.state}`.toLowerCase().includes(q.trim().toLowerCase())
      ).slice(0, 6);

  useEffect(() => {
    function onOut(e: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocOpen(false); setLocIndex(-1);
      }
    }
    document.addEventListener("mousedown", onOut);
    return () => document.removeEventListener("mousedown", onOut);
  }, []);

  const results      = mapResults ?? initialResults;
  const displayTotal = mapResults ? mapResults.length : initialTotal;
  const totalPages   = Math.ceil(initialTotal / PAGE_SIZE);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) captureSearchIntent(q.trim(), listingType || undefined);
    navigate();
  };

  const handleBoundsChange = useCallback(async (bounds: MapBounds) => {
    if (!searchOnMove) return;
    if (bounds.north === bounds.south || bounds.east === bounds.west) return;
    setMapLoading(true);
    try {
      const p = new URLSearchParams({
        is_published: "true",
        lat_min: bounds.south.toFixed(6), lat_max: bounds.north.toFixed(6),
        lng_min: bounds.west.toFixed(6),  lng_max: bounds.east.toFixed(6),
        page_size: "200",
        ...(beds && { beds }),
        ...(listingType && { listing_type: listingType }),
        ...(q && { q }),
      });
      const res = await fetch(`/api/v1/properties/?${p}`);
      if (res.ok) setMapResults((await res.json()).results);
    } finally { setMapLoading(false); }
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

  const activeFiltersCount = [q, beds, priceRange].filter(Boolean).length;

  return (
    <div className="pt-20 h-screen overflow-hidden flex flex-col bg-white">

      {/* ── Filter bar ──────────────────────────────────────────────────────── */}
      <div className="shrink-0 bg-white border-b border-neutral-200 z-30 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row md:items-center px-4 py-3 gap-3">

          {/* Location input */}
          <div className="flex gap-2 flex-1 min-w-0">
            <div className="relative flex-1 min-w-0">
              <div className="flex items-center gap-2 bg-white border-2 border-neutral-200 rounded-xl px-3.5 h-11 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15 transition-all">
                <Search size={15} className="text-neutral-400 shrink-0" />
                <input
                  type="text"
                  autoComplete="off"
                  placeholder="City, ZIP, or neighborhood…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="flex-1 text-[14px] text-brand-dark placeholder:text-neutral-400 outline-none bg-transparent min-w-0"
                />
                {q && (
                  <button type="button" onClick={() => { setQ(""); navigate({ q: undefined }); }} className="text-neutral-400 hover:text-neutral-600 shrink-0 transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile: search + filter toggles */}
            <button type="submit" className="md:hidden flex items-center justify-center w-11 h-11 rounded-xl bg-brand text-white shrink-0 shadow-sm" aria-label="Search">
              <Search size={16} />
            </button>
            <div className="relative md:hidden shrink-0">
              <button
                type="button"
                onClick={() => setShowMobileFilters((s) => !s)}
                className={`flex items-center justify-center w-11 h-11 rounded-xl border-2 transition-colors ${
                  showMobileFilters || activeFiltersCount > 0
                    ? "border-brand bg-brand/5 text-brand"
                    : "border-neutral-200 bg-white text-neutral-500"
                }`}
              >
                <SlidersHorizontal size={16} />
              </button>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 w-5 h-5 bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center pointer-events-none">
                  {activeFiltersCount}
                </span>
              )}
            </div>
          </div>

          {/* Filter controls */}
          <div className={`${showMobileFilters ? "flex" : "hidden"} md:flex items-center gap-2 flex-wrap md:flex-nowrap`}>

            {/* Rent / Buy toggle pills */}
            <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl shrink-0">
              {(["", "for-rent", "for-sale"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => { setListingType(type); navigate({ listing_type: type || undefined }); }}
                  className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap ${
                    listingType === type
                      ? "bg-white text-brand-dark shadow-sm"
                      : "text-neutral-500 hover:text-brand-dark"
                  }`}
                >
                  {type === "" ? "All" : type === "for-rent" ? "For Rent" : "For Sale"}
                </button>
              ))}
            </div>

            {/* Price filter */}
            <FilterPill
              icon={<DollarSign size={13} />}
              value={priceRange}
              label="Price"
              onChange={(v) => {
                setPriceRange(v);
                const [min, max] = v.split("-");
                navigate({ minPrice: min || undefined, maxPrice: max || undefined });
              }}
            >
              {PRICE_RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </FilterPill>

            {/* Beds filter */}
            <FilterPill
              icon={<BedDouble size={13} />}
              value={beds}
              label="Beds"
              onChange={(v) => { setBeds(v); navigate({ beds: v || undefined }); }}
            >
              {BEDS_OPTIONS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
            </FilterPill>

            {/* Desktop search button */}
            <button
              type="submit"
              className="hidden md:flex items-center gap-2 h-11 px-5 bg-brand text-white text-[13px] font-bold rounded-xl hover:bg-brand-hover transition-colors shrink-0"
            >
              <Search size={14} /> Search
            </button>

            {/* Clear filters */}
            {activeFiltersCount > 0 && (
              <a
                href="/properties"
                className="shrink-0 flex items-center gap-1.5 h-11 px-3.5 text-[12px] font-bold text-red-500 border-2 border-red-200 rounded-xl hover:bg-red-50 transition-colors whitespace-nowrap bg-white"
              >
                <X size={13} /> Clear
              </a>
            )}
          </div>
        </form>
      </div>

      {/* ── Map + Cards split ─────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* Map */}
        <div className={`${mobileView === "list" ? "hidden" : "flex"} lg:flex flex-col relative flex-1 min-w-0`}>
          <div className="absolute inset-0 z-0">
            <PropertiesMapLoader
              markers={markers}
              activeSlug={activeSlug}
              onMarkerClick={handleMarkerClick}
              onBoundsChange={handleBoundsChange}
            />
          </div>

          <div className="relative z-[1000] flex items-start justify-between p-3 pointer-events-none">
            <div className="flex rounded-xl overflow-hidden shadow-md border border-neutral-200 text-xs font-semibold pointer-events-auto bg-white">
              <button className="bg-white px-3.5 py-2 text-brand-dark flex items-center gap-1.5 hover:bg-neutral-50 transition-colors">
                <Layers size={12} /> Map
              </button>
              <button className="bg-neutral-100 px-3.5 py-2 text-neutral-500 border-l border-neutral-200 hover:bg-neutral-200 transition-colors">
                Satellite
              </button>
            </div>
            <div className="bg-white/95 backdrop-blur-sm shadow-md rounded-xl px-4 py-2.5 pointer-events-none border border-neutral-100">
              <p className="text-[13px] font-bold text-brand-dark">
                {mapLoading ? "Searching…" : `${displayTotal.toLocaleString()} homes`}
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Pan to explore</p>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] pointer-events-auto">
            <label className="flex items-center gap-2.5 bg-white shadow-xl rounded-full px-5 py-3 border border-neutral-200 cursor-pointer select-none hover:bg-neutral-50 transition-colors">
              <input
                type="checkbox"
                checked={searchOnMove}
                onChange={(e) => { setSearchOnMove(e.target.checked); if (!e.target.checked) setMapResults(null); }}
                className="accent-brand w-4 h-4 cursor-pointer"
              />
              <span className="text-[12px] font-bold text-brand-dark whitespace-nowrap">
                {searchOnMove ? "Searching as I move" : "Search as I move"}
              </span>
              {mapLoading && <span className="w-3 h-3 border-2 border-brand border-t-transparent rounded-full animate-spin shrink-0" />}
            </label>
          </div>
        </div>

        {/* Cards panel */}
        <div className={`${mobileView === "map" ? "hidden" : "flex"} lg:flex w-full lg:w-[40%] xl:w-[38%] shrink-0 flex-col border-l border-neutral-200 bg-white`}>

          {/* Panel header */}
          <div className="shrink-0 px-4 py-3 border-b border-neutral-100 flex items-center justify-between gap-3 bg-white">
            <div>
              <p className="text-[15px] font-black text-brand-dark leading-none">
                {mapLoading ? "Searching…" : displayTotal.toLocaleString()}
                {!mapLoading && <span className="text-[13px] font-normal text-neutral-400 ml-1.5">homes found</span>}
              </p>
              {mapResults && (
                <button onClick={() => setMapResults(null)} className="text-[11px] text-brand hover:underline mt-0.5">
                  ← Back to all results
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative shrink-0">
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); navigate({ sort: e.target.value }); }}
                className="appearance-none text-[12px] font-semibold text-brand-dark bg-neutral-50 border border-neutral-200 rounded-lg outline-none cursor-pointer pl-3 pr-7 py-2 hover:border-brand transition-colors"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            </div>
          </div>

          {/* Card list */}
          <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
            {mapLoading ? (
              <div className="p-3 grid grid-cols-2 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-neutral-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8 py-16">
                <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mb-5">
                  <Search size={24} className="text-neutral-300" />
                </div>
                <p className="text-brand-dark font-black text-[16px] mb-2">No homes match your filters</p>
                <p className="text-neutral-400 text-[13px] mb-6 max-w-[220px] leading-relaxed">
                  Try a different location, a wider budget, or remove a filter.
                </p>
                <div className="flex flex-col gap-2 w-full max-w-[200px]">
                  {activeFiltersCount > 0 && (
                    <a href="/properties" className="w-full py-3 px-4 bg-brand text-white text-[13px] font-bold rounded-xl hover:bg-brand-hover transition-colors text-center">
                      Clear all filters
                    </a>
                  )}
                  <a href="/contact" className="w-full py-3 px-4 border-2 border-neutral-200 text-brand-dark text-[13px] font-bold rounded-xl hover:bg-neutral-50 transition-colors text-center">
                    Ask our team
                  </a>
                </div>
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
                    <PanelCard property={p} isActive={activeSlug === p.slug} />
                  </div>
                ))}

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

      {/* Mobile view toggle */}
      <div className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => setMobileView(mobileView === "list" ? "map" : "list")}
          className="flex items-center gap-2.5 bg-[#0D1B2A] text-white pl-5 pr-6 py-3.5 rounded-full shadow-2xl text-[13px] font-bold active:scale-95 transition-transform border-2 border-white/10"
        >
          {mobileView === "list" ? <><MapIcon size={17} /> Show Map</> : <><List size={17} /> Show Listings</>}
        </button>
      </div>
    </div>
  );
}

// ── Filter pill (icon + select) ───────────────────────────────────────────────

function FilterPill({
  icon,
  value,
  label,
  onChange,
  children,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  const active = !!value;
  return (
    <div className="relative shrink-0">
      <div className={`flex items-center gap-1.5 border-2 rounded-xl h-11 pl-3 pr-8 transition-all ${
        active
          ? "border-brand bg-brand/5 text-brand"
          : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
      }`}>
        <span className={active ? "text-brand" : "text-neutral-400"}>{icon}</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`appearance-none text-[12px] font-bold outline-none cursor-pointer bg-transparent ${
            active ? "text-brand" : "text-neutral-700"
          }`}
        >
          <option value="" disabled hidden>{label}</option>
          {children}
        </select>
      </div>
      <ChevronDown
        size={13}
        className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${active ? "text-brand" : "text-neutral-400"}`}
      />
    </div>
  );
}

// ── Panel property card ───────────────────────────────────────────────────────

function PanelCard({ property, isActive }: { property: PropertyListItemAPI; isActive: boolean }) {
  const isRental = property.listing_type !== "for-sale";

  return (
    <div className={`flex flex-col rounded-xl overflow-hidden border bg-white group transition-all duration-150 ${
      isActive
        ? "border-brand shadow-lg ring-2 ring-brand/15"
        : "border-neutral-200 hover:shadow-md hover:border-neutral-300"
    }`}>
      {/* Photo */}
      <Link href={`/properties/${property.slug}`} className="block">
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

          {/* Listing type badge */}
          <div className="absolute top-2 left-2">
            <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wide ${
              property.listing_type === "for-sale"
                ? "bg-emerald-500 text-white"
                : "bg-brand text-white"
            }`}>
              {property.listing_type === "for-sale" ? "For Sale" : "For Rent"}
            </span>
          </div>

          {property.is_featured && (
            <div className="absolute top-2 right-10">
              <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide">
                Featured
              </span>
            </div>
          )}

          {/* Heart */}
          <div
            className="absolute top-2 right-2 z-10"
            onClick={(e) => e.preventDefault()}
          >
            <div className="w-8 h-8 bg-white/95 rounded-full flex items-center justify-center shadow-sm">
              <FavoriteButton propertyId={property.id} size={13} className="hover:scale-110 active:scale-90 transition-transform" />
            </div>
          </div>

          {/* Available now pill — bottom */}
          <div className="absolute bottom-2 right-2">
            <span className="flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shrink-0" />
              Available
            </span>
          </div>
        </div>
      </Link>

      {/* Body */}
      <div className="p-3 flex flex-col gap-1">
        {/* Price row */}
        <div className="flex items-baseline justify-between gap-1">
          <p className="text-[16px] font-black text-brand-dark leading-none">
            ${property.price.toLocaleString()}
            {isRental && <span className="text-[11px] font-semibold text-neutral-400">/mo</span>}
          </p>
        </div>

        {/* Beds · Baths · Sqft */}
        <p className="text-[12px] font-semibold text-neutral-600">
          {property.bedrooms === 0
            ? "Studio"
            : `${property.bedrooms} bd`}
          {" · "}{property.bathrooms} ba
          {property.sqft > 0 && ` · ${property.sqft.toLocaleString()} sqft`}
        </p>

        {/* Address */}
        <p className="text-[11px] text-neutral-400 truncate leading-tight">
          {property.address ? `${property.address}, ` : ""}{property.city}, {property.state}
        </p>

        {/* Apply CTA — rentals only */}
        {isRental && (
          <Link
            href={`/apply?property=${property.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="mt-1.5 flex items-center justify-center gap-1.5 w-full py-2 bg-brand text-white text-[11px] font-bold rounded-lg hover:bg-brand-hover transition-colors"
          >
            Apply Now <ArrowRight size={11} />
          </Link>
        )}
      </div>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────

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
  const base = "px-4 py-3 text-[12px] font-semibold rounded-xl border-2 transition-colors min-h-[44px] flex items-center justify-center";
  const inactive = "border-neutral-200 text-neutral-500 hover:border-brand hover:text-brand bg-white";
  const active   = "bg-brand text-white border-brand";

  return (
    <div className="flex items-center justify-center gap-1.5 py-5 flex-wrap">
      {currentPage > 1 && (
        <a href={buildHref(currentPage - 1)} className={`${base} ${inactive}`}>← Prev</a>
      )}
      {pages[0] > 1 && (
        <>
          <a href={buildHref(1)} className={`${base} ${inactive}`}>1</a>
          {pages[0] > 2 && <span className="text-neutral-300 text-xs px-1">…</span>}
        </>
      )}
      {pages.map((p) => (
        <a key={p} href={buildHref(p)} className={`${base} ${p === currentPage ? active : inactive}`}>{p}</a>
      ))}
      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="text-neutral-300 text-xs px-1">…</span>}
          <a href={buildHref(totalPages)} className={`${base} ${inactive}`}>{totalPages}</a>
        </>
      )}
      {currentPage < totalPages && (
        <a href={buildHref(currentPage + 1)} className={`${base} ${inactive}`}>Next →</a>
      )}
    </div>
  );
}
