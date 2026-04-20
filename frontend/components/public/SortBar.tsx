"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

interface SortOption {
  value: string;
  label: string;
}

interface SortBarProps {
  options: SortOption[];
  current: string;
}

export function SortBar({ options, current }: SortBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 text-sm text-neutral-600">
      <ArrowUpDown size={13} className="shrink-0 text-neutral-400" />
      <select
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        className="bg-transparent border-0 text-sm text-neutral-700 font-medium cursor-pointer outline-none"
        aria-label="Sort properties"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
