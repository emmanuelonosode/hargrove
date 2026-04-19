"use client";

import Link from "next/link";
import Image from "next/image";
import { Bed, Bath, Maximize, MapPin, Heart } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
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

  if (variant === "horizontal") {
    return (
      <Link
        href={`/properties/${property.slug}`}
        className="group flex bg-white border border-neutral-100 rounded-sm overflow-hidden hover:shadow-lg transition-shadow duration-200 active:scale-[0.99]"
      >
        <div className="relative w-36 sm:w-56 shrink-0 overflow-hidden">
          {primaryImage && (
            <Image
              src={primaryImage.url}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="256px"
            />
          )}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <Badge variant={listingBadgeVariant}>{listingLabel}</Badge>
            {property.isFeatured && <Badge variant="featured">Featured</Badge>}
          </div>
        </div>
        <div className="flex flex-col justify-between p-5 flex-1">
          <div>
            <p className="text-brand text-xs font-medium tracking-wide uppercase mb-1">
              {property.neighborhood ?? property.city}
            </p>
            <h3 className="font-sans text-lg text-brand-dark font-semibold leading-snug line-clamp-2 group-hover:text-brand transition-colors">
              {property.title}
            </h3>
            <div className="flex items-center gap-1 mt-2 text-neutral-500 text-xs">
              <MapPin size={12} />
              <span>
                {property.address}, {property.city}, {property.state}
              </span>
            </div>
          </div>
          <div>
            <div className="flex gap-4 text-sm text-neutral-600 mt-4 mb-3">
              <span className="flex items-center gap-1">
                <Bed size={14} /> {property.bedrooms} bd
              </span>
              <span className="flex items-center gap-1">
                <Bath size={14} /> {property.bathrooms} ba
              </span>
              <span className="flex items-center gap-1">
                <Maximize size={14} /> {formatNumber(property.sqft)} sqft
              </span>
            </div>
            <p className="font-sans text-xl font-bold text-brand-dark">
              {property.listingType === "for-rent"
                ? formatPrice(property.price, { perMonth: true })
                : formatPrice(property.price, { compact: true })}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group flex flex-col bg-white border border-neutral-100 rounded-sm overflow-hidden hover:shadow-xl transition-shadow duration-200 active:scale-[0.99]"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
            <span className="text-neutral-400 text-sm">No image</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Badge variant={listingBadgeVariant}>{listingLabel}</Badge>
          {property.isFeatured && <Badge variant="featured">Featured</Badge>}
          {property.status === "under-contract" && (
            <Badge variant="under-contract">Under Contract</Badge>
          )}
        </div>

        {/* Wishlist */}
        <button
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-neutral-400 hover:text-red-500 transition-colors"
          onClick={(e) => e.preventDefault()}
          aria-label="Save property"
        >
          <Heart size={15} />
        </button>

        {/* Image count */}
        {property.images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-sm">
            1 / {property.images.length}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col p-5 flex-1">
        <p className="text-brand text-xs font-semibold tracking-widest uppercase mb-1.5">
          {property.neighborhood ?? `${property.city}, ${property.state}`}
        </p>
        <h3 className="font-sans text-lg font-semibold text-brand-dark leading-snug line-clamp-2 group-hover:text-brand transition-colors mb-2">
          {property.title}
        </h3>
        <div className="flex items-center gap-1 text-neutral-500 text-xs mb-4">
          <MapPin size={11} />
          <span className="truncate">
            {property.address}, {property.state} {property.zip}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-neutral-600 pb-4 border-b border-neutral-100">
          <span className="flex items-center gap-1.5">
            <Bed size={14} className="text-neutral-400" />
            {property.bedrooms}
          </span>
          <span className="flex items-center gap-1.5">
            <Bath size={14} className="text-neutral-400" />
            {property.bathrooms}
          </span>
          <span className="flex items-center gap-1.5">
            <Maximize size={14} className="text-neutral-400" />
            {formatNumber(property.sqft)} sqft
          </span>
        </div>

        <div className="flex items-end justify-between mt-4">
          <p className="font-sans text-2xl font-bold text-brand-dark">
            {property.listingType === "for-rent"
              ? formatPrice(property.price, { perMonth: true })
              : formatPrice(property.price, { compact: true })}
          </p>
          <span className="text-xs text-neutral-400">
            {property.yearBuilt && `Est. ${property.yearBuilt}`}
          </span>
        </div>
      </div>
    </Link>
  );
}
