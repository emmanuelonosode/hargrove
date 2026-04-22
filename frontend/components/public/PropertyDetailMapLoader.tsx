"use client";

import dynamic from "next/dynamic";
import type { DetailMarker } from "./PropertyDetailMap";

const PropertyDetailMap = dynamic(
  () => import("./PropertyDetailMap").then((m) => m.PropertyDetailMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-neutral-100 animate-pulse flex items-center justify-center">
        <span className="text-xs text-neutral-400">Loading map…</span>
      </div>
    ),
  }
);

interface Props {
  current: DetailMarker;
  nearby: DetailMarker[];
}

export function PropertyDetailMapLoader({ current, nearby }: Props) {
  return (
    <div className="w-full h-full">
      <PropertyDetailMap current={current} nearby={nearby} />
    </div>
  );
}
