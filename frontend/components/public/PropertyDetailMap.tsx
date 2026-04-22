"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, type MutableRefObject } from "react";

export interface DetailMarker {
  slug: string;
  title: string;
  price: number;
  price_label: string;
  lat: number;
  lng: number;
  image_url: string | null;
  beds: number;
  baths: number;
  city: string;
  state: string;
}

interface Props {
  current: DetailMarker;
  nearby: DetailMarker[];
}

const NAVY = "#0B1F3A";
const BLUE = "#1A56DB";
const GREEN = "#16a34a";

function validCoord(m: { lat: number; lng: number }) {
  return Number.isFinite(m.lat) && Number.isFinite(m.lng) && m.lat !== 0 && m.lng !== 0;
}

function makeCurrentIcon(L: any) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:48px;height:48px;border-radius:50%;
      background:${BLUE};border:3px solid #fff;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 4px 20px rgba(26,86,219,0.55);
      cursor:default;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
        fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -28],
  });
}

function makeNearbyIcon(L: any, price: number, price_label: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      background:${NAVY};color:#fff;font-size:11px;font-weight:700;
      padding:5px 10px;border-radius:20px;white-space:nowrap;
      box-shadow:0 2px 8px rgba(0,0,0,0.35);border:2px solid #fff;
      cursor:pointer;
    ">$${price.toLocaleString()}${price_label ?? ""}</div>`,
    iconSize: [80, 32],
    iconAnchor: [40, 16],
    popupAnchor: [0, -20],
  });
}

function buildCurrentPopup(m: DetailMarker) {
  return `
    <div style="font-family:system-ui,sans-serif;width:220px">
      ${m.image_url
        ? `<img src="${m.image_url}" style="width:248px;height:140px;object-fit:cover;border-radius:8px 8px 0 0;display:block;margin:-14px -14px 10px;max-width:none;"/>`
        : ""}
      <div style="padding:0 2px 2px">
        <span style="background:${BLUE};color:#fff;font-size:9px;font-weight:700;padding:2px 8px;border-radius:10px;letter-spacing:0.05em;text-transform:uppercase;">
          This Property
        </span>
        <div style="font-size:18px;font-weight:800;color:${BLUE};margin:6px 0 2px">
          $${m.price.toLocaleString()}<span style="font-size:11px;font-weight:400;color:#888">${m.price_label ?? ""}</span>
        </div>
        <div style="font-size:12px;font-weight:600;color:${NAVY};margin-bottom:2px;line-height:1.3">${m.title}</div>
        <div style="font-size:11px;color:#888">${m.beds} bd · ${m.baths} ba &nbsp;·&nbsp; ${m.city}, ${m.state}</div>
      </div>
    </div>`;
}

function buildNearbyPopup(m: DetailMarker) {
  return `
    <a href="/properties/${m.slug}" style="text-decoration:none;color:inherit;display:block;font-family:system-ui,sans-serif;width:220px">
      ${m.image_url
        ? `<img src="${m.image_url}" style="width:248px;height:140px;object-fit:cover;border-radius:8px 8px 0 0;display:block;margin:-14px -14px 10px;max-width:none;"/>`
        : ""}
      <div style="padding:0 2px 2px">
        <div style="font-size:18px;font-weight:800;color:${BLUE};margin-bottom:2px">
          $${m.price.toLocaleString()}<span style="font-size:11px;font-weight:400;color:#888">${m.price_label ?? ""}</span>
        </div>
        <div style="font-size:12px;font-weight:600;color:${NAVY};margin-bottom:2px;line-height:1.3">${m.title}</div>
        <div style="font-size:11px;color:#888;margin-bottom:8px">${m.beds} bd · ${m.baths} ba &nbsp;·&nbsp; ${m.city}, ${m.state}</div>
        <div style="background:${BLUE};color:#fff;text-align:center;padding:8px 12px;border-radius:6px;font-size:12px;font-weight:700;">
          View Property →
        </div>
      </div>
    </a>`;
}

function addMarkers(
  L: any,
  map: any,
  current: DetailMarker,
  nearby: DetailMarker[],
  markersRef: MutableRefObject<any[]>,
) {
  // Current property — house icon, always opens popup
  if (validCoord(current)) {
    const m = L.marker([current.lat, current.lng], {
      icon: makeCurrentIcon(L),
      zIndexOffset: 2000,
    });
    m.bindPopup(buildCurrentPopup(current), { maxWidth: 276, closeButton: false, className: "property-popup" });
    m.on("mouseover", () => m.openPopup());
    m.addTo(map);
    markersRef.current.push(m);
  }

  // Nearby — price bubbles, hover to open popup
  nearby.filter(validCoord).forEach((nb) => {
    const mk = L.marker([nb.lat, nb.lng], {
      icon: makeNearbyIcon(L, nb.price, nb.price_label),
      zIndexOffset: 0,
    });
    mk.bindPopup(buildNearbyPopup(nb), { maxWidth: 276, closeButton: false, className: "property-popup" });
    mk.on("mouseover", () => mk.openPopup());
    mk.on("click", () => { window.location.href = `/properties/${nb.slug}`; });
    mk.addTo(map);
    markersRef.current.push(mk);
  });
}

export function PropertyDetailMap({ current, nearby }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const mountedRef = useRef(false);

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
          center: validCoord(current) ? [current.lat, current.lng] : [37.09, -95.71],
          zoom: 13,
          scrollWheelZoom: false,
          zoomControl: false,
        });
      } catch { return; }

      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      addMarkers(L, map, current, nearby, markersRef);
      mapRef.current = map;

      // Open current property popup after map settles
      setTimeout(() => {
        map.invalidateSize();
        if (markersRef.current[0]) markersRef.current[0].openPopup();
      }, 500);
    });

    return () => {
      mountedRef.current = false;
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch (_) {}
        mapRef.current = null;
        markersRef.current = [];
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="w-full h-full" style={{ zIndex: 0 }} />;
}
