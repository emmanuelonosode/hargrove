"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, User, CheckCircle, ArrowRight } from "lucide-react";
import { getStoredUTMs, getBestKnownCity, captureSearchIntent, trackEvent } from "@/lib/tracking";

interface Props {
  cityName: string;
}

const API_BASE = typeof window !== "undefined"
  ? ""
  : (process.env.NEXT_PUBLIC_API_URL ?? "https://admin.haskerrealtygroup.com");

export function CityLeadCapture({ cityName }: Props) {
  useEffect(() => { captureSearchIntent(cityName); }, [cityName]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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
      const [firstName, ...rest] = name.trim().split(" ");
      const res = await fetch(`${API_BASE}/api/v1/leads/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: rest.join(" ") || firstName,
          email: email.trim(),
          phone: phone.trim() || undefined,
          source: "city_landing",
          message: `Interested in rentals in ${cityName}. Submitted via city landing page lead capture.`,
          detected_city: cityName || getBestKnownCity() || undefined,
          ...getStoredUTMs(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? data.email?.[0] ?? "Submission failed. Please try again.");
      }
      setDone(true);
      trackEvent("generate_lead", { city: cityName });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={30} className="text-brand" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-white mb-2">You&apos;re on the list!</h3>
        <p className="text-blue-200 text-sm leading-relaxed">
          We&apos;ll be in touch within 24 hours with available listings in {cityName}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          <input
            type="text"
            placeholder="Your full name *"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-white/40 text-sm outline-none focus:border-brand focus:bg-white/15 transition-all"
          />
        </div>
        <div className="relative">
          <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          <input
            type="email"
            placeholder="Email address *"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-white/40 text-sm outline-none focus:border-brand focus:bg-white/15 transition-all"
          />
        </div>
      </div>
      <div className="relative">
        <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
        <input
          type="tel"
          placeholder="Phone number (optional — for faster follow-up)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-white/40 text-sm outline-none focus:border-brand focus:bg-white/15 transition-all"
        />
      </div>
      {error && (
        <p className="text-red-300 text-[13px] flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-red-300 shrink-0" />
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand text-white font-semibold py-4 rounded-xl hover:bg-brand-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            Get {cityName} Listings in My Inbox
            <ArrowRight size={15} />
          </>
        )}
      </button>
      <p className="text-white/30 text-[11px] text-center">No spam. We respect your privacy. Unsubscribe anytime.</p>
    </form>
  );
}
