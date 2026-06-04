"use client";

import { useState, useEffect } from "react";
import { Phone, Check } from "lucide-react";
import {
  getBestKnownCity,
  getStoredUTMs,
  getStoredReferralCode,
  getDeviceContext,
  trackEvent,
} from "@/lib/tracking";

const CAPTURED_KEY = "hasker_lead_captured";

export function HeroCallbackStrip() {
  const [phone,     setPhone]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState("");
  const [hidden,    setHidden]    = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(CAPTURED_KEY) === "true") setHidden(true);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) { setError("Enter your phone number."); return; }
    setLoading(true); setError("");
    try {
      const city = getBestKnownCity();
      const res = await fetch("/api/v1/leads/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name:         "Hero Callback Request",
          phone:             phone.trim(),
          source:            "CONTACT_FORM",
          interest_type:     "RENT",
          preferred_contact: "PHONE",
          detected_city:     city || undefined,
          message:           `Hero strip callback request. Phone: ${phone.trim()}` + getDeviceContext(),
          referral_code:     getStoredReferralCode() || undefined,
          ...getStoredUTMs(),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      sessionStorage.setItem(CAPTURED_KEY, "true");
      trackEvent("generate_lead", { source: "hero_strip", city });
      setDone(true);
    } catch {
      setError("Something went wrong — try again.");
    } finally {
      setLoading(false);
    }
  }

  if (hidden) return null;

  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      <p className="text-white/60 text-xs tracking-wide">
        Or let us call you — a real agent within 1 hour
      </p>
      {!done ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full max-w-sm">
          <div className="relative flex-1">
            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              type="tel"
              placeholder="Your phone number"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setError(""); }}
              className="w-full h-11 bg-white/95 border border-white/20 rounded-xl pl-9 pr-3 text-sm text-brand-dark placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/40 font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="h-11 px-4 bg-white text-brand font-bold text-sm rounded-xl hover:bg-brand-light transition-colors cursor-pointer disabled:opacity-60 shrink-0 flex items-center gap-1.5 shadow-md"
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
              : <><Phone size={13} /> Call Me</>
            }
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5">
          <Check size={15} className="text-emerald-400 shrink-0" />
          <p className="text-white text-sm font-semibold">Expect a call within the hour!</p>
        </div>
      )}
      {error && <p className="text-red-300 text-xs">{error}</p>}
    </div>
  );
}
