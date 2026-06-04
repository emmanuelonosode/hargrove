"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle, DollarSign, Mail, User } from "lucide-react";
import { getStoredUTMs } from "@/lib/tracking";

const API_BASE = typeof window !== "undefined"
  ? ""
  : (process.env.NEXT_PUBLIC_API_URL ?? "https://admin.haskerrealtygroup.com");

const INCOME_OPTIONS = [
  { label: "Under $2,000 / mo",       value: "under-2000",   maxPrice: "800"  },
  { label: "$2,000 – $3,000 / mo",    value: "2000-3000",    maxPrice: "1200" },
  { label: "$3,000 – $4,500 / mo",    value: "3000-4500",    maxPrice: "1800" },
  { label: "$4,500 – $6,000 / mo",    value: "4500-6000",    maxPrice: "2500" },
  { label: "$6,000+ / mo",            value: "6000-plus",    maxPrice: "3500" },
];

export function PreQualifyBanner() {
  const router = useRouter();
  const [name, setName]     = useState("");
  const [email, setEmail]   = useState("");
  const [income, setIncome] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [done, setDone]     = useState(false);
  const [maxPrice, setMaxPrice] = useState("1800");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim())  { setError("Please enter your name."); return; }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) { setError("Please enter a valid email."); return; }
    if (!income)       { setError("Please select your monthly income."); return; }

    const selected = INCOME_OPTIONS.find((o) => o.value === income);
    if (selected) setMaxPrice(selected.maxPrice);

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
          message: `Pre-qualify form: monthly income ${income}.`,
          ...getStoredUTMs(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? data.email?.[0] ?? "Submission failed.");
      }
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    const selected = INCOME_OPTIONS.find((o) => o.value === income);
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={26} className="text-emerald-600" />
        </div>
        <h3 className="font-bold text-brand-dark text-xl mb-1">
          Great news, {name.split(" ")[0]}!
        </h3>
        <p className="text-neutral-500 text-sm mb-5 max-w-xs mx-auto">
          Based on your income, we have homes that fit your budget. Browse them now.
        </p>
        <button
          onClick={() => router.push(`/houses-for-rent?listing_type=for-rent&maxPrice=${selected?.maxPrice ?? maxPrice}`)}
          className="inline-flex items-center gap-2 bg-brand text-white font-bold px-7 py-3 rounded-xl hover:bg-brand-hover transition-colors cursor-pointer"
        >
          View Matching Homes <ArrowRight size={15} />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Name */}
        <div className="relative flex-1">
          <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            className="w-full pl-9 pr-4 py-3.5 rounded-xl border border-neutral-200 bg-neutral-50 text-[14px] text-brand-dark placeholder-neutral-400 outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 transition-all"
          />
        </div>

        {/* Email */}
        <div className="relative flex-1">
          <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            className="w-full pl-9 pr-4 py-3.5 rounded-xl border border-neutral-200 bg-neutral-50 text-[14px] text-brand-dark placeholder-neutral-400 outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 transition-all"
          />
        </div>

        {/* Income */}
        <div className="relative flex-1">
          <DollarSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none z-10" />
          <select
            value={income}
            onChange={(e) => { setIncome(e.target.value); setError(""); }}
            className="w-full appearance-none pl-9 pr-8 py-3.5 rounded-xl border border-neutral-200 bg-neutral-50 text-[14px] text-brand-dark outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 transition-all cursor-pointer"
          >
            <option value="">Monthly income</option>
            {INCOME_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 flex items-center justify-center gap-2 px-7 py-3.5 bg-brand text-white font-bold text-[14px] rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-70 cursor-pointer whitespace-nowrap"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>See Matching Homes <ArrowRight size={15} /></>
          )}
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-[13px] mt-2.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
          {error}
        </p>
      )}
      <p className="text-neutral-400 text-[11px] mt-3">
        No credit check. No commitment. Just matching you with homes in your budget.
      </p>
    </form>
  );
}
