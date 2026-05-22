"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PropertyCard } from "@/components/public/PropertyCard";
import type { Property } from "@/types";

interface Props {
  properties: Property[];
  totalCount: number | null;
}

type Tab = "all" | "for-rent" | "for-sale";

export function FeaturedPropertiesSection({ properties, totalCount }: Props) {
  const [tab, setTab] = useState<Tab>("all");

  const forRent = properties.filter((p) => p.listingType === "for-rent");
  const forSale = properties.filter((p) => p.listingType === "for-sale");

  const shown = tab === "all" ? properties : tab === "for-rent" ? forRent : forSale;
  const display = shown.length > 0 ? shown : properties;

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "all",      label: "All homes", count: properties.length },
    { id: "for-rent", label: "For rent",  count: forRent.length },
    { id: "for-sale", label: "For sale",  count: forSale.length },
  ];

  const viewAllHref =
    tab === "for-rent" ? "/homes-for-rent?listing_type=for-rent" :
    tab === "for-sale" ? "/homes-for-rent?listing_type=for-sale" :
    "/homes-for-rent";

  return (
    <section className="py-[88px] px-8 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-brand">Move-in ready</p>
            <h2 className="font-serif font-bold text-brand-dark leading-[1.12] mt-3" style={{ fontSize: 38, letterSpacing: "-0.015em" }}>
              Available rentals this week.
            </h2>
            {totalCount != null && (
              <p className="mt-2" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "#475569" }}>
                {totalCount} homes listed — inspected, maintained, and ready for you.
              </p>
            )}
          </div>
          <Link
            href="/homes-for-rent"
            className="shrink-0 inline-flex items-center gap-1.5 text-brand text-[14px] font-medium hover:opacity-80 transition-opacity"
          >
            Browse all rentals <ArrowRight size={14} />
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-px mb-8 border border-[#F1F5F9] w-fit rounded-sm overflow-hidden">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium transition-colors cursor-pointer ${
                tab === t.id
                  ? "bg-brand-dark text-white"
                  : "bg-white text-[#475569] hover:text-brand-dark"
              }`}
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`text-[11px] tabular-nums font-semibold px-1.5 py-0.5 rounded-sm ${
                  tab === t.id ? "bg-white/20 text-white" : "bg-[#F1F5F9] text-[#94A3B8]"
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Property grid */}
        {display.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {display.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href={viewAllHref}
                className="inline-flex items-center gap-2 bg-brand-dark text-white text-[14px] font-medium tracking-[0.05em] h-[50px] px-8 rounded-sm hover:bg-brand transition-colors"
              >
                Browse all available homes
                {totalCount != null && (
                  <span className="text-white/50 font-normal text-[13px]">{totalCount} total</span>
                )}
                <ArrowRight size={14} />
              </Link>
              <p className="mt-4" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "#94A3B8" }}>
                Ready to apply?{" "}
                <Link href="/apply" className="text-brand font-medium hover:underline">
                  Start your free application here
                </Link>
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-20" style={{ color: "#94A3B8" }}>
            <p className="font-serif font-bold text-[18px] text-brand-dark">New listings coming soon.</p>
            <p className="mt-2" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "#475569" }}>Check back shortly or browse all available rentals.</p>
          </div>
        )}
      </div>
    </section>
  );
}
