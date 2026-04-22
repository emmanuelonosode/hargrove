"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, type MutableRefObject } from "react";

export interface MapMarker {
  slug: string;
  title: string;
  price: number;
  price_label: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  image_url: string | null;
  beds: number;
  baths: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface Props {
  markers: MapMarker[];
  center?: [number, number];
  activeSlug?: string | null;
  onMarkerClick?: (slug: string) => void;
  onBoundsChange?: (bounds: MapBounds) => void;
}

const NAVY = "#0B1F3A";
const BLUE = "#1A56DB";
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function validCoord(m: { lat: number; lng: number }) {
  return Number.isFinite(m.lat) && Number.isFinite(m.lng) && m.lat !== 0 && m.lng !== 0;
}

function makeBubble(L: any, price: number, label: string, active: boolean) {
  const bg = active ? BLUE : NAVY;
  return L.divIcon({
    className: "",
    html: `<div style="
      background:${bg};color:#fff;font-size:11px;font-weight:700;
      padding:6px 12px;border-radius:20px;white-space:nowrap;
      box-shadow:${active ? "0 4px 16px rgba(26,86,219,0.6)" : "0 2px 10px rgba(0,0,0,0.4)"};
      border:2.5px solid #fff;cursor:pointer;
      transform:${active ? "scale(1.15)" : "scale(1)"};
      transform-origin:bottom center;transition:all .15s;user-select:none;
    ">$${price.toLocaleString()}${label ?? ""}</div>`,
    iconSize: [88, 34],
    iconAnchor: [44, 17],
    popupAnchor: [0, -22],
  });
}

function buildPopup(m: MapMarker) {
  return `
    <a href="/properties/${m.slug}"
       style="text-decoration:none;color:inherit;display:block;font-family:system-ui,sans-serif;">
      ${m.image_url
        ? `<img src="${m.image_url}" style="width:248px;height:148px;object-fit:cover;
                border-radius:8px 8px 0 0;display:block;margin:-14px -14px 10px;max-width:none;"/>`
        : ""}
      <div style="padding:0 3px 3px">
        <div style="font-size:18px;font-weight:800;color:${BLUE};line-height:1.1">
          $${m.price.toLocaleString()}
          <span style="font-size:12px;font-weight:400;color:#888">${m.price_label ?? ""}</span>
        </div>
        <div style="font-weight:600;font-size:12px;color:${NAVY};margin:3px 0">${m.title}</div>
        <div style="font-size:11px;color:#888;margin-bottom:8px">
          ${m.beds} bd · ${m.baths} ba &nbsp;·&nbsp; ${m.city}, ${m.state}
        </div>
        <div style="background:${BLUE};color:#fff;text-align:center;
                    padding:9px;border-radius:6px;font-size:12px;font-weight:700;">
          View Property →
        </div>
      </div>
    </a>`;
}

function addBubbleMarkers(
  L: any, map: any,
  markers: MapMarker[],
  activeSlug: string | null,
  markersMapRef: MutableRefObject<Map<string, any>>,
  onMarkerClickRef: MutableRefObject<((s: string) => void) | undefined>,
) {
  markers.filter(validCoord).forEach((m) => {
    const isActive = m.slug === activeSlug;
    const mk = L.marker([m.lat, m.lng], {
      icon: makeBubble(L, m.price, m.price_label, isActive),
      zIndexOffset: isActive ? 2000 : 500,
    });
    mk.bindPopup(buildPopup(m), { maxWidth: 276, closeButton: false, className: "property-popup" });
    mk.on("mouseover", () => mk.openPopup());
    mk.on("click", () => { mk.openPopup(); onMarkerClickRef.current?.(m.slug); });
    mk.addTo(map);
    markersMapRef.current.set(m.slug, mk);
  });
}

export function PropertiesMap({ markers, center, activeSlug, onMarkerClick, onBoundsChange }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<any>(null);
  const mountedRef    = useRef(false);
  const markersMapRef = useRef<Map<string, any>>(new Map());
  const dotLayerRef   = useRef<any>(null);

  const onMarkerClickRef  = useRef(onMarkerClick);
  const onBoundsChangeRef = useRef(onBoundsChange);
  useEffect(() => { onMarkerClickRef.current  = onMarkerClick;  }, [onMarkerClick]);
  useEffect(() => { onBoundsChangeRef.current = onBoundsChange; }, [onBoundsChange]);

  // ── Fetch lightweight map pins and render as dot markers ─────────────────
  async function loadAllDots(L: any, map: any) {
    try {
      const res = await fetch(`${API_BASE}/api/v1/properties/map-pins/`);
      if (!res.ok || !mountedRef.current) return;
      const results: any[] = await res.json();

      if (!mountedRef.current || !mapRef.current) return;

      const layer = (L as any).layerGroup();

      results.forEach((p: any) => {
        const lat = Number(p.latitude);
        const lng = Number(p.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat === 0 || lng === 0) return;

        const dot = (L as any).circleMarker([lat, lng], {
          radius: 8,
          fillColor: BLUE,
          fillOpacity: 0.85,
          color: "#ffffff",
          weight: 2,
          interactive: true,
        });

        dot.on("mouseover", () => {
          dot.bindPopup(
            `<a href="/properties/${p.slug}"
                style="text-decoration:none;color:inherit;display:block;font-family:system-ui;min-width:160px">
              <div style="font-size:15px;font-weight:800;color:${BLUE}">
                $${Number(p.price).toLocaleString()}${p.price_label ?? ""}
              </div>
              <div style="font-size:11px;color:#555;margin:2px 0">
                ${p.bedrooms} bd · ${p.bathrooms} ba
              </div>
              <div style="font-size:10px;color:#888">${p.city}, ${p.state}</div>
              <div style="margin-top:7px;background:${BLUE};color:#fff;text-align:center;
                          padding:6px 10px;border-radius:5px;font-size:11px;font-weight:700;">
                View Property →
              </div>
            </a>`,
            { maxWidth: 210, closeButton: false, className: "property-popup" }
          ).openPopup();
        });

        dot.on("click", () => { window.location.href = `/properties/${p.slug}`; });
        dot.addTo(layer);
      });

      if (mountedRef.current && mapRef.current) {
        layer.addTo(map);
        dotLayerRef.current = layer;
      }
    } catch { /* network error — skip dots silently */ }
  }

  // ── Initialize map ────────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    if (!containerRef.current) return;
    const el = containerRef.current;

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

      let map: any;
      try {
        map = L.map(el, {
          center: center ?? [37.09, -95.71],
          zoom: 5,
          scrollWheelZoom: true,
          zoomControl: false,
          preferCanvas: true,   // canvas renders thousands of circleMarkers fast
        });
      } catch { return; }

      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      const emitBounds = () => {
        if (!mountedRef.current) return;
        map.invalidateSize();
        const b = map.getBounds();
        if (b.getNorth() === b.getSouth() || b.getEast() === b.getWest()) return;
        onBoundsChangeRef.current?.({
          north: b.getNorth(), south: b.getSouth(),
          east: b.getEast(),   west: b.getWest(),
        });
      };
      map.on("moveend", emitBounds);

      mapRef.current = map;

      // Load ALL property dots in background
      loadAllDots(L, map);

      // Trigger initial search-as-I-move after layout paints
      setTimeout(() => { map.invalidateSize(); emitBounds(); }, 700);
    });

    return () => {
      mountedRef.current = false;
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch (_) {}
        mapRef.current = null;
        markersMapRef.current.clear();
        dotLayerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Rebuild viewport price-bubble markers ─────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then((L) => {
      const map = mapRef.current;
      if (!map) return;
      markersMapRef.current.forEach((mk) => map.removeLayer(mk));
      markersMapRef.current.clear();
      addBubbleMarkers(L, map, markers.filter(validCoord), activeSlug ?? null,
        markersMapRef, onMarkerClickRef);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers]);

  // ── Update active-state icon without full rebuild ─────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then((L) => {
      markersMapRef.current.forEach((mk, slug) => {
        const m = markers.find((x) => x.slug === slug);
        if (!m) return;
        mk.setIcon(makeBubble(L, m.price, m.price_label, slug === activeSlug));
        mk.setZIndexOffset(slug === activeSlug ? 2000 : 500);
      });
    });
  }, [activeSlug, markers]);

  return <div ref={containerRef} className="w-full h-full" style={{ zIndex: 0 }} />;
}
