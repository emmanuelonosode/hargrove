"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles, TrendingUp, ChevronRight, ShieldCheck
} from "lucide-react";
import { PropertyEligibilityDrawer } from "./PropertyEligibilityDrawer";
import { ActiveSpecialModal } from "./ActiveSpecialModal";
import { formatPrice } from "@/lib/utils";

interface PropertyLeadCTAsProps {
  mode: "banner" | "sidebar" | "mobile-sticky";
  propertyId: number;
  propertySlug: string;
  propertyTitle: string;
  propertyPrice: number;
  propertyCity: string;
}

export function PropertyLeadCTAs({
  mode,
  propertyId,
  propertySlug,
  propertyTitle,
  propertyPrice,
  propertyCity,
}: PropertyLeadCTAsProps) {
  const [eligibilityOpen, setEligibilityOpen] = useState(false);
  const [specialOpen, setSpecialOpen] = useState(false);

  if (mode === "banner") {
    return (
      <>
        <div className="rounded-2xl bg-amber-50 border border-amber-200/60 p-4 sm:p-5 hover:shadow-sm transition-shadow duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-600 border border-amber-500/20">
                <Sparkles size={17} />
              </div>
              <div>
                <h4 className="font-serif text-sm sm:text-base font-bold text-brand-dark flex items-center gap-2">
                  Exclusive Rent Special Active
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                </h4>
                <p className="text-xs text-neutral-500 mt-1 leading-normal max-w-xl">
                  Get your <strong className="text-brand-dark font-semibold">first month&apos;s rent FREE</strong> on qualifying rentals. Limited time — offer ends soon.
                </p>
              </div>
            </div>

            <button
              onClick={() => setSpecialOpen(true)}
              className="shrink-0 bg-brand hover:bg-brand-hover text-white text-xs font-bold py-3 px-5 rounded-xl transition-all shadow-md shadow-brand/10 cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              Claim Special Offer
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <ActiveSpecialModal
          open={specialOpen}
          onClose={() => setSpecialOpen(false)}
          propertyId={propertyId}
          propertySlug={propertySlug}
          propertyTitle={propertyTitle}
          propertyCity={propertyCity}
        />
      </>
    );
  }

  if (mode === "sidebar") {
    return (
      <>
        <div className="space-y-3">
          {/* Income status verification indicator */}
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100/80 rounded-xl p-3.5 text-xs text-emerald-800">
            <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
            <div className="leading-snug">
              <span className="font-bold">Instant Pre-Screening:</span> Qualify online in 30s. No hard credit checks.
            </div>
          </div>

          {/* Primary CTA - Apply */}
          <Link
            href={`/apply?property=${propertySlug}`}
            className="w-full flex items-center justify-center h-12 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-xl shadow-lg shadow-brand/15 hover:shadow-brand/25 transition-all cursor-pointer"
          >
            Apply Free — Decision in 24 Hours
          </Link>

          {/* Secondary CTA - Check Eligibility */}
          <button
            onClick={() => setEligibilityOpen(true)}
            className="w-full flex items-center justify-center gap-2 h-12 border-2 border-brand-dark/90 text-brand-dark hover:bg-brand-dark hover:text-white text-sm font-bold rounded-xl transition-all cursor-pointer bg-white group"
          >
            <TrendingUp size={15} className="text-brand group-hover:text-white transition-colors" />
            Check Eligibility in 30s
          </button>
          
          <p className="text-[10px] text-center text-neutral-400">
            Guideline: Monthly Gross Income ≥ 3x rent (${(propertyPrice * 3).toLocaleString()}/mo)
          </p>
        </div>

        <PropertyEligibilityDrawer
          open={eligibilityOpen}
          onClose={() => setEligibilityOpen(false)}
          propertyId={propertyId}
          propertySlug={propertySlug}
          propertyTitle={propertyTitle}
          propertyPrice={propertyPrice}
          propertyCity={propertyCity}
        />
      </>
    );
  }

  if (mode === "mobile-sticky") {
    return (
      <>
        <div className="flex items-center gap-3 w-full">
          {/* Check Eligibility Button */}
          <button
            onClick={() => setEligibilityOpen(true)}
            className="flex-1 h-11 border border-brand-dark text-brand-dark text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-neutral-50 transition-colors cursor-pointer bg-white"
          >
            <TrendingUp size={13} className="text-brand" />
            Eligibility Check
          </button>

          {/* Apply Button */}
          <Link
            href={`/apply?property=${propertySlug}`}
            className="flex-1 h-11 bg-brand text-white text-xs font-bold rounded-xl flex items-center justify-center hover:bg-brand-hover transition-colors cursor-pointer"
          >
            Apply Free
          </Link>
        </div>

        <PropertyEligibilityDrawer
          open={eligibilityOpen}
          onClose={() => setEligibilityOpen(false)}
          propertyId={propertyId}
          propertySlug={propertySlug}
          propertyTitle={propertyTitle}
          propertyPrice={propertyPrice}
          propertyCity={propertyCity}
        />
      </>
    );
  }

  return null;
}
