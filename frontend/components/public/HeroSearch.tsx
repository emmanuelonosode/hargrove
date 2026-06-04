"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { looksNaturalLanguage, parseSmartQuery } from "@/lib/properties";

export function HeroSearch() {
  const router = useRouter();
  const [listingType, setListingType] = useState<"for-rent" | "for-sale">("for-rent");
  const [location, setLocation] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = location.trim();

    // Smart path: parse natural-language queries into structured filters.
    if (term && looksNaturalLanguage(term)) {
      setAiLoading(true);
      const smart = await parseSmartQuery(term);
      setAiLoading(false);
      if (smart) {
        if (!smart.listing_type) smart.listing_type = listingType;
        const p = new URLSearchParams();
        Object.entries(smart).forEach(([k, v]) => { if (v) p.set(k, v); });
        router.push(`/houses-for-rent?${p.toString()}`);
        return;
      }
    }

    const params = new URLSearchParams();
    params.set("listing_type", listingType);
    if (term) params.set("q", term);
    router.push(`/houses-for-rent?${params.toString()}`);
  }

  return (
    <div className="w-full">

      {/* Type toggle — floats above the bar, feels part of the hero */}
      <div className="flex items-center gap-2 mb-3">
        {(["for-rent", "for-sale"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setListingType(type)}
            className={`px-5 py-2 rounded-full text-[13px] font-semibold transition-all duration-150 cursor-pointer ${
              listingType === type
                ? "bg-white text-brand shadow-md"
                : "bg-white/15 text-white/80 hover:bg-white/25 backdrop-blur-sm"
            }`}
          >
            {type === "for-rent" ? "For Rent" : "For Sale"}
          </button>
        ))}
      </div>

      {/* Single unified search bar */}
      <form
        onSubmit={handleSearch}
        className="flex items-center bg-white rounded-2xl shadow-[0_8px_48px_rgba(0,0,0,0.22)] overflow-hidden h-[60px] sm:h-[64px]"
      >
        <Search size={18} className="ml-5 text-neutral-400 shrink-0" />

        <input
          type="text"
          placeholder="Try: pet-friendly 3 bed in Atlanta under $2,000"
          value={location}
          autoComplete="off"
          onChange={(e) => setLocation(e.target.value)}
          className="flex-1 px-3 text-[15px] sm:text-[16px] text-neutral-800 placeholder-neutral-400 outline-none bg-transparent min-w-0"
        />

        {location && (
          <button
            type="button"
            onClick={() => setLocation("")}
            aria-label="Clear"
            className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors shrink-0 cursor-pointer"
          >
            <X size={15} />
          </button>
        )}

        <button
          type="submit"
          disabled={aiLoading}
          className="m-2 px-6 sm:px-8 h-[44px] sm:h-[48px] bg-brand hover:bg-brand-hover text-white font-bold text-[14px] rounded-xl transition-colors duration-150 shrink-0 cursor-pointer whitespace-nowrap disabled:opacity-70 flex items-center gap-2"
        >
          {aiLoading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {aiLoading ? "Thinking…" : "Search"}
        </button>
      </form>
    </div>
  );
}
