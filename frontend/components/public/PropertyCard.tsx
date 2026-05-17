"use client";

import Link from "next/link";
import Image from "next/image";
import { Bed, Bath, Maximize, MapPin, Home } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { FavoriteButton } from "@/components/public/FavoriteButton";
import { formatPrice, formatNumber } from "@/lib/utils";
import type { Property } from "@/types";

interface PropertyCardProps {
  property: Property;
  variant?: "default" | "compact" | "horizontal";
}


export function PropertyCard({ property, variant = "default" }: PropertyCardProps) {
  const primaryImage = property.images.find((i) => i.isPrimary) ?? property.images[0];

  const listingBadgeVariant =
    property.listingType === "for-sale"
      ? "sale"
      : property.listingType === "for-rent"
      ? "rent"
      : "accent";

  const listingLabel =
    property.listingType === "for-sale"
      ? "For Sale"
      : property.listingType === "for-rent"
      ? "For Rent"
      : "For Lease";

  const isRental = property.listingType === "for-rent" || property.listingType === "for-lease";

  const detailHref = `/homes-for-rent/${property.slug}`;
  const applyHref  = `/apply?property=${property.slug}`;

  // ─── Horizontal variant ────────────────────────────────────────────
  if (variant === "horizontal") {
    return (
      <article className="group flex bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-neutral-300 transition-all duration-200">
        {/* Image */}
        <div className="relative w-36 sm:w-52 shrink-0 overflow-hidden bg-neutral-100">
          <Link href={detailHref} className="absolute inset-0 z-0 block" tabIndex={-1} aria-hidden="true" />
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="208px"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Home size={24} className="text-neutral-300" />
            </div>
          )}
          <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none flex gap-1.5">
            <Badge variant={listingBadgeVariant}>{listingLabel}</Badge>
          </div>
        </div>

        {/* Body */}
        <Link href={detailHref} className="flex flex-col justify-between p-4 flex-1 min-w-0">
          <div className="min-w-0">
            <p className="font-bold text-[1.2rem] text-neutral-900 leading-none mb-2">
              {isRental
                ? formatPrice(property.price, { perMonth: true })
                : formatPrice(property.price, { compact: true })}
            </p>
            <div className="flex items-center gap-1 text-[12px] text-neutral-500 mb-2">
              <span className="font-medium text-neutral-700">{property.bedrooms}</span> bd
              <span className="text-neutral-300 mx-1">·</span>
              <span className="font-medium text-neutral-700">{property.bathrooms}</span> ba
              <span className="text-neutral-300 mx-1">·</span>
              <span className="font-medium text-neutral-700">{formatNumber(property.sqft)}</span> sqft
            </div>
            <p className="text-[12px] text-neutral-500 truncate">
              {property.address}, {property.city}, {property.state}
            </p>
          </div>
        </Link>
      </article>
    );
  }

  // ─── Default / compact variant ─────────────────────────────────────
  return (
    <article className="group flex flex-col bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-neutral-300 transition-all duration-200">

      {/* Image — linked to property detail */}
      <div className="relative aspect-[3/2] overflow-hidden bg-neutral-100">
        {/* The image link sits at z-0 so z-10 elements (buttons) stay above it */}
        <Link href={detailHref} className="absolute inset-0 z-0 block" aria-label={`View ${property.title}`}>
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
              <Home size={36} className="text-neutral-300" />
            </div>
          )}
        </Link>

        {/* Badges — non-interactive, pointer-events-none */}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 pointer-events-none">
          <Badge variant={listingBadgeVariant}>{listingLabel}</Badge>
          {property.isFeatured && <Badge variant="featured">Featured</Badge>}
          {property.status === "under-contract" && (
            <Badge variant="under-contract">Under Contract</Badge>
          )}
        </div>

        {/* Favorite — z-10, fully interactive, independent of card link */}
        <div className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/95 shadow-sm flex items-center justify-center">
          <FavoriteButton propertyId={Number(property.id)} size={16} className="min-w-0 min-h-0" />
        </div>

        {/* Image count */}
        {property.images.length > 1 && (
          <div className="absolute bottom-3 right-3 z-10 pointer-events-none bg-black/55 text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
            1 / {property.images.length}
          </div>
        )}
      </div>

      {/* Info — linked to property detail */}
      <Link href={detailHref} className="flex flex-col p-4 flex-1 min-w-0">

        {/* Price — most important, shown first */}
        <p className="font-bold text-[1.35rem] leading-none text-neutral-900">
          {isRental
            ? formatPrice(property.price, { perMonth: true })
            : formatPrice(property.price, { compact: true })}
          {isRental && (
            <span className="text-[0.8rem] font-normal text-neutral-400 ml-1">/mo</span>
          )}
        </p>

        {/* Specs */}
        <div className="flex items-center gap-0.5 text-[13px] text-neutral-500 mt-2">
          <span className="font-semibold text-neutral-700">{property.bedrooms}</span>
          <span className="mr-1"> bd</span>
          <span className="text-neutral-300 mx-1">·</span>
          <span className="font-semibold text-neutral-700">{property.bathrooms}</span>
          <span className="mr-1"> ba</span>
          <span className="text-neutral-300 mx-1">·</span>
          <span className="font-semibold text-neutral-700">{formatNumber(property.sqft)}</span>
          <span> sqft</span>
        </div>

        {/* Address */}
        <p className="text-[13px] text-neutral-500 truncate mt-2">
          {property.address}
        </p>
        <p className="text-[12px] text-neutral-400 truncate mt-0.5">
          {property.neighborhood
            ? `${property.neighborhood} · ${property.city}, ${property.state}`
            : `${property.city}, ${property.state} ${property.zip}`}
        </p>

        {/* Urgency signal */}
        {isRental && (
          <p className="flex items-center gap-1.5 text-[11px] text-amber-600 font-medium mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            Typically rents within 5–7 days
          </p>
        )}
      </Link>

      {/* Apply CTA — completely outside the card link, always independently clickable */}
      {isRental && (
        <div className="px-4 pb-4">
          <Link
            href={applyHref}
            className="flex items-center justify-center w-full py-3 bg-brand hover:bg-brand-hover text-white text-[13px] font-bold rounded-xl transition-colors duration-150"
          >
            Apply Now — It&apos;s Free
          </Link>
        </div>
      )}
    </article>
  );
}
