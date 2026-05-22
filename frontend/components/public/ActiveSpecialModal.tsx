"use client";

import { useState, useEffect, useRef } from "react";
import {
  X, Timer, Check, Copy, User, Mail, Phone, ArrowRight, Lock
} from "lucide-react";
import { getStoredUTMs, getStoredReferralCode, getBestKnownCity, getDeviceContext, trackEvent } from "@/lib/tracking";

interface Props {
  open: boolean;
  onClose: () => void;
  propertyId: number;
  propertySlug: string;
  propertyTitle: string;
  propertyCity: string;
}

/* ─── Illustration ───────────────────────────────────────────────────── */

function OfferIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 85" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* House */}
      <path d="M50 8L88 36H76V74H24V36H12L50 8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.07"/>
      <rect x="42" y="52" width="16" height="22" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="57" cy="64" r="1.5" fill="currentColor" fillOpacity="0.6"/>
      <rect x="27" y="45" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="63" y="45" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      {/* Price tag */}
      <path d="M100 20H124C125.1 20 126 20.9 126 22V46L98 74V20H100Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="118" cy="30" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="103" y1="41" x2="117" y2="41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5"/>
      <line x1="103" y1="49" x2="112" y2="49" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.35"/>
    </svg>
  );
}

/* ─── Component ──────────────────────────────────────────────────────── */

export function ActiveSpecialModal({
  open,
  onClose,
  propertyId,
  propertySlug,
  propertyTitle,
  propertyCity,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 15-minute countdown timer (900 seconds)
  const [timeLeft, setTimeLeft] = useState(900);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !submitted) {
      setTimeLeft(900);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 300);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [open, submitted]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const payload = {
        full_name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        source: "SPECIAL_OFFER",
        interest_type: "RENT",
        property_interest: propertyId,
        services_requested: [propertySlug],
        message: `Claimed Special Offer for "${propertyTitle}":\n` +
                 `- Code requested: HASKERFREE\n` +
                 `- Offer: First Month's Rent FREE\n` +
                 `- Remaining Time on Countdown: ${formatTime(timeLeft)}` +
                 getDeviceContext(),
        detected_city: propertyCity || getBestKnownCity() || undefined,
        referral_code: getStoredReferralCode() || undefined,
        ...getStoredUTMs(),
      };

      const res = await fetch("/api/v1/leads/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? "Failed to claim this offer. Please try again.");
      }

      trackEvent("claim_special_offer", {
        property: propertySlug,
        code: "HASKERFREE",
      });

      setSubmitted(true);
      if (timerRef.current) clearInterval(timerRef.current);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText("HASKERFREE");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackEvent("copy_special_code", { code: "HASKERFREE" });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-brand-dark/75 backdrop-blur-md"
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-100 animate-in fade-in zoom-in-95 duration-200">

        {/* ── Header (dark navy — no purple) ── */}
        <div className="bg-brand-dark px-6 py-7 text-white relative overflow-hidden">
          {/* Decorative illustration — right side, low opacity */}
          <div className="absolute right-0 top-0 bottom-0 w-48 flex items-center justify-end pr-4 pointer-events-none">
            <OfferIllustration className="w-44 h-auto text-white opacity-20" />
          </div>

          <div className="relative z-10 space-y-2.5 max-w-[75%]">
            <span className="inline-flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[9px] font-black tracking-[0.25em] uppercase px-3 py-1 rounded-full">
              Limited Time Offer
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight text-white">
              Unlock Your Rent Special
            </h3>
            <p className="text-white/65 text-xs sm:text-sm leading-relaxed">
              Get your <strong className="text-white font-semibold">first month&apos;s rent FREE</strong> on your lease at{" "}
              <strong className="text-white/90 font-medium">{propertyTitle}</strong>.
            </p>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-6 sm:p-7 space-y-5">
          {!submitted ? (
            /* ── Claim Form ── */
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Countdown timer */}
              <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                    <Timer size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest leading-none">Offer Expires In</p>
                    <p className="text-[11px] text-amber-600/70 mt-1 leading-tight">Claim before this deal is gone.</p>
                  </div>
                </div>
                <div className={`text-2xl font-mono font-extrabold tracking-tight shrink-0 px-3.5 py-1.5 rounded-xl border shadow-inner ${
                  timeLeft < 60
                    ? "text-red-600 bg-red-50 border-red-200/50"
                    : "text-amber-600 bg-white border-amber-200/50"
                }`}>
                  {formatTime(timeLeft)}
                </div>
              </div>

              {/* Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-black tracking-widest uppercase text-neutral-500 mb-1.5">Full Name *</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    <input
                      ref={nameInputRef}
                      type="text"
                      required
                      placeholder="Jane Smith"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setErrorMsg(""); }}
                      className="w-full h-[52px] border border-neutral-200 rounded-xl pl-10 pr-4 text-brand-dark text-sm placeholder:text-neutral-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all bg-neutral-50 focus:bg-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black tracking-widest uppercase text-neutral-500 mb-1.5">Email Address *</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
                      className="w-full h-[52px] border border-neutral-200 rounded-xl pl-10 pr-4 text-brand-dark text-sm placeholder:text-neutral-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all bg-neutral-50 focus:bg-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black tracking-widest uppercase text-neutral-500 mb-1.5">
                    Phone <span className="text-neutral-400 font-normal normal-case tracking-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    <input
                      type="tel"
                      placeholder="(555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-[52px] border border-neutral-200 rounded-xl pl-10 pr-4 text-brand-dark text-sm placeholder:text-neutral-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all bg-neutral-50 focus:bg-white font-medium"
                    />
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <p className="text-red-600 text-xs font-medium">{errorMsg}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || timeLeft === 0}
                className="w-full h-[52px] bg-brand text-white font-bold rounded-xl hover:bg-brand-hover shadow-md shadow-brand/15 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Claim Special Code
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-400">
                <Lock size={10} />
                <span>Your information is secure and encrypted.</span>
              </div>
            </form>
          ) : (
            /* ── Success / Code Reveal ── */
            <div className="space-y-5 text-center py-1 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
                <Check size={28} className="text-emerald-500" />
              </div>

              <div>
                <p className="text-[9px] font-black tracking-[0.3em] uppercase text-emerald-600 mb-1.5">Offer Unlocked</p>
                <h4 className="font-serif text-2xl font-bold text-brand-dark">
                  Your Code Is Ready!
                </h4>
                <p className="text-sm text-neutral-500 max-w-sm mx-auto mt-2 leading-relaxed">
                  Copy your coupon code and paste it in the <strong className="text-brand-dark font-semibold">Promotional Code</strong> field during your application.
                </p>
              </div>

              {/* Coupon box */}
              <div className="border border-neutral-200 rounded-2xl overflow-hidden max-w-sm mx-auto">
                <div className="bg-neutral-50 border-b border-neutral-100 px-4 py-2">
                  <p className="text-[9px] font-black tracking-widest uppercase text-neutral-400 text-center">Exclusive Code</p>
                </div>
                <div className="p-5 space-y-3">
                  <div className="font-mono text-3xl font-black text-brand tracking-widest bg-neutral-50 border border-dashed border-neutral-300 rounded-xl py-3 px-4 text-center">
                    HASKERFREE
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      copied
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "bg-brand-dark text-white hover:bg-neutral-800 shadow-sm"
                    }`}
                  >
                    {copied ? (
                      <><Check size={13} /> Copied to Clipboard!</>
                    ) : (
                      <><Copy size={13} /> Copy Code</>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3.5 text-[11px] text-emerald-800 leading-relaxed text-left max-w-sm mx-auto">
                <strong>Next Steps:</strong> Paste this code in the &quot;Promotional Code&quot; field during your application to claim your free month of rent.
              </div>

              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-brand-dark text-xs font-bold transition-all pt-1 cursor-pointer"
              >
                Close &amp; Continue Browsing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
