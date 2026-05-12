"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeroSearch() {
  const router = useRouter();
  const [listingType, setListingType] = useState<"for-rent" | "for-sale">("for-rent");
  const [location, setLocation]       = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("listing_type", listingType);
    if (location.trim()) params.set("q", location.trim());
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-visible">
      {/* Listing type tabs */}
      <div className="flex border-b border-neutral-100">
        {(["for-rent", "for-sale"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setListingType(type)}
            className={cn(
              "flex-1 py-3.5 text-[13px] font-bold transition-all",
              listingType === type
                ? "text-brand border-b-2 border-brand -mb-px"
                : "text-neutral-400 hover:text-neutral-600"
            )}
          >
            {type === "for-rent" ? "For Rent" : "For Sale"}
          </button>
        ))}
      </div>

      {/* Search row */}
      <form onSubmit={handleSearch} className="flex gap-0 p-3">
        <div className="relative flex-1">
          <MapPin
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none z-10"
          />
          <input
            type="text"
            placeholder="Enter city, neighborhood, or ZIP code"
            value={location}
            autoComplete="off"
            onChange={(e) => setLocation(e.target.value)}
            className="w-full pl-11 pr-10 py-4 rounded-xl border border-neutral-200 bg-neutral-50
                       text-[15px] text-brand-dark placeholder-neutral-400 outline-none
                       focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 transition-all"
          />
          {location && (
            <button
              type="button"
              onClick={() => setLocation("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors z-10"
              aria-label="Clear"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <button
          type="submit"
          className="ml-3 flex items-center gap-2 px-8 py-4 bg-brand text-white font-bold text-[15px] rounded-xl hover:bg-brand-hover transition-colors shrink-0 cursor-pointer"
        >
          <Search size={18} />
          <span>Search</span>
        </button>
      </form>
    </div>
  );
}
