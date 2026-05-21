"use client";

import { useState, useEffect, useRef } from "react";
import {
  X, Timer, Check, Copy, Sparkles, User, Mail, Phone, ArrowRight, Lock
} from "lucide-react";
import { getStoredUTMs, getBestKnownCity, trackEvent } from "@/lib/tracking";

interface Props {
  open: boolean;
  onClose: () => void;
  propertyId: number;
  propertySlug: string;
  propertyTitle: string;
  propertyCity: string;
}

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

  // Timer countdown logic
  useEffect(() => {
    if (open && !submitted) {
      // Start/reset timer when modal opens
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
      
      // Auto focus name input
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

  // Prevent scroll when open
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

  // Handle ESC key to close
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

  // Format time (MM:SS)
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
                 `- Offer: $100 App Fee Waived + $150 Off First Month's Rent\n` +
                 `- Remaining Time on Countdown: ${formatTime(timeLeft)}`,
        detected_city: propertyCity || getBestKnownCity() || undefined,
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
        className="absolute inset-0 bg-brand-dark/75 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-100 transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Gradient Banner */}
        <div className="bg-gradient-to-r from-brand to-purple-600 px-6 py-8 text-white relative overflow-hidden">
          {/* Decorative Sparkles */}
          <div className="absolute right-4 top-4 text-white/20 animate-pulse">
            <Sparkles size={48} />
          </div>
          
          <div className="relative z-10 space-y-2">
            <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full backdrop-blur-sm">
              <Sparkles size={11} className="animate-spin duration-[4000ms]" /> Limited Time Exclusive
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
              Unlock Your Rent Special
            </h3>
            <p className="text-white/80 text-xs sm:text-sm max-w-[90%]">
              Waive your <strong className="text-white font-bold">$100 application fee</strong> &amp; get <strong className="text-white font-bold">$150 off</strong> your first month at <strong className="font-semibold text-white">{propertyTitle}</strong>!
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all duration-200"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Dynamic Body Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {!submitted ? (
            /* CLAIM FORM STATE */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* High Urgency Timer Component */}
              <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                    <Timer size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider leading-none">Offer Expires In</p>
                    <p className="text-xs text-amber-600/80 mt-1">Claim now before this special deal is gone.</p>
                  </div>
                </div>
                <div className="text-2xl font-mono font-extrabold text-amber-600 tracking-tight shrink-0 bg-white border border-amber-200/50 px-3.5 py-1.5 rounded-xl shadow-inner">
                  {formatTime(timeLeft)}
                </div>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-brand-dark mb-1.5">Full Name *</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    <input
                      ref={nameInputRef}
                      type="text"
                      required
                      placeholder="Jane Smith"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setErrorMsg(""); }}
                      className="w-full h-[52px] border-2 border-neutral-100 rounded-xl pl-10 pr-4 text-brand-dark text-sm placeholder:text-neutral-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all bg-[#F9FAFB]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-dark mb-1.5">Email Address *</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
                      className="w-full h-[52px] border-2 border-neutral-100 rounded-xl pl-10 pr-4 text-brand-dark text-sm placeholder:text-neutral-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all bg-[#F9FAFB]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-dark mb-1.5">Phone Number (Optional)</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    <input
                      type="tel"
                      placeholder="(555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-[52px] border-2 border-neutral-100 rounded-xl pl-10 pr-4 text-brand-dark text-sm placeholder:text-neutral-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all bg-[#F9FAFB]"
                    />
                  </div>
                </div>
              </div>

              {errorMsg && (
                <p className="text-red-500 text-xs flex items-center gap-1.5 animate-pulse pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || timeLeft === 0}
                className="w-full h-[54px] bg-brand text-white font-bold rounded-xl hover:bg-brand-hover shadow-lg shadow-brand/20 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-400 pt-1">
                <Lock size={10} />
                <span>Your information is secure and encrypted.</span>
              </div>
            </form>
          ) : (
            /* SUCCESS REVEAL STATE */
            <div className="space-y-6 text-center py-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto shadow-md shadow-emerald-100">
                <Check size={32} className="text-emerald-500 animate-bounce" />
              </div>
              
              <div className="space-y-2">
                <h4 className="font-serif text-2xl font-bold text-brand-dark">
                  Offer Successfully Unlocked!
                </h4>
                <p className="text-sm text-neutral-500 max-w-sm mx-auto">
                  Copy your special coupon code below. You can apply it during the official application process.
                </p>
              </div>

              {/* Coupon Box */}
              <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 border border-neutral-200 rounded-2xl p-6 relative max-w-sm mx-auto shadow-sm">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand text-[9px] font-black text-white px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                  Exclusive Code
                </div>
                
                <div className="flex flex-col items-center gap-4 mt-2">
                  <div className="font-mono text-3xl font-black text-brand tracking-widest bg-white px-5 py-3 rounded-xl border border-dashed border-neutral-300 shadow-sm w-full">
                    HASKERFREE
                  </div>
                  
                  <button
                    onClick={handleCopy}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      copied 
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-200" 
                        : "bg-brand-dark text-white hover:bg-neutral-800 shadow-md shadow-brand-dark/20"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check size={14} /> Copied to Clipboard!
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copy Code
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-[12px] text-emerald-800 leading-relaxed text-left max-w-sm mx-auto">
                <strong>Next Steps:</strong> When you complete the official application, paste this code in the &quot;Promotional Code&quot; input field on the payment page to waive your fee and claim your discount.
              </div>

              <button
                onClick={onClose}
                className="text-neutral-500 hover:text-brand-dark text-xs font-bold transition-all pt-2"
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
