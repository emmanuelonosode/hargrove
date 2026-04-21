"use client";

import { useEffect, useRef } from "react";

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

interface Props {
  markers: MapMarker[];
  center?: [number, number];
}

export function PropertiesMap({ markers, center }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const validMarkers = markers.filter((m) => m.lat && m.lng);
    if (validMarkers.length === 0) return;

    // Default center: centroid of markers, or US center
    const defaultCenter: [number, number] = center ?? (() => {
      const avgLat = validMarkers.reduce((s, m) => s + m.lat, 0) / validMarkers.length;
      const avgLng = validMarkers.reduce((s, m) => s + m.lng, 0) / validMarkers.length;
      return [avgLat, avgLng];
    })();

    import("leaflet").then((L) => {
      if (mapRef.current || !containerRef.current) return;

      // Load leaflet CSS dynamically
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // Fix default marker icon path broken by webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current!, {
        center: defaultCenter,
        zoom: validMarkers.length === 1 ? 14 : 9,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom price marker icon
      const priceIcon = (price: number, price_label: string) =>
        L.divIcon({
          className: "",
          html: `<div style="
            background:#0B1F3A;color:#fff;font-size:11px;font-weight:700;
            padding:4px 8px;border-radius:20px;white-space:nowrap;
            box-shadow:0 2px 6px rgba(0,0,0,0.35);border:2px solid #fff;
            cursor:pointer;
          ">$${price.toLocaleString()}${price_label ?? ""}</div>`,
          iconAnchor: [30, 15],
        });

      validMarkers.forEach((m) => {
        const popup = `
          <a href="/properties/${m.slug}" style="text-decoration:none;color:inherit">
            ${m.image_url ? `<img src="${m.image_url}" style="width:200px;height:120px;object-fit:cover;border-radius:6px;display:block;margin-bottom:8px" />` : ""}
            <div style="font-weight:600;font-size:13px;color:#0B1F3A">${m.title}</div>
            <div style="font-size:12px;color:#555;margin:2px 0">${m.city}, ${m.state}</div>
            <div style="font-size:14px;font-weight:700;color:#1A56DB">$${m.price.toLocaleString()}${m.price_label ?? ""}</div>
            <div style="font-size:11px;color:#888">${m.beds} bd · ${m.baths} ba</div>
          </a>
        `;
        L.marker([m.lat, m.lng], { icon: priceIcon(m.price, m.price_label) })
          .addTo(map)
          .bindPopup(popup, { maxWidth: 220 });
      });

      // Fit bounds if multiple markers
      if (validMarkers.length > 1) {
        const bounds = L.latLngBounds(validMarkers.map((m) => [m.lat, m.lng]));
        map.fitBounds(bounds, { padding: [40, 40] });
      }

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when page changes
  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then((L) => {
      const map = mapRef.current;
      if (!map) return;
      // Remove old markers (keep tile layer)
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) map.removeLayer(layer);
      });
      const validMarkers = markers.filter((m) => m.lat && m.lng);
      const priceIcon = (price: number, price_label: string) =>
        L.divIcon({
          className: "",
          html: `<div style="
            background:#0B1F3A;color:#fff;font-size:11px;font-weight:700;
            padding:4px 8px;border-radius:20px;white-space:nowrap;
            box-shadow:0 2px 6px rgba(0,0,0,0.35);border:2px solid #fff;
          ">$${price.toLocaleString()}${price_label ?? ""}</div>`,
          iconAnchor: [30, 15],
        });
      validMarkers.forEach((m) => {
        const popup = `
          <a href="/properties/${m.slug}" style="text-decoration:none;color:inherit">
            ${m.image_url ? `<img src="${m.image_url}" style="width:200px;height:120px;object-fit:cover;border-radius:6px;display:block;margin-bottom:8px" />` : ""}
            <div style="font-weight:600;font-size:13px;color:#0B1F3A">${m.title}</div>
            <div style="font-size:12px;color:#555;margin:2px 0">${m.city}, ${m.state}</div>
            <div style="font-size:14px;font-weight:700;color:#1A56DB">$${m.price.toLocaleString()}${m.price_label ?? ""}</div>
            <div style="font-size:11px;color:#888">${m.beds} bd · ${m.baths} ba</div>
          </a>
        `;
        L.marker([m.lat, m.lng], { icon: priceIcon(m.price, m.price_label) })
          .addTo(map)
          .bindPopup(popup, { maxWidth: 220 });
      });
      if (validMarkers.length > 1) {
        const bounds = L.latLngBounds(validMarkers.map((m) => [m.lat, m.lng]));
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    });
  }, [markers]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[500px]"
      style={{ zIndex: 0 }}
    />
  );
}
