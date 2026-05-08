"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PropertyCard } from "@/components/public/PropertyCard";
import { Button } from "@/components/ui/Button";
import type { Property } from "@/types";

interface Props {
  properties: Property[];
  totalCount: number | null;
}

type Tab = "all" | "for-rent" | "for-sale";

export function FeaturedPropertiesSection({ properties, totalCount }: Props) {
  const [tab, setTab] = useState<Tab>("all");

  const forRent = properties.filter(p => p.listingType === "for-rent");
  const forSale = properties.filter(p => p.listingType === "for-sale");

  const shown = tab === "all" ? properties : tab === "for-rent" ? forRent : forSale;
  // If the active tab has no results, fall back gracefully to all
  const display = shown.length > 0 ? shown : properties;

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "all",      label: "All Homes", count: properties.length },
    { id: "for-rent", label: "For Rent",  count: forRent.length },
    { id: "for-sale", label: "For Sale",  count: forSale.length },
  ];

  const viewAllHref =
    tab === "for-rent" ? "/properties?listing_type=for-rent" :
    tab === "for-sale" ? "/properties?listing_type=for-sale" :
    "/properties";

  const viewAllLabel =
    tab === "for-rent" ? "See All Rentals" :
    tab === "for-sale" ? "See All Homes for Sale" :
    "Browse All Available Homes";

  return (
    <section className="py-16 lg:py-24 bg-brand-light">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4">
          <div>
            <p className="text-brand text-xs font-semibold tracking-[0.3em] uppercase mb-3">
              Move-In Ready
            </p>
            <h2 className="font-serif text-4xl font-bold text-brand-dark">
              Homes Available Now
            </h2>
            <p className="text-neutral-500 mt-2 text-sm">
              {totalCount != null ? `${totalCount} homes listed` : "Updated daily"} — priced honestly, no hidden fees.
            </p>
          </div>
          <Button variant="outline" asChild className="shrink-0">
            <Link href="/properties" className="flex items-center gap-2">
              View All Properties <ArrowRight size={16} />
            </Link>
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                tab === t.id
                  ? "bg-brand text-white border-transparent shadow-sm"
                  : "bg-white text-neutral-600 border-neutral-200 hover:border-brand hover:text-brand"
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`text-[11px] tabular-nums ${tab === t.id ? "text-white/60" : "text-neutral-400"}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Grid */}
        {display.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {display.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {/* Bottom CTA — catches users after they've browsed */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={viewAllHref}
                className="inline-flex items-center gap-2 bg-brand text-white font-semibold px-8 py-4 rounded-sm hover:bg-brand-hover transition-colors duration-200"
              >
                {viewAllLabel}
                {totalCount != null && (
                  <span className="text-white/60 font-normal">· {totalCount} total</span>
                )}
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/apply"
                className="inline-flex items-center gap-2 text-brand font-semibold text-sm underline underline-offset-4 hover:text-brand-hover transition-colors"
              >
                Ready to apply? Start here
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-16 text-neutral-400">
            <p className="font-sans text-lg font-medium">New listings coming soon.</p>
            <p className="text-sm mt-2">Check back shortly or browse all available rentals.</p>
          </div>
        )}
      </div>
    </section>
  );
}
