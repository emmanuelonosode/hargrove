"use client";

import dynamic from "next/dynamic";

const HomepagePropertyMap = dynamic(
  () => import("./HomepagePropertyMap").then((m) => m.HomepagePropertyMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-neutral-100 animate-pulse" /> }
);

export function HomepagePropertyMapLoader() {
  return (
    <div className="w-full h-full">
      <HomepagePropertyMap />
    </div>
  );
}
