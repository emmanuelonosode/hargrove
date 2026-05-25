"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Search, ChevronDown, MapPin, X,
  List, Map as MapIcon, Layers, BedDouble, DollarSign, ArrowRight,
} from "lucide-react";
import { FavoriteButton } from "./FavoriteButton";
import { captureSearchIntent } from "@/lib/tracking";
import { PropertiesMapLoader } from "./PropertiesMapLoader";
import { fetchAllCities, CITIES } from "@/lib/cities";
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

  const cardRefs      = useRef<Record<string, HTMLDivElement | null>>({});
  const locationRef   = useRef<HTMLDivElement>(null);
  const locationInput = useRef<HTMLInputElement>(null);
  const cardListRef   = useRef<HTMLDivElement>(null);
  const lastScrollRef = useRef(0);
  const [filterBarVisible, setFilterBarVisible] = useState(true);
  const [locOpen, setLocOpen]   = useState(false);
  const [locIndex, setLocIndex] = useState(-1);
  const [liveCities, setLiveCities] = useState<{ city: string; state: string }[]>([]);

  useEffect(() => {
    fetchAllCities().then((cities) => {
      setLiveCities(cities.map((c) => ({ city: c.city, state: c.state })));
    }).catch(() => {});
  }, []);

  const cityPool = liveCities.length > 0
    ? liveCities
    : Object.values(CITIES).map((c) => ({ city: c.name, state: c.stateCode }));

  const locSuggestions = q.trim().length === 0
    ? cityPool.slice(0, 6)
    : cityPool.filter((s) =>
        s.city.toLowerCase().startsWith(q.trim().toLowerCase()) ||
        `${s.city}, ${s.state}`.toLowerCase().includes(q.trim().toLowerCase())
      ).slice(0, 6);

  useEffect(() => {
    function onOut(e: PointerEvent) {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocOpen(false); setLocIndex(-1);
      }
    }
    document.addEventListener("pointerdown", onOut);
    return () => document.removeEventListener("pointerdown", onOut);
  }, []);

  useEffect(() => {
    const el = cardListRef.current;
    if (!el) return;
    const onScroll = () => {
      const y = el.scrollTop;
      if (y > lastScrollRef.current + 8 && y > 80) setFilterBarVisible(false);
      else if (y < lastScrollRef.current - 8 || y < 10)  setFilterBarVisible(true);
      lastScrollRef.current = y;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
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
      sort:         sort && sort !== "diverse" ? sort : undefined,
      page:         initialPage > 1 ? String(initialPage) : undefined,
    };
    Object.entries({ ...base, ...overrides }).forEach(([k, v]) => { if (v) p.set(k, v); });
    const qs = p.toString();
    return `/homes-for-rent${qs ? `?${qs}` : ""}`;
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
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "https://admin.haskerrealtygroup.com";
      const res = await fetch(`${apiBase}/api/v1/properties/?${p}`);
      if (res.ok) setMapResults((await res.json()).results);
    } finally { setMapLoading(false); }
  }, [searchOnMove, beds, listingType, q]);

  const handleMarkerClick = useCallback((slug: string) => {
    setActiveSlug(slug);
    setMobileView("list");
    cardRefs.current[slug]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  const markers: MapMarker[] = results
    .map((p) => ({ ...p, latitude: Number(p.latitude), longitude: Number(p.longitude) }))
    .filter((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude) && p.latitude !== 0 && p.longitude !== 0)
    .map((p) => ({
      slug: p.slug, title: p.title, price: p.price, price_label: p.price_label,
      city: p.city, state: p.state, lat: p.latitude, lng: p.longitude,
      image_url: p.primary_image_url, beds: p.bedrooms, baths: p.bathrooms,
    }));

  const activeFiltersCount = [q, beds, priceRange].filter(Boolean).length;

  return (
    <div className="pt-20 h-screen overflow-hidden flex flex-col bg-white">

      {/* ── Filter bar ──────────────────────────────────────────────────────── */}
      <div
        className={`shrink-0 bg-white border-b border-neutral-200 relative z-[1100] transition-all duration-200 ease-out ${filterBarVisible ? "shadow-sm" : ""}`}
        style={{
          maxHeight: filterBarVisible ? 160 : 0,
          opacity: filterBarVisible ? 1 : 0,
          overflow: (filterBarVisible && locOpen && locSuggestions.length > 0) ? "visible" : "hidden",
        }}
      >
        <form onSubmit={handleSearch}>

          {/* Row 1: Location search input */}
          <div className="flex items-center gap-2 px-4 pt-3 pb-2">
            <div className="relative flex-1 min-w-0" ref={locationRef}>
              <div className="flex items-center gap-2 bg-white border-2 border-neutral-200 rounded-xl px-3.5 h-11 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15 transition-all">
                <Search size={15} className="text-neutral-400 shrink-0" />
                <input
                  ref={locationInput}
                  type="text"
                  autoComplete="off"
                  placeholder="City, ZIP, or neighborhood…"
                  value={q}
                  onChange={(e) => { setQ(e.target.value); setLocOpen(true); setLocIndex(-1); }}
                  onFocus={() => setLocOpen(true)}
                  onKeyDown={(e) => {
                    if (!locOpen || locSuggestions.length === 0) return;
                    if (e.key === "ArrowDown") { e.preventDefault(); setLocIndex((i) => Math.min(i + 1, locSuggestions.length - 1)); }
                    else if (e.key === "ArrowUp") { e.preventDefault(); setLocIndex((i) => Math.max(i - 1, -1)); }
                    else if (e.key === "Enter" && locIndex >= 0) {
                      e.preventDefault();
                      const s = locSuggestions[locIndex];
                      const val = `${s.city}, ${s.state}`;
                      setQ(val); setLocOpen(false); setLocIndex(-1);
                      navigate({ q: val });
                    } else if (e.key === "Escape") { setLocOpen(false); setLocIndex(-1); }
                  }}
                  className="flex-1 text-[15px] text-brand-dark placeholder:text-neutral-400 outline-none bg-transparent min-w-0"
                />
                {q && (
                  <button
                    type="button"
                    onClick={() => { setQ(""); setLocOpen(false); navigate({ q: undefined }); }}
                    className="text-neutral-400 hover:text-neutral-600 shrink-0 transition-colors p-1.5 -mr-1"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Suggestions dropdown */}
              {locOpen && locSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-neutral-200 shadow-2xl z-50 overflow-hidden">
                  <div className="max-h-[240px] overflow-y-auto overscroll-contain">
                    {q.trim().length === 0 && (
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-4 pt-3 pb-2">
                        Popular Cities
                      </p>
                    )}
                    {locSuggestions.map((s, i) => (
                      <button
                        key={`${s.city}-${s.state}`}
                        type="button"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          const val = `${s.city}, ${s.state}`;
                          setQ(val); setLocOpen(false); setLocIndex(-1);
                          navigate({ q: val });
                        }}
                        className={`w-full flex items-center gap-3 px-4 text-left transition-colors cursor-pointer min-h-[52px] ${
                          i === locIndex
                            ? "bg-brand/5 text-brand"
                            : "text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100"
                        }`}
                      >
                        <MapPin size={15} className={`shrink-0 ${i === locIndex ? "text-brand" : "text-neutral-400"}`} />
                        <span className="text-[14px] font-semibold">{s.city}</span>
                        <span className="text-[13px] text-neutral-400 ml-auto pr-1">{s.state}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search button — icon on mobile, icon + label on desktop */}
            <button
              type="submit"
              aria-label="Search"
              className="flex items-center justify-center gap-2 h-11 w-11 md:w-auto md:px-5 bg-brand hover:bg-brand-hover text-white rounded-xl transition-colors shrink-0 shadow-sm"
            >
              <Search size={16} />
              <span className="hidden md:inline text-[13px] font-bold">Search</span>
            </button>
          </div>

          {/* Row 2: Filter chips — always visible, horizontal scroll on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto px-4 pb-3 scrollbar-none">

            {/* Rent / Buy / All toggle */}
            <div className="flex items-center gap-0.5 p-1 bg-neutral-100 rounded-xl shrink-0">
              {(["", "for-rent", "for-sale"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => { setListingType(type); navigate({ listing_type: type || undefined }); }}
                  className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap ${
                    listingType === type
                      ? "bg-white text-brand-dark shadow-sm"
                      : "text-neutral-500 hover:text-brand-dark"
                  }`}
                >
                  {type === "" ? "All" : type === "for-rent" ? "Rent" : "Sale"}
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

            {/* Clear filters */}
            {activeFiltersCount > 0 && (
              <Link
                href="/homes-for-rent"
                className="shrink-0 flex items-center gap-1.5 h-9 px-4 text-[12px] font-bold text-red-500 border-2 border-red-200 rounded-xl hover:bg-red-50 active:bg-red-100 transition-colors whitespace-nowrap bg-white"
              >
                <X size={13} /> Clear
              </Link>
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
        <div className={`${mobileView === "map" ? "hidden" : "flex"} lg:flex w-full lg:w-[50%] xl:w-[46%] shrink-0 flex-col border-l border-neutral-200 bg-white`}>

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
          <div ref={cardListRef} className="flex-1 overflow-y-auto pb-28 lg:pb-4">
            {mapLoading ? (
              <div className="p-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-[220px] bg-neutral-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8 py-16">
                <Image
                  src="/illustrations/spot-empty-search.svg"
                  alt=""
                  width={160}
                  height={160}
                  className="mb-4 w-40 h-40"
                />
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 mb-1">No results</p>
                <p className="text-brand-dark font-black text-[16px] mb-2">No homes match your filters</p>
                <p className="text-neutral-400 text-[13px] mb-6 max-w-[220px] leading-relaxed">
                  Try a different location, a wider budget, or remove a filter.
                </p>
                <div className="flex flex-col gap-2 w-full max-w-[200px]">
                  {activeFiltersCount > 0 && (
                    <Link href="/homes-for-rent" className="w-full py-3 px-4 bg-brand text-white text-[13px] font-bold rounded-xl hover:bg-brand-hover transition-colors text-center">
                      Clear all filters
                    </Link>
                  )}
                  <Link href="/contact" className="w-full py-3 px-4 border-2 border-neutral-200 text-brand-dark text-[13px] font-bold rounded-xl hover:bg-neutral-50 transition-colors text-center">
                    Ask our team
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
                {results.map((p) => (
                  <div
                    key={p.slug}
                    className="flex flex-col"
                    ref={(el) => { cardRefs.current[p.slug] = el; }}
                    onMouseEnter={() => setActiveSlug(p.slug)}
                    onMouseLeave={() => setActiveSlug(null)}
                  >
                    <PanelCard property={p} isActive={activeSlug === p.slug} />
                  </div>
                ))}

                {!mapResults && totalPages > 1 && (
                  <div className="col-span-1">
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
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <button
          onClick={() => setMobileView(mobileView === "list" ? "map" : "list")}
          className="flex items-center gap-2.5 bg-[#0D1B2A] text-white pl-5 pr-6 py-4 rounded-full shadow-2xl text-[13px] font-bold active:scale-95 transition-transform border border-white/10"
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
  const isRental   = property.listing_type !== "for-sale";
  const detailHref = `/homes-for-rent/${property.slug}`;
  const applyHref  = `/apply?property=${property.slug}`;

  return (
    <article className={`flex flex-col flex-1 rounded-xl overflow-hidden border bg-white group transition-all duration-150 ${
      isActive
        ? "border-brand shadow-lg ring-2 ring-brand/15"
        : "border-neutral-200 hover:shadow-md hover:border-neutral-300"
    }`}>

      {/* Photo — image link at z-0, overlays at z-10 */}
      <div className="relative h-[200px] shrink-0 bg-neutral-100 overflow-hidden">
        {/* Card navigation link under everything */}
        <Link href={detailHref} className="absolute inset-0 z-0 block" aria-label={`View ${property.title}`}>
          {property.primary_image_url ? (
            <Image
              src={property.primary_image_url}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
              <span className="text-neutral-400 text-xs">No photo</span>
            </div>
          )}
        </Link>

        {/* Badges — non-interactive */}
        <div className="absolute top-2 left-2 z-10 flex gap-1 pointer-events-none">
          <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wide ${
            property.listing_type === "for-sale"
              ? "bg-emerald-500 text-white"
              : "bg-brand text-white"
          }`}>
            {property.listing_type === "for-sale" ? "For Sale" : "For Rent"}
          </span>
          {property.is_featured && (
            <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide">
              Featured
            </span>
          )}
        </div>

        {/* Favorite — z-10, fully independent from the card link */}
        <div className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/95 rounded-full flex items-center justify-center shadow-sm">
          <FavoriteButton propertyId={property.id} size={13} className="hover:scale-110 active:scale-90 transition-transform" />
        </div>

        {/* Available pill */}
        <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
          <span className="flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shrink-0" />
            Available
          </span>
        </div>
      </div>

      {/* Body — fully linked to property detail */}
      <Link href={detailHref} className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-[16px] font-black text-brand-dark leading-none">
          ${property.price.toLocaleString()}
          {isRental && <span className="text-[11px] font-semibold text-neutral-400">/mo</span>}
        </p>

        <p className="text-[12px] font-semibold text-neutral-600">
          {property.bedrooms === 0 ? "Studio" : `${property.bedrooms} bd`}
          {" · "}{property.bathrooms} ba
          {property.sqft > 0 && ` · ${property.sqft.toLocaleString()} sqft`}
        </p>

        <p className="text-[11px] text-neutral-400 truncate leading-tight">
          {property.address ? `${property.address}, ` : ""}{property.city}, {property.state}
        </p>
      </Link>

      {/* Apply — fully independent, outside the body link */}
      {isRental && (
        <div className="px-3 pb-3">
          <Link
            href={applyHref}
            className="flex items-center justify-center gap-1.5 w-full py-3 sm:py-2 bg-brand hover:bg-brand-hover active:bg-brand-hover text-white text-[12px] sm:text-[11px] font-bold rounded-lg transition-colors duration-150"
          >
            Apply Now <ArrowRight size={11} />
          </Link>
        </div>
      )}
    </article>
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
