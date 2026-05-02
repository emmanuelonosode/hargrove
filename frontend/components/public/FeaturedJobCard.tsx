"use client";

import { useState } from "react";
import { MapPin, Clock, Wifi, Zap, ChevronRight, Users } from "lucide-react";
import { QuickApplyDrawer } from "./QuickApplyDrawer";

const ROLE_ID = "remote-listing-specialist";
const ROLE_TITLE = "Remote Listing & Client Communication Specialist";

const highlights = [
  "Manage premium listings across 12+ markets",
  "Own all client & tenant communications",
  "High-autonomy — no micromanagement",
  "Home office stipend + full benefits",
];

export function FeaturedJobCard() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <div className="relative overflow-hidden rounded-sm border border-white/[0.07] shadow-2xl bg-[#0D1017]">
        {/* Subtle dot-grid texture */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Soft brand glow — top-right */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-brand/10 blur-3xl pointer-events-none"
        />
        {/* Soft emerald glow — bottom-left */}
        <div
          aria-hidden="true"
          className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"
        />

        <div className="relative z-10 p-7 lg:p-10">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold tracking-[0.25em] uppercase px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Actively Hiring
            </span>
            <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-brand border border-brand/25 bg-brand/5 px-3 py-1 rounded-full">
              Priority Role
            </span>
            <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-white/25 border border-white/10 px-3 py-1 rounded-full">
              Client Services
            </span>
          </div>

          <div className="lg:flex lg:items-start lg:gap-12">
            {/* Left: copy */}
            <div className="flex-1 min-w-0">
              <h3 className="font-serif text-2xl lg:text-[1.75rem] font-bold text-white leading-tight mb-4 max-w-2xl">
                {ROLE_TITLE}
              </h3>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-white/30 mb-5">
                <span className="flex items-center gap-1.5">
                  <MapPin size={11} className="text-brand shrink-0" />
                  Remote — US (all time zones)
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={11} className="text-brand shrink-0" />
                  Full-Time
                </span>
                <span className="flex items-center gap-1.5">
                  <Wifi size={11} className="text-brand shrink-0" />
                  Fully Remote
                </span>
              </div>

              <p className="text-sm text-white/45 leading-relaxed mb-7 max-w-xl">
                You&apos;ll own the listings and the inbox — managing premium property listings across
                12+ markets, handling every client and tenant communication, and keeping our remote
                operations running without missing a beat. High autonomy. Real impact.
              </p>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 mb-8 lg:mb-0">
                {highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5 text-sm text-white/50">
                    <span className="w-1 h-1 rounded-full bg-brand/60 shrink-0 mt-[7px]" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: CTA glass card */}
            <div className="shrink-0 lg:w-52 mt-8 lg:mt-0">
              <div className="bg-white/[0.04] border border-white/[0.09] rounded-sm p-5 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Users size={12} className="text-brand shrink-0" />
                  <p className="text-[10px] text-white/30 font-semibold tracking-wide">
                    Start date: Immediate
                  </p>
                </div>
                <p className="text-[11px] text-white/22 leading-relaxed mb-5">
                  Applications reviewed within 48 hours. We move fast.
                </p>

                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="w-full flex items-center justify-center gap-2 bg-brand text-white text-sm font-bold px-5 py-3 rounded-sm hover:bg-brand/90 active:scale-[0.98] transition-all duration-150 mb-3"
                >
                  <Zap size={13} />
                  Quick Apply
                </button>

                <a
                  href="#open-roles"
                  className="w-full flex items-center justify-center gap-1 text-[11px] text-white/30 hover:text-white/55 transition-colors py-1.5"
                >
                  View full details
                  <ChevronRight size={11} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient rule */}
        <div className="h-px bg-gradient-to-r from-transparent via-brand/35 to-transparent" />
      </div>

      <QuickApplyDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        roleId={ROLE_ID}
        roleTitle={ROLE_TITLE}
      />
    </>
  );
}
