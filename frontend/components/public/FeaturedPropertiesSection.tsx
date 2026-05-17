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
    { id: "all",      label: "All Homes", count: properties.length },
    { id: "for-rent", label: "For Rent",  count: forRent.length },
    { id: "for-sale", label: "For Sale",  count: forSale.length },
  ];

  const viewAllHref =
    tab === "for-rent" ? "/homes-for-rent?listing_type=for-rent" :
    tab === "for-sale" ? "/homes-for-rent?listing_type=for-sale" :
    "/homes-for-rent";

  return (
    <section className="py-16 lg:py-24 bg-white border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-emerald-600">
                Move-In Ready
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-dark leading-tight">
              Homes Available Now
            </h2>
            <p className="text-neutral-500 mt-2 text-[14px]">
              {totalCount != null ? `${totalCount} homes listed` : "Updated daily"} — inspected, maintained, and ready for you.
            </p>
          </div>

          <Link
            href="/homes-for-rent"
            className="shrink-0 inline-flex items-center gap-2 text-[13px] font-bold text-brand hover:text-brand-hover transition-colors border-b-2 border-brand/30 hover:border-brand pb-0.5"
          >
            View All Properties <ArrowRight size={14} />
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-10 p-1.5 bg-neutral-100 rounded-xl w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-bold transition-all duration-200 ${
                tab === t.id
                  ? "bg-white text-brand-dark shadow-sm"
                  : "text-neutral-500 hover:text-brand-dark"
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`text-[11px] tabular-nums font-semibold px-1.5 py-0.5 rounded-md ${
                  tab === t.id ? "bg-brand/10 text-brand" : "bg-neutral-200 text-neutral-400"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {display.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-12 text-center">
              <Link
                href={viewAllHref}
                className="inline-flex items-center gap-3 bg-brand-dark text-white font-bold text-[14px] px-10 py-4 rounded-xl hover:bg-brand transition-colors duration-200"
              >
                Browse All Available Homes
                {totalCount != null && (
                  <span className="text-white/50 font-normal text-[13px]">{totalCount} total</span>
                )}
                <ArrowRight size={16} />
              </Link>
              <p className="mt-4 text-neutral-400 text-[13px]">
                Ready to apply?{" "}
                <Link href="/apply" className="text-brand font-semibold hover:underline">
                  Start your free application here
                </Link>
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-neutral-400">
            <p className="font-semibold text-lg text-brand-dark">New listings coming soon.</p>
            <p className="text-sm mt-2 text-neutral-500">Check back shortly or browse all available rentals.</p>
          </div>
        )}
      </div>
    </section>
  );
}
