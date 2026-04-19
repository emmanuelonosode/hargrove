"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const rentRanges = [
  { value: "",             label: "Any Price" },
  { value: "0-800",       label: "Under $800/mo" },
  { value: "800-1200",    label: "$800 – $1,200/mo" },
  { value: "1200-1800",   label: "$1,200 – $1,800/mo" },
  { value: "1800-2500",   label: "$1,800 – $2,500/mo" },
  { value: "2500",        label: "$2,500+/mo" },
];

const bedroomOptions = [
  { value: "",  label: "Any Beds" },
  { value: "0", label: "Studio" },
  { value: "1", label: "1+ Bed" },
  { value: "2", label: "2+ Beds" },
  { value: "3", label: "3+ Beds" },
  { value: "4", label: "4+ Beds" },
];

const listingTypeOptions = [
  { value: "for-rent", label: "For Rent" },
  { value: "for-sale", label: "For Sale" },
];

interface SearchBarProps {
  className?: string;
  dark?: boolean;
}

export function SearchBar({ className, dark = false }: SearchBarProps) {
  const router = useRouter();
  const [priceRange, setPriceRange]     = useState("");
  const [bedrooms, setBedrooms]         = useState("");
  const [query, setQuery]               = useState("");
  const [listingType, setListingType]   = useState("for-rent");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("listing_type", listingType);
    if (priceRange) {
      const [min, max] = priceRange.split("-");
      if (min) params.set("minPrice", min);
      if (max) params.set("maxPrice", max);
    }
    if (bedrooms) params.set("beds", bedrooms);
    if (query)    params.set("q",    query);
    router.push(`/properties?${params.toString()}`);
  }

  const inputBase = cn(
    "bg-transparent border-0 outline-none text-sm w-full placeholder:text-neutral-400",
    dark ? "text-white" : "text-brand-dark"
  );

  const dividerClass = cn(
    "h-px w-full lg:h-auto lg:w-px lg:self-stretch",
    dark ? "bg-white/10" : "bg-neutral-200"
  );

  const labelClass = cn(
    "text-[10px] font-semibold tracking-widest uppercase",
    dark ? "text-blue-200" : "text-neutral-400"
  );

  return (
    <form
      onSubmit={handleSearch}
      className={cn(
        "flex flex-col rounded-sm overflow-hidden shadow-2xl",
        dark
          ? "bg-white/10 backdrop-blur-md border border-white/20"
          : "bg-white border border-neutral-200",
        className
      )}
    >
      {/* Listing type toggle — top row on all screens */}
      <div className={cn(
        "flex gap-1 px-4 pt-3 pb-0",
        dark ? "border-b border-white/10" : "border-b border-neutral-100"
      )}>
        {listingTypeOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setListingType(opt.value)}
            className={cn(
              "px-4 py-1.5 text-xs font-semibold tracking-wide rounded-sm transition-colors",
              listingType === opt.value
                ? dark
                  ? "bg-white text-brand-dark"
                  : "bg-brand-dark text-white"
                : dark
                  ? "text-white/60 hover:text-white"
                  : "text-neutral-500 hover:text-brand-dark"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center flex-1">
        {/* Location */}
        <div className="flex flex-col px-5 py-4 flex-1 min-w-0">
          <label htmlFor="search-location" className={labelClass}>
            Location
          </label>
          <input
            id="search-location"
            type="text"
            placeholder="City, neighborhood, or ZIP"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={inputBase}
          />
        </div>

        <div className={dividerClass} />

        {/* Monthly Rent */}
        <div className="flex flex-col px-5 py-4 min-w-[175px]">
          <label htmlFor="search-price" className={labelClass}>
            Monthly Rent
          </label>
          <div className="relative">
            <select
              id="search-price"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className={cn(inputBase, "appearance-none pr-5 cursor-pointer")}
            >
              {rentRanges.map((p) => (
                <option key={p.value} value={p.value} className="text-brand-dark">
                  {p.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400"
            />
          </div>
        </div>

        <div className={dividerClass} />

        {/* Bedrooms */}
        <div className="flex flex-col px-5 py-4 min-w-[130px]">
          <label htmlFor="search-beds" className={labelClass}>
            Bedrooms
          </label>
          <div className="relative">
            <select
              id="search-beds"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className={cn(inputBase, "appearance-none pr-5 cursor-pointer")}
            >
              {bedroomOptions.map((b) => (
                <option key={b.value} value={b.value} className="text-brand-dark">
                  {b.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="px-4 py-3 lg:p-3">
        <Button type="submit" variant="accent" size="lg" className="w-full lg:w-auto gap-2">
          <Search size={16} />
          Search
        </Button>
      </div>
    </form>
  );
}
