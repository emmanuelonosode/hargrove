"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Grid3x3 } from "lucide-react";

interface Img {
  id: string | number;
  image_url: string | null;
  caption?: string | null;
}

interface Props {
  images: Img[];
  title: string;
  fallback: string;
}

const FALLBACK = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80";

export function PropertyImageGallery({ images, title, fallback }: Props) {
  const allImages = images.length > 0 ? images : [{ id: "fb", image_url: fallback || FALLBACK }];
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Lightbox helpers ---
  const openLightbox = useCallback((i: number) => setLightboxIdx(i), []);
  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const prev = useCallback(() =>
    setLightboxIdx((i) => (i !== null ? (i - 1 + allImages.length) % allImages.length : 0)), [allImages.length]);
  const next = useCallback(() =>
    setLightboxIdx((i) => (i !== null ? (i + 1) % allImages.length : 0)), [allImages.length]);

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIdx, prev, next, closeLightbox]);

  // Mobile carousel scroll tracker
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const idx = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
    setCurrentSlide(idx);
  }, []);

  const scrollToSlide = useCallback((idx: number) => {
    scrollRef.current?.scrollTo({ left: idx * scrollRef.current.clientWidth, behavior: "smooth" });
  }, []);

  const primary = allImages[0];
  const gallery = allImages.slice(0, 5);

  return (
    <>
      {/* ── DESKTOP: mosaic grid ── */}
      <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-1.5 h-[520px]">
        <div
          className="col-span-2 row-span-2 relative overflow-hidden cursor-zoom-in group"
          onClick={() => openLightbox(0)}
        >
          <Image
            src={primary.image_url ?? fallback}
            alt={primary.caption ?? title}
            fill className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority sizes="50vw" unoptimized
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>
        {gallery.slice(1, 5).map((img, i) => (
          <div
            key={img.id}
            className="relative overflow-hidden bg-neutral-100 cursor-zoom-in group"
            onClick={() => openLightbox(i + 1)}
          >
            <Image
              src={img.image_url ?? fallback}
              alt={img.caption ?? `${title} photo ${i + 2}`}
              fill className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="25vw" unoptimized
            />
            {i === 3 && allImages.length > 5 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 text-white font-semibold text-sm">
                <Grid3x3 size={16} /> +{allImages.length - 5} more
              </div>
            )}
          </div>
        ))}
      </div>

      {/* View all photos button — desktop only */}
      {allImages.length > 1 && (
        <button
          onClick={() => openLightbox(0)}
          className="hidden md:flex absolute bottom-4 left-4 items-center gap-1.5 bg-white/95 backdrop-blur-sm text-brand-dark text-xs font-semibold px-3 py-2 rounded-lg shadow-lg hover:bg-white transition-colors z-10"
        >
          <Grid3x3 size={13} /> View all {allImages.length} photos
        </button>
      )}

      {/* ── MOBILE: scroll-snap carousel ── */}
      <div className="md:hidden relative bg-black">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        >
          {allImages.map((img, i) => (
            <div
              key={img.id}
              className="relative w-screen shrink-0 snap-center"
              style={{ aspectRatio: "4/3" }}
              onClick={() => openLightbox(i)}
            >
              <Image
                src={img.image_url ?? fallback}
                alt={img.caption ?? title}
                fill className="object-cover"
                priority={i === 0}
                sizes="100vw" unoptimized
              />
            </div>
          ))}
        </div>

        {/* Prev arrow */}
        {allImages.length > 1 && currentSlide > 0 && (
          <button
            onClick={() => scrollToSlide(currentSlide - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/50 hover:bg-black/75 rounded-full flex items-center justify-center text-white transition-colors z-10"
            aria-label="Previous photo"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* Next arrow */}
        {allImages.length > 1 && currentSlide < allImages.length - 1 && (
          <button
            onClick={() => scrollToSlide(currentSlide + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/50 hover:bg-black/75 rounded-full flex items-center justify-center text-white transition-colors z-10"
            aria-label="Next photo"
          >
            <ChevronRight size={22} />
          </button>
        )}

        {/* Slide counter */}
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full font-medium">
          {currentSlide + 1} / {allImages.length}
        </div>

        {/* Dot indicators (max 12 dots) */}
        {allImages.length > 1 && allImages.length <= 12 && (
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1 pointer-events-none">
            {allImages.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToSlide(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all pointer-events-auto ${
                  i === currentSlide ? "bg-white w-3" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── LIGHTBOX ── */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[9999] bg-black flex flex-col"
          onClick={closeLightbox}
        >
          {/* Header */}
          <div
            className="shrink-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-white/80 text-sm font-medium">
              {lightboxIdx + 1} / {allImages.length}
            </span>
            <button
              onClick={closeLightbox}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Image */}
          <div
            className="flex-1 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={allImages[lightboxIdx].image_url ?? fallback}
              alt={allImages[lightboxIdx].caption ?? title}
              fill className="object-contain"
              sizes="100vw" unoptimized
            />

            {/* Prev */}
            {allImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/40 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft size={22} />
              </button>
            )}

            {/* Next */}
            {allImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/40 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight size={22} />
              </button>
            )}
          </div>

          {/* Thumbnail strip */}
          {allImages.length > 1 && (
            <div
              className="shrink-0 flex gap-1.5 px-4 py-3 overflow-x-auto bg-black/80"
              onClick={(e) => e.stopPropagation()}
              style={{ scrollbarWidth: "none" } as React.CSSProperties}
            >
              {allImages.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setLightboxIdx(i)}
                  className={`relative w-14 h-10 shrink-0 rounded overflow-hidden transition-all ${
                    i === lightboxIdx ? "ring-2 ring-white" : "opacity-50 hover:opacity-80"
                  }`}
                >
                  <Image
                    src={img.image_url ?? fallback}
                    alt={img.caption ?? `${title} photo ${i + 1}`}
                    fill className="object-cover"
                    sizes="56px" unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
