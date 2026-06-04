"use client";

import { useState, useEffect, useRef } from "react";
import { Phone, X, User, Check, PhoneCall } from "lucide-react";
import {
  getBestKnownCity,
  getStoredUTMs,
  getStoredReferralCode,
  getDeviceContext,
  trackEvent,
} from "@/lib/tracking";

const CAPTURED_KEY = "hasker_callback_sent";

const INPUT_CLS =
  "w-full h-[48px] border border-neutral-200 rounded-xl pl-10 pr-4 " +
  "text-brand-dark text-sm placeholder:text-neutral-400 " +
  "focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 " +
  "transition-all bg-neutral-50 focus:bg-white font-medium";

export function FloatingCallbackButton() {
  const [open,      setOpen]      = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [phone,     setPhone]     = useState("");
  const [name,      setName]      = useState("");
  const [loading,   setLoading]   = useState(false);
  const [errorMsg,  setErrorMsg]  = useState("");
  const phoneRef = useRef<HTMLInputElement>(null);

  // Hide button if already submitted this session
  const [alreadySent, setAlreadySent] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem(CAPTURED_KEY) === "true") setAlreadySent(true);
  }, []);

  // Listen for programmatic open trigger (e.g. from Navbar "Call Me" button)
  useEffect(() => {
    const handler = () => { if (!alreadySent) setOpen(true); };
    window.addEventListener("hasker:open-callback", handler);
    return () => window.removeEventListener("hasker:open-callback", handler);
  }, [alreadySent]);

  // Scroll lock when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Auto-focus phone input
  useEffect(() => {
    if (open && !submitted) setTimeout(() => phoneRef.current?.focus(), 150);
  }, [open, submitted]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) { setErrorMsg("Please enter your phone number."); return; }
    if (!name.trim())  { setErrorMsg("Please enter your name."); return; }
    setLoading(true);
    setErrorMsg("");
    try {
      const city = getBestKnownCity();
      const res = await fetch("/api/v1/leads/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name:         name.trim(),
          phone:             phone.trim(),
          source:            "CONTACT_FORM",
          interest_type:     "RENT",
          preferred_contact: "PHONE",
          detected_city:     city || undefined,
          message:           `Callback request via floating button. Phone: ${phone.trim()}` + getDeviceContext(),
          referral_code:     getStoredReferralCode() || undefined,
          ...getStoredUTMs(),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { detail?: string }).detail ?? "Submission failed.");
      }
      sessionStorage.setItem(CAPTURED_KEY, "true");
      trackEvent("generate_lead", { source: "floating_callback", city });
      setSubmitted(true);
      setTimeout(() => { setAlreadySent(true); setOpen(false); }, 3500);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (alreadySent) return null;

  return (
    <>
      {/* Floating button — bottom-right, above mobile nav */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-40 flex items-center gap-2 bg-brand hover:bg-brand-hover text-white font-bold text-sm px-4 py-3 lg:px-5 lg:py-3.5 rounded-full shadow-xl shadow-brand/30 hover:shadow-brand/40 transition-all active:scale-95 cursor-pointer group"
        aria-label="Request a callback"
      >
        <Phone size={16} className="shrink-0 group-hover:animate-bounce" />
        <span>Get a Call Back</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[9997] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div onClick={() => setOpen(false)} className="absolute inset-0 bg-brand-dark/70 backdrop-blur-sm" aria-hidden="true" />

          <div
            role="dialog" aria-modal="true" aria-labelledby="callback-modal-title"
            className="relative w-full sm:max-w-sm bg-white sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200"
          >
            {/* Header */}
            <div className="bg-brand-dark px-5 py-5 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                    <PhoneCall size={14} className="text-white" />
                  </div>
                  <p className="text-[10px] font-black tracking-[0.2em] uppercase text-white/50">Free Callback</p>
                </div>
                <h3 id="callback-modal-title" className="font-serif text-xl font-bold text-white leading-tight">
                  We&apos;ll call you with<br />available homes.
                </h3>
                <p className="text-white/55 text-xs mt-1.5 leading-relaxed">
                  Real agent · within 1 hour · no pressure
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="shrink-0 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-all cursor-pointer mt-0.5"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                  {/* Phone — first, required */}
                  <div>
                    <label className="block text-[10px] font-black tracking-widest uppercase text-neutral-500 mb-1.5">
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      <input
                        ref={phoneRef}
                        type="tel"
                        required
                        placeholder="(555) 000-0000"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value); setErrorMsg(""); }}
                        className={INPUT_CLS}
                      />
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-[10px] font-black tracking-widest uppercase text-neutral-500 mb-1.5">
                      Your Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="Jane Smith"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setErrorMsg(""); }}
                        className={INPUT_CLS}
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <p className="text-red-500 text-xs font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />{errorMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[48px] bg-brand text-white font-bold rounded-xl hover:bg-brand-hover transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50 shadow-md shadow-brand/15 mt-1"
                  >
                    {loading
                      ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <><PhoneCall size={15} /> Call Me Back</>
                    }
                  </button>
                  <p className="text-center text-[10px] text-neutral-400">No spam. A real agent calls within 1 hour.</p>
                </form>
              ) : (
                <div className="text-center py-4 space-y-3 animate-in fade-in duration-300">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
                    <Check size={24} className="text-emerald-500" />
                  </div>
                  <p className="font-serif font-bold text-brand-dark">Expect a call soon!</p>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    An agent will call <strong className="text-brand-dark">{phone}</strong> within the hour.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
