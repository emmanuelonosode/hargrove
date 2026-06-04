"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { X, Phone, User, Mail, Clock, Check, PhoneCall } from "lucide-react";
import {
  getBestKnownCity,
  getStoredUTMs,
  getStoredReferralCode,
  getDeviceContext,
  trackEvent,
} from "@/lib/tracking";

const POPUP_TS_KEY   = "hasker_popup_ts";
const LEAD_KEY       = "hasker_lead_captured";
const COOLDOWN_MS    = 24 * 60 * 60 * 1000;
const TIMER_DELAY_MS = 18_000;

const INPUT_CLS =
  "w-full h-[52px] border border-neutral-200 rounded-xl pl-10 pr-4 " +
  "text-brand-dark text-sm placeholder:text-neutral-400 " +
  "focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 " +
  "transition-all bg-neutral-50 focus:bg-white font-medium";

export function ExitIntentPopup() {
  const pathname = usePathname();

  const [visible,   setVisible]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [city,      setCity]      = useState("");
  const [phone,     setPhone]     = useState("");
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [timeline,  setTimeline]  = useState("");
  const [loading,   setLoading]   = useState(false);
  const [errorMsg,  setErrorMsg]  = useState("");

  const phoneInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setCity(getBestKnownCity()); }, []);

  useEffect(() => {
    const suppressed =
      pathname.startsWith("/apply") ||
      pathname.startsWith("/portal") ||
      sessionStorage.getItem(LEAD_KEY) === "true" ||
      Date.now() - Number(localStorage.getItem(POPUP_TS_KEY) || 0) < COOLDOWN_MS;

    if (suppressed) return;

    const show = () => {
      setCity(getBestKnownCity());
      setVisible(true);
    };

    const timer = setTimeout(show, TIMER_DELAY_MS);
    const handleMouseLeave = (e: MouseEvent) => { if (e.clientY < 5) show(); };
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setVisible(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible]);

  useEffect(() => {
    if (visible && !submitted) setTimeout(() => phoneInputRef.current?.focus(), 150);
  }, [visible, submitted]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) { setErrorMsg("Please enter your phone number."); return; }
    if (!name.trim())  { setErrorMsg("Please enter your name."); return; }
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/v1/leads/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name:        name.trim(),
          email:            email.trim() || undefined,
          phone:            phone.trim(),
          source:           "CONTACT_FORM",
          interest_type:    "RENT",
          preferred_contact: "PHONE",
          move_in_timeline: timeline || undefined,
          detected_city:    city || undefined,
          message:          `Callback request via exit popup. Phone: ${phone.trim()}` + getDeviceContext(),
          referral_code:    getStoredReferralCode() || undefined,
          ...getStoredUTMs(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { detail?: string }).detail ?? "Submission failed.");
      }
      localStorage.setItem(POPUP_TS_KEY, String(Date.now()));
      sessionStorage.setItem(LEAD_KEY, "true");
      trackEvent("generate_lead", { source: "exit_popup", type: "callback", city });
      setSubmitted(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <div onClick={() => setVisible(false)} className="absolute inset-0 bg-brand-dark/75 backdrop-blur-md" aria-hidden="true" />

      <div
        role="dialog" aria-modal="true" aria-labelledby="exit-popup-title"
        className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-100 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-brand-dark px-6 py-7 text-white relative overflow-hidden">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <PhoneCall size={18} className="text-white" />
            </div>
            <p className="text-[10px] font-black tracking-[0.25em] uppercase text-white/50">
              Free Callback · {city || "Your Area"}
            </p>
          </div>
          <h3 id="exit-popup-title" className="font-serif text-2xl font-bold text-white leading-tight">
            We&apos;ll call you back<br />with matching homes.
          </h3>
          <p className="text-white/60 text-xs mt-2 leading-relaxed">
            Drop your number — a real agent will call you within the hour with homes that fit your budget in{" "}
            <strong className="text-white/90">{city || "your area"}</strong>.
          </p>
          <button
            onClick={() => setVisible(false)}
            className="absolute top-4 right-4 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all cursor-pointer"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
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
                    ref={phoneInputRef}
                    type="tel"
                    required
                    placeholder="(555) 000-0000"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setErrorMsg(""); }}
                    className={INPUT_CLS}
                  />
                </div>
              </div>

              {/* Name — required */}
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

              {/* Email — optional */}
              <div>
                <label className="block text-[10px] font-black tracking-widest uppercase text-neutral-500 mb-1.5">
                  Email{" "}
                  <span className="text-neutral-400 font-normal normal-case tracking-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={INPUT_CLS}
                  />
                </div>
              </div>

              {/* Timeline */}
              <div>
                <label className="block text-[10px] font-black tracking-widest uppercase text-neutral-500 mb-1.5">
                  When do you need to move?{" "}
                  <span className="text-neutral-400 font-normal normal-case tracking-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className={`${INPUT_CLS} appearance-none`}
                  >
                    <option value="">Select timeline…</option>
                    <option value="ASAP">ASAP — Ready now</option>
                    <option value="1_3_MONTHS">1–3 months</option>
                    <option value="3_6_MONTHS">3–6 months</option>
                    <option value="JUST_BROWSING">Just browsing</option>
                  </select>
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
                disabled={loading}
                className="w-full h-[52px] bg-brand text-white font-bold rounded-xl hover:bg-brand-hover shadow-md shadow-brand/15 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                {loading
                  ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><PhoneCall size={15} /> Call Me Back</>
                }
              </button>

              <p className="text-center text-[10px] text-neutral-400">
                A real agent will call within 1 hour during business hours. No spam.
              </p>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
                <Check size={28} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-[9px] font-black tracking-[0.3em] uppercase text-emerald-600 mb-1.5">Call Requested!</p>
                <h4 className="font-serif text-xl font-bold text-brand-dark">Expect a call soon</h4>
                <p className="text-sm text-neutral-500 mt-2 leading-relaxed max-w-xs mx-auto">
                  An agent will reach out to <strong className="text-brand-dark">{phone}</strong> within the hour with homes in {city || "your area"}.
                </p>
              </div>
              <button onClick={() => setVisible(false)} className="text-neutral-400 hover:text-brand-dark text-xs font-bold transition-all cursor-pointer">
                Continue Browsing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
