"use client";

import { useEffect } from "react";
import { trackEvent, trackMetaCustom } from "@/lib/tracking";

interface Props {
  slug: string;
  price: number;
  listingType: string;
}

export function PropertyPageTracker({ slug, price, listingType }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      trackEvent("deep_property_view", { property_slug: slug, value: price, currency: "USD", listing_type: listingType });
      trackMetaCustom("DeepPropertyView", { content_ids: [slug], value: price, currency: "USD" });
    }, 60_000);
    return () => clearTimeout(timer);
  }, [slug, price, listingType]);

  return null;
}
