"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { getStoredUTMs, getBestKnownCity, trackEvent } from "@/lib/tracking";

const API_BASE =
  typeof window !== "undefined"
    ? ""
    : (process.env.NEXT_PUBLIC_API_URL ?? "https://admin.haskerrealtygroup.com");

export function HomepageLeadForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) { setError("Please enter a valid email."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/v1/leads/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: name.trim(),
          email: email.trim(),
          source: "CONTACT_FORM",
          interest_type: "RENT",
          detected_city: getBestKnownCity() || undefined,
          message: "Submitted via homepage hero form.",
          ...getStoredUTMs(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? data.email?.[0] ?? "Submission failed. Please try again.");
      }
      setDone(true);
      trackEvent("generate_lead", { source: "homepage_hero" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex items-center justify-center gap-3 py-3.5 px-5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
        <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-white/80 text-sm">You&apos;re on the list! We&apos;ll be in touch within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(""); }}
          className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder-white/40 text-sm outline-none focus:border-brand focus:bg-white/15 transition-all min-w-0"
        />
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder-white/40 text-sm outline-none focus:border-brand focus:bg-white/15 transition-all min-w-0"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-brand text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-brand-hover transition-colors flex items-center justify-center gap-2 shrink-0 disabled:opacity-70 cursor-pointer whitespace-nowrap"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>Get Matched <ArrowRight size={14} /></>
          )}
        </button>
      </div>
      {error && (
        <p className="text-red-300 text-[12px] mt-2 flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-red-300 shrink-0" />
          {error}
        </p>
      )}
      <p className="text-white/25 text-[10px] text-center mt-2">No spam. Unsubscribe anytime.</p>
    </form>
  );
}
