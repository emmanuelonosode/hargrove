"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";

const LOCATION_SUGGESTIONS = [
  { city: "Atlanta",      state: "GA" },
  { city: "Charlotte",    state: "NC" },
  { city: "Houston",      state: "TX" },
  { city: "Dallas",       state: "TX" },
  { city: "Nashville",    state: "TN" },
  { city: "Phoenix",      state: "AZ" },
  { city: "Austin",       state: "TX" },
  { city: "Miami",        state: "FL" },
  { city: "Denver",       state: "CO" },
  { city: "Seattle",      state: "WA" },
  { city: "Las Vegas",    state: "NV" },
  { city: "Tampa",        state: "FL" },
  { city: "Orlando",      state: "FL" },
  { city: "Raleigh",      state: "NC" },
  { city: "San Antonio",  state: "TX" },
  { city: "Jacksonville", state: "FL" },
  { city: "Winder",       state: "GA" },
];

export function HeroSearch() {
  const router = useRouter();
  const [listingType, setListingType] = useState<"for-rent" | "for-sale">("for-rent");
  const [location, setLocation]       = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex]   = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  const suggestions = location.trim().length === 0
    ? LOCATION_SUGGESTIONS.slice(0, 8)
    : LOCATION_SUGGESTIONS.filter((s) =>
        s.city.toLowerCase().startsWith(location.trim().toLowerCase()) ||
        s.state.toLowerCase().startsWith(location.trim().toLowerCase()) ||
        `${s.city}, ${s.state}`.toLowerCase().includes(location.trim().toLowerCase())
      ).slice(0, 6);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function selectSuggestion(s: (typeof LOCATION_SUGGESTIONS)[number]) {
    setLocation(`${s.city}, ${s.state}`);
    setDropdownOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!dropdownOpen || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setDropdownOpen(false);
      setActiveIndex(-1);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setDropdownOpen(false);
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
        <div ref={wrapperRef} className="relative flex-1">
          <MapPin
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none z-10"
          />
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter city, neighborhood, or ZIP code"
            value={location}
            autoComplete="off"
            onFocus={() => setDropdownOpen(true)}
            onChange={(e) => {
              setLocation(e.target.value);
              setDropdownOpen(true);
              setActiveIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            className="w-full pl-11 pr-10 py-4 rounded-xl border border-neutral-200 bg-neutral-50
                       text-[15px] text-brand-dark placeholder-neutral-400 outline-none
                       focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 transition-all"
          />
          {location && (
            <button
              type="button"
              onClick={() => { setLocation(""); setDropdownOpen(false); inputRef.current?.focus(); }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors z-10"
              aria-label="Clear"
            >
              <X size={15} />
            </button>
          )}

          {/* Autocomplete dropdown */}
          {dropdownOpen && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-neutral-200 shadow-2xl z-50 overflow-hidden">
              {location.trim().length === 0 && (
                <div className="px-4 py-2.5 border-b border-neutral-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    Popular cities
                  </p>
                </div>
              )}
              <ul role="listbox">
                {suggestions.map((s, i) => (
                  <li
                    key={`${s.city}-${s.state}`}
                    role="option"
                    aria-selected={i === activeIndex}
                    onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s); }}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
                      i === activeIndex ? "bg-brand/5" : "hover:bg-neutral-50"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      i === activeIndex ? "bg-brand/10" : "bg-neutral-100"
                    )}>
                      <MapPin size={13} className={i === activeIndex ? "text-brand" : "text-neutral-400"} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn(
                        "text-[14px] font-semibold leading-tight",
                        i === activeIndex ? "text-brand" : "text-brand-dark"
                      )}>
                        {s.city}
                      </p>
                      <p className="text-[11px] text-neutral-400">{s.state}</p>
                    </div>
                    {i === activeIndex && (
                      <span className="text-[11px] text-brand font-bold shrink-0">Select</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
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
