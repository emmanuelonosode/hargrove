"use client";

import { useEffect } from "react";
import { captureSearchIntent } from "@/lib/tracking";

interface Props {
  city: string;
  listingType: string;
}

/** Invisible component — records browse intent when a property detail page loads. */
export function PropertyIntentCapture({ city, listingType }: Props) {
  useEffect(() => {
    if (city) captureSearchIntent(city, listingType);
  }, [city, listingType]);
  return null;
}
