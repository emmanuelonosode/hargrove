"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Home, DollarSign, BedDouble, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Options ───────────────────────────────────────────────────────────────────

const budgetOptions = [
  { value: "",          label: "Any Budget" },
  { value: "0-800",     label: "Under $800 / mo" },
  { value: "800-1200",  label: "$800 – $1,200 / mo" },
  { value: "1200-1800", label: "$1,200 – $1,800 / mo" },
  { value: "1800-2500", label: "$1,800 – $2,500 / mo" },
  { value: "2500-3500", label: "$2,500 – $3,500 / mo" },
  { value: "3500",      label: "$3,500+ / mo" },
];

const bedroomOptions = [
  { value: "",  label: "Any Bedrooms" },
  { value: "0", label: "Studio" },
  { value: "1", label: "1+ Bedroom" },
  { value: "2", label: "2+ Bedrooms" },
  { value: "3", label: "3+ Bedrooms" },
  { value: "4", label: "4+ Bedrooms" },
];

const propertyTypeOptions = [
  { value: "",            label: "Any Type" },
  { value: "residential", label: "House" },
  { value: "apartment",   label: "Apartment" },
  { value: "condo",       label: "Condo" },
  { value: "townhouse",   label: "Townhouse" },
];

// ── Chevron icon ──────────────────────────────────────────────────────────────

function ChevronDown() {
  return (
    <svg className="w-4 h-4 text-neutral-400 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

// ── Select field ──────────────────────────────────────────────────────────────

function FilterField({
  icon: Icon,
  value,
  onChange,
  options,
}: {
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative flex-1 min-w-[140px]">
      <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none z-10" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none pl-9 pr-8 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-[14px] text-brand-dark outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 transition-all cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronDown />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface SearchBarProps {
  className?: string;
}

export function SearchBar({ className }: SearchBarProps) {
  const router = useRouter();

  const [listingType, setListingType]     = useState<"for-rent" | "for-sale">("for-rent");
  const [location, setLocation]           = useState("");
  const [propertyType, setPropertyType]   = useState("");
  const [budget, setBudget]               = useState("");
  const [bedrooms, setBedrooms]           = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("listing_type", listingType);
    if (location.trim()) params.set("q", location.trim());
    if (propertyType)    params.set("type", propertyType);
    if (budget) {
      const [min, max] = budget.split("-");
      if (min) params.set("minPrice", min);
      if (max) params.set("maxPrice", max);
    }
    if (bedrooms) params.set("beds", bedrooms);
    router.push(`/houses-for-rent?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSearch} className={cn("flex flex-col gap-3", className)}>

      {/* ── Listing type toggle ── */}
      <div className="flex gap-2">
        {(["for-rent", "for-sale"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setListingType(type)}
            className={cn(
              "flex-1 sm:flex-none px-5 py-2 rounded-xl text-sm font-semibold transition-all border",
              listingType === type
                ? "bg-brand text-white border-brand shadow-sm"
                : "bg-white text-neutral-600 border-neutral-200 hover:border-brand/40 hover:text-brand"
            )}
          >
            {type === "for-rent" ? "For Rent" : "For Sale"}
          </button>
        ))}
      </div>

      {/* ── Search fields + submit ── */}
      <div className="flex flex-col sm:flex-row gap-2">

        {/* Location input */}
        <div className="relative flex-[2] min-w-0">
          <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none z-10" />
          <input
            type="text"
            placeholder="City, neighborhood, or ZIP code"
            value={location}
            autoComplete="off"
            onChange={(e) => setLocation(e.target.value)}
            className="w-full pl-9 pr-9 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-[14px] text-brand-dark placeholder-neutral-400 outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 transition-all"
          />
          {location && (
            <button
              type="button"
              onClick={() => setLocation("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors z-10"
              aria-label="Clear location"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Property type */}
        <FilterField
          icon={Home}
          value={propertyType}
          onChange={setPropertyType}
          options={propertyTypeOptions}
        />

        {/* Budget */}
        <FilterField
          icon={DollarSign}
          value={budget}
          onChange={setBudget}
          options={budgetOptions}
        />

        {/* Bedrooms */}
        <FilterField
          icon={BedDouble}
          value={bedrooms}
          onChange={setBedrooms}
          options={bedroomOptions}
        />

        {/* Search button */}
        <button
          type="submit"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-brand text-white font-semibold text-[14px] rounded-xl hover:bg-brand-hover transition-colors shrink-0 cursor-pointer"
        >
          <Search size={16} />
          <span>Search</span>
        </button>
      </div>

    </form>
  );
}
