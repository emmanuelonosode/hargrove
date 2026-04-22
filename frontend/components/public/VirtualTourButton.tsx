"use client";

import { useState } from "react";
import { RotateCcw, X, ExternalLink } from "lucide-react";

interface Props {
  url: string;
  thumbnailUrl?: string | null;
  mobile?: boolean;
}

function TourModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
      <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-black/90">
        <div className="flex items-center gap-2 text-white">
          <RotateCcw size={15} className="text-brand" />
          <span className="text-sm font-semibold">360° Virtual Tour</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors"
          >
            <ExternalLink size={13} /> Open in new tab
          </a>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-neutral-900">
        {/* Fallback behind iframe */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/40 text-sm">
          <RotateCcw size={32} className="text-white/20 animate-spin" style={{ animationDuration: "3s" }} />
          <p>Loading tour…</p>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-brand font-semibold hover:underline mt-1">
            Open directly if it doesn't load →
          </a>
        </div>
        <iframe
          src={url}
          className="absolute inset-0 w-full h-full"
          style={{ border: 0 }}
          allowFullScreen
          allow="xr-spatial-tracking; gyroscope; accelerometer; fullscreen"
          title="360° Virtual Tour"
        />
      </div>
    </div>
  );
}

export function VirtualTourButton({ url, thumbnailUrl, mobile }: Props) {
  const [open, setOpen] = useState(false);

  if (mobile) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-100 transition-colors active:bg-neutral-200"
        >
          <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
            <RotateCcw size={18} className="text-brand" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className="text-sm font-semibold text-brand-dark">360° Virtual Tour</p>
            <p className="text-xs text-neutral-500">Interactive 3D walkthrough — tap to view</p>
          </div>
          <span className="text-xs font-bold text-brand shrink-0">View →</span>
        </button>
        {open && <TourModal url={url} onClose={() => setOpen(false)} />}
      </>
    );
  }

  return (
    <>
      <div className="rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
        {/* Thumbnail preview */}
        <div
          className="relative aspect-video bg-neutral-900 flex items-center justify-center cursor-pointer group overflow-hidden"
          onClick={() => setOpen(true)}
          style={thumbnailUrl ? {
            backgroundImage: `url(${thumbnailUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          } : undefined}
        >
          <div className="absolute inset-0 bg-black/45 group-hover:bg-black/35 transition-colors" />
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-200">
              <RotateCcw size={28} className="text-brand" />
            </div>
            <p className="text-white font-semibold text-sm tracking-wide drop-shadow-lg">
              View 360° Virtual Tour
            </p>
          </div>
        </div>

        <div className="px-4 py-2.5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
          <p className="text-xs text-neutral-500">Interactive 3D walkthrough</p>
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
            Open full screen <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {open && <TourModal url={url} onClose={() => setOpen(false)} />}
    </>
  );
}
