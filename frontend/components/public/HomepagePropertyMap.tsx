"use client";

import "leaflet/dist/leaflet.css";
import { useState, useEffect, useRef, useMemo } from "react";
import { Search, ArrowRight, X } from "lucide-react";
import Link from "next/link";

interface MapPin {
  slug: string;
  price: number;
  price_label: string | null;
  latitude: string | number;
  longitude: string | number;
  bedrooms: number;
  bathrooms: number;
  city: string;
  state: string;
  listing_type: string;
}

const BLUE = "#1A56DB";

function isValid(p: MapPin) {
  const lat = Number(p.latitude), lng = Number(p.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0;
}

export function HomepagePropertyMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<any>(null);
  const layerRef     = useRef<any>(null);
  const mountedRef   = useRef(false);
  const [mapReady, setMapReady] = useState(false);

  const [allPins, setAllPins]         = useState<MapPin[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [listingType, setListingType] = useState<"all" | "for-rent" | "for-sale">("all");

  const validPins = useMemo(() => allPins.filter(isValid), [allPins]);

  const filteredPins = useMemo(() => {
    const q = search.trim().toLowerCase();
    return validPins.filter(p => {
      const typeOk = listingType === "all" || p.listing_type === listingType;
      const cityOk = !q || p.city.toLowerCase().includes(q);
      return typeOk && cityOk;
    });
  }, [validPins, search, listingType]);

  const suggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || !inputFocused) return [];
    return [...new Set(validPins.map(p => p.city))]
      .filter(c => c.toLowerCase().startsWith(q))
      .sort()
      .slice(0, 6);
  }, [validPins, search, inputFocused]);

  // Fetch all property pins once
  useEffect(() => {
    fetch("/api/v1/properties/map-pins/")
      .then(r => r.ok ? r.json() : [])
      .then((d: MapPin[]) => { setAllPins(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    mountedRef.current = true;
    const el = containerRef.current;
    if (!el) return;

    import("leaflet").then((L) => {
      if (!mountedRef.current || !el || mapRef.current) return;

      if ((el as any)._leaflet_id) {
        try { (el as any)._leaflet?.remove(); } catch (_) {}
        delete (el as any)._leaflet_id;
      }

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "/leaflet/marker-icon.png",
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        shadowUrl: "/leaflet/marker-shadow.png",
      });

      const map = L.map(el, {
        center: [37.09, -95.71],
        zoom: 4,
        scrollWheelZoom: false,
        zoomControl: false,
        preferCanvas: true,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      setTimeout(() => { map.invalidateSize(); setMapReady(true); }, 300);
    });

    return () => {
      mountedRef.current = false;
      if (mapRef.current) { try { mapRef.current.remove(); } catch (_) {} mapRef.current = null; }
      layerRef.current = null;
    };
  }, []);

  // Rebuild dot layer whenever filters or data change
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    import("leaflet").then((L) => {
      const map = mapRef.current;
      if (!map) return;

      if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null; }

      const layer = (L as any).layerGroup();

      filteredPins.forEach(p => {
        const dot = (L as any).circleMarker([Number(p.latitude), Number(p.longitude)], {
          radius: 8,
          fillColor: BLUE,
          fillOpacity: 0.9,
          color: "#fff",
          weight: 2,
          interactive: true,
        });

        dot.on("mouseover", () => {
          dot.bindPopup(
            `<a href="/homes-for-rent/${p.slug}" style="text-decoration:none;color:inherit;display:block;font-family:system-ui,sans-serif;min-width:170px">
               <div style="font-size:16px;font-weight:800;color:${BLUE}">
                 $${Number(p.price).toLocaleString()}
                 <span style="font-size:11px;font-weight:400;color:#888">${p.price_label ?? ""}</span>
               </div>
               <div style="font-size:11px;color:#555;margin:4px 0">${p.bedrooms} bd &nbsp;·&nbsp; ${p.bathrooms} ba</div>
               <div style="font-size:10px;color:#999;margin-bottom:10px">${p.city}, ${p.state}</div>
               <div style="background:${BLUE};color:#fff;text-align:center;padding:8px;border-radius:6px;font-size:11px;font-weight:700;">
                 View Property →
               </div>
             </a>`,
            { maxWidth: 230, closeButton: false, className: "property-popup" }
          ).openPopup();
        });

        dot.on("click", () => { window.location.href = `/homes-for-rent/${p.slug}`; });
        dot.addTo(layer);
      });

      layer.addTo(map);
      layerRef.current = layer;

      // Pan to matching markers when city search is active
      if (search.trim() && filteredPins.length > 0) {
        const bounds = (L as any).latLngBounds(
          filteredPins.map(p => [Number(p.latitude), Number(p.longitude)])
        );
        map.fitBounds(bounds.pad(0.3), { maxZoom: 12 });
      }
    });
  }, [mapReady, filteredPins, search]);

  return (
    <div className="relative w-full h-full">
      {/* Overlay controls */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-start gap-2 flex-wrap">

        {/* City search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search city…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setTimeout(() => setInputFocused(false), 160)}
            className="bg-white shadow-lg border border-neutral-200 rounded-full pl-8 pr-7 py-2 text-sm w-40 sm:w-52 outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-shadow"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X size={12} />
            </button>
          )}
          {suggestions.length > 0 && (
            <div className="absolute top-full mt-1 left-0 w-52 bg-white shadow-xl border border-neutral-100 rounded-xl overflow-hidden z-10">
              {suggestions.map(city => (
                <button
                  key={city}
                  onMouseDown={() => setSearch(city)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-brand-light hover:text-brand transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Listing type filter pills */}
        <div className="flex gap-1">
          {(["all", "for-rent", "for-sale"] as const).map(t => (
            <button
              key={t}
              onClick={() => setListingType(t)}
              className={`px-3 py-2 rounded-full text-xs font-semibold shadow-lg border transition-colors whitespace-nowrap ${
                listingType === t
                  ? "bg-brand text-white border-transparent"
                  : "bg-white text-neutral-700 border-neutral-200 hover:border-brand hover:text-brand"
              }`}
            >
              {t === "all" ? "All" : t === "for-rent" ? "For Rent" : "For Sale"}
            </button>
          ))}
        </div>

        <Link
          href={`/homes-for-rent${listingType !== "all" ? `?listing_type=${listingType}` : ""}`}
          className="ml-auto hidden sm:flex items-center gap-1.5 bg-brand text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg hover:bg-brand-hover transition-colors whitespace-nowrap"
        >
          Browse All <ArrowRight size={12} />
        </Link>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="absolute inset-0 bg-neutral-100 animate-pulse flex items-center justify-center z-[500]">
          <p className="text-neutral-400 text-sm font-medium">Loading properties…</p>
        </div>
      )}

      {/* Leaflet map container */}
      <div ref={containerRef} className="w-full h-full" style={{ zIndex: 0 }} />

      {/* Property count badge */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
        <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 shadow-md rounded-full px-4 py-1.5 text-xs font-medium text-neutral-600 whitespace-nowrap">
          {!loading && filteredPins.length === 0
            ? "No properties found"
            : `${filteredPins.length} ${filteredPins.length === 1 ? "property" : "properties"}${search.trim() ? ` in ${search}` : ""}`}
        </div>
      </div>
    </div>
  );
}
