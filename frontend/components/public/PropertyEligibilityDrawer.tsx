"use client";

import { useEffect, useRef, useState } from "react";
import {
  X, User, Mail, Phone, DollarSign,
  CheckCircle2, AlertTriangle, Loader2, ArrowRight,
  ArrowLeft, Bell
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { getStoredUTMs, getStoredReferralCode, getBestKnownCity, getStoredLocation, getDeviceContext, trackEvent } from "@/lib/tracking";

interface Props {
  open: boolean;
  onClose: () => void;
  propertyId: number;
  propertySlug: string;
  propertyTitle: string;
  propertyPrice: number;
  propertyCity: string;
}

const CREDIT_OPTIONS = [
  { label: "Excellent (720+)", value: "720-plus" },
  { label: "Good (660 – 719)", value: "660-719" },
  { label: "Fair (600 – 659)", value: "600-659" },
  { label: "Poor (Under 600)", value: "under-600" },
];

/* ─── Illustrations ─────────────────────────────────────────────────── */

function HouseIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M50 8L90 40H76V82H24V40H10L50 8Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      <rect x="42" y="52" width="16" height="30" rx="2" stroke="currentColor" strokeWidth="2"/>
      <circle cx="55" cy="68" r="1.5" fill="currentColor"/>
      <rect x="25" y="46" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="62" y="46" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M68 12V28M68 12H76V28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function SuccessHouseIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 130 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M52 10L90 40H77V82H27V40H14L52 10Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      <rect x="44" y="54" width="16" height="28" rx="2" stroke="currentColor" strokeWidth="2"/>
      <circle cx="57" cy="69" r="1.5" fill="currentColor"/>
      <rect x="27" y="48" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="65" y="48" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="105" cy="30" r="18" fill="white" stroke="currentColor" strokeWidth="2"/>
      <path d="M96 30L102 36L113 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function AlternativePathIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 130 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M52 10L90 40H77V82H27V40H14L52 10Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeOpacity="0.35"/>
      <rect x="44" y="54" width="16" height="28" rx="2" stroke="currentColor" strokeWidth="2" strokeOpacity="0.35"/>
      <path d="M94 50C98 40 108 36 118 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3"/>
      <path d="M112 32L118 38L112 44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M95 62L100 56H112V72H95V62Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M100 56L100 52L107.5 46L115 52V56" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

/* ─── Component ─────────────────────────────────────────────────────── */

export function PropertyEligibilityDrawer({
  open,
  onClose,
  propertyId,
  propertySlug,
  propertyTitle,
  propertyPrice,
  propertyCity,
}: Props) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [moveInTimeline, setMoveInTimeline] = useState("");
  const [income, setIncome] = useState("");
  const [credit, setCredit] = useState("");
  const [occupants, setOccupants] = useState("");
  const [hasPets, setHasPets] = useState<boolean | null>(null);
  const [preferredContact, setPreferredContact] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [alertSubscribed, setAlertSubscribed] = useState(false);
  const [submittingAlert, setSubmittingAlert] = useState(false);

  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => firstFieldRef.current?.focus(), 300);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const parsedIncome = parseFloat(income.replace(/[^0-9.]/g, "")) || 0;
  const passesIncomeRatio = parsedIncome >= 3 * propertyPrice;
  const recommendedMaxRent = Math.round(parsedIncome / 3);

  async function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    if (step === 1) {
      if (!name.trim()) { setErrorMsg("Please enter your name."); return; }
      if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) { setErrorMsg("Please enter a valid email."); return; }
      setErrorMsg("");

      // Fire-and-forget: capture contact info in case user abandons at step 2
      const loc1 = getStoredLocation();
      fetch("/api/v1/leads/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          source: "PROPERTY_INQUIRY",
          interest_type: "RENT",
          property_interest: propertyId,
          services_requested: [propertySlug],
          move_in_timeline: moveInTimeline || undefined,
          preferred_contact: preferredContact || undefined,
          preferred_location: [loc1.city, loc1.region].filter(Boolean).join(", ") || undefined,
          message: `Started eligibility check for "${propertyTitle}" — contact captured at step 1.` + getDeviceContext(),
          detected_city: propertyCity || getBestKnownCity() || undefined,
          referral_code: getStoredReferralCode() || undefined,
          ...getStoredUTMs(),
        }),
      }).catch(() => {});

      setStep(2);
      return;
    }

    if (step === 2) {
      if (!income) { setErrorMsg("Please enter your monthly income."); return; }
      if (!credit) { setErrorMsg("Please select your credit range."); return; }

      setLoading(true);
      setErrorMsg("");

      try {
        const loc2 = getStoredLocation();
        const payload = {
          full_name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          source: "PROPERTY_INQUIRY",
          interest_type: "RENT",
          budget_min: 0,
          budget_max: recommendedMaxRent || undefined,
          property_interest: propertyId,
          services_requested: [propertySlug],
          move_in_timeline: moveInTimeline || undefined,
          occupants_count: occupants ? parseInt(occupants, 10) : undefined,
          has_pets: hasPets !== null ? hasPets : undefined,
          preferred_contact: preferredContact || undefined,
          preferred_location: [loc2.city, loc2.region].filter(Boolean).join(", ") || undefined,
          message: `Eligibility Assessment for "${propertyTitle}":\n` +
                   `- Monthly Gross Income: $${parsedIncome.toLocaleString()}\n` +
                   `- Credit Range: ${CREDIT_OPTIONS.find(o => o.value === credit)?.label ?? credit}\n` +
                   `- Occupants: ${occupants || "Not specified"}\n` +
                   `- Pets: ${hasPets === null ? "Not specified" : hasPets ? "Yes" : "No"}\n` +
                   `- Move-in Timeline: ${moveInTimeline || "Not specified"}\n` +
                   `- Pre-Qualified Status: ${passesIncomeRatio ? "YES" : "NO"} (Rent is $${propertyPrice.toLocaleString()}/mo, 3x rent is $${(propertyPrice * 3).toLocaleString()}/mo)` +
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
          throw new Error(data.detail ?? "Something went wrong saving your inquiry.");
        }

        trackEvent("check_eligibility", {
          property: propertySlug,
          pre_qualified: passesIncomeRatio ? "yes" : "no",
        });

        setStep(3);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Submission failed.");
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleSubscribeAlert() {
    setSubmittingAlert(true);
    try {
      const payload = {
        full_name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        source: "CONTACT_FORM",
        interest_type: "RENT",
        budget_max: recommendedMaxRent || undefined,
        message: `Opted in for automated budget alert:\n` +
                 `- Target rent limit: $${recommendedMaxRent.toLocaleString()}/mo\n` +
                 `- Target City: ${propertyCity}\n` +
                 `- Context: Failed pre-qualification for "${propertyTitle}" ($${propertyPrice.toLocaleString()}/mo).`,
        detected_city: propertyCity || getBestKnownCity() || undefined,
        ...getStoredUTMs(),
      };

      const res = await fetch("/api/v1/leads/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to subscribe.");

      trackEvent("subscribe_budget_alert", {
        city: propertyCity,
        max_budget: recommendedMaxRent,
      });

      setAlertSubscribed(true);
    } catch {
      setAlertSubscribed(true);
    } finally {
      setSubmittingAlert(false);
    }
  }

  function handleBack() {
    setErrorMsg("");
    setStep(s => Math.max(1, s - 1));
  }

  function handleClose() {
    if (!loading) {
      onClose();
      setTimeout(() => {
        setStep(1);
        setName("");
        setEmail("");
        setPhone("");
        setMoveInTimeline("");
        setIncome("");
        setCredit("");
        setOccupants("");
        setHasPets(null);
        setPreferredContact("");
        setErrorMsg("");
        setAlertSubscribed(false);
        setSubmittingAlert(false);
      }, 350);
    }
  }

  const inputCls =
    "w-full h-[56px] border border-neutral-200 rounded-xl pl-11 pr-4 text-brand-dark text-sm " +
    "placeholder:text-neutral-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all bg-white font-medium";

  const labelCls = "block text-[11px] font-black tracking-widest uppercase text-neutral-500 mb-2";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        aria-hidden="true"
        className={`fixed inset-0 z-50 bg-brand-dark/50 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pre-Qualification Check"
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[500px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ── Header ── */}
        <div className="bg-white px-6 pt-6 pb-0 shrink-0">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-brand/10 flex items-center justify-center shrink-0">
                <HouseIllustration className="w-7 h-7 text-brand" />
              </div>
              <div>
                <p className="text-[9px] font-black tracking-[0.28em] uppercase text-brand mb-0.5">
                  Instant Pre-Qualification
                </p>
                <h2 className="font-serif text-[1.15rem] font-bold text-brand-dark leading-tight">
                  Check Your Eligibility
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close panel"
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-neutral-400 hover:text-brand-dark hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Step pills */}
          {step < 3 && (
            <div className="flex items-center gap-2 pb-5">
              {[
                { n: 1, label: "Contact" },
                { n: 2, label: "Financials" },
              ].map(({ n, label }, i) => (
                <div key={n} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 h-7 px-3 rounded-full text-[10px] font-bold transition-all ${
                    step === n
                      ? "bg-brand text-white"
                      : step > n
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-neutral-100 text-neutral-400"
                  }`}>
                    {step > n
                      ? <CheckCircle2 size={11} />
                      : <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[9px] font-black">{n}</span>
                    }
                    <span>{label}</span>
                  </div>
                  {i < 1 && (
                    <div className={`w-8 h-px transition-all ${step > 1 ? "bg-emerald-300" : "bg-neutral-200"}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="h-px bg-neutral-100 -mx-6" />
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === 3 ? (
            <div className="flex flex-col h-full justify-between">
              {passesIncomeRatio ? (
                /* ── SUCCESS ── */
                <div className="space-y-5">
                  <div className="flex justify-center">
                    <SuccessHouseIllustration className="w-36 h-auto text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black tracking-[0.3em] uppercase text-emerald-600 mb-1.5">
                      Pre-Qualification Met
                    </p>
                    <h3 className="font-serif text-2xl font-bold text-brand-dark leading-tight">
                      Excellent, {name.split(" ")[0]}!
                    </h3>
                    <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
                      Your income of <strong className="text-brand-dark font-semibold">${parsedIncome.toLocaleString()}/mo</strong> is{" "}
                      <strong className="text-emerald-700 font-bold">{(parsedIncome / propertyPrice).toFixed(1)}×</strong> the rent — well above the 3× guideline.
                    </p>
                  </div>

                  <div className="border border-neutral-200 rounded-2xl overflow-hidden">
                    <div className="bg-neutral-50 px-4 py-2.5 border-b border-neutral-100">
                      <p className="text-[9px] font-black tracking-widest uppercase text-neutral-400">Qualification Summary</p>
                    </div>
                    <div className="divide-y divide-neutral-100">
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-xs text-neutral-500 font-medium">Property Rent</span>
                        <span className="text-sm font-bold text-brand-dark">{formatPrice(propertyPrice)}/mo</span>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-xs text-neutral-500 font-medium">Your Monthly Income</span>
                        <span className="text-sm font-bold text-brand-dark">${parsedIncome.toLocaleString()}/mo</span>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-xs text-neutral-500 font-medium">Required (3× rent)</span>
                        <span className="text-sm font-bold text-emerald-700">${(propertyPrice * 3).toLocaleString()}/mo ✓</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Properties of this caliber in {propertyCity} lease quickly. We recommend submitting your application today.
                  </p>
                </div>
              ) : (
                /* ── NOT ELIGIBLE ── */
                <div className="space-y-5">
                  <div className="flex justify-center">
                    <AlternativePathIllustration className="w-36 h-auto text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black tracking-[0.3em] uppercase text-amber-700 mb-1.5">
                      Alternative Path Available
                    </p>
                    <h3 className="font-serif text-2xl font-bold text-brand-dark leading-tight">
                      Let&apos;s Find Your Match
                    </h3>
                  </div>

                  <div className="border border-amber-200/70 rounded-2xl overflow-hidden">
                    <div className="bg-amber-50/50 px-4 py-2.5 border-b border-amber-100">
                      <p className="text-[9px] font-black tracking-widest uppercase text-amber-700">Income Gap</p>
                    </div>
                    <div className="divide-y divide-amber-100/60">
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-xs text-neutral-500 font-medium">Required Income</span>
                        <span className="text-sm font-bold text-neutral-700">${(propertyPrice * 3).toLocaleString()}/mo</span>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-xs text-neutral-500 font-medium">Your Income</span>
                        <span className="text-sm font-bold text-amber-700">${parsedIncome.toLocaleString()}/mo</span>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-xs text-neutral-500 font-medium">Your Budget Limit</span>
                        <span className="text-sm font-bold text-brand-dark">{formatPrice(recommendedMaxRent)}/mo</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3">
                    <p className="text-[11px] font-bold text-neutral-700 mb-1">You can still qualify by:</p>
                    <ul className="text-xs text-neutral-500 space-y-1 leading-relaxed">
                      <li className="flex items-start gap-1.5"><span className="text-brand mt-0.5">→</span> Applying with a co-signer or guarantor</li>
                      <li className="flex items-start gap-1.5"><span className="text-brand mt-0.5">→</span> Prepaying additional months upfront</li>
                      <li className="flex items-start gap-1.5"><span className="text-brand mt-0.5">→</span> Using a housing voucher or assistance</li>
                    </ul>
                  </div>

                  {/* Alert subscription — clean teal card, no purple */}
                  <div className="border border-brand/20 rounded-2xl overflow-hidden">
                    <div className="bg-brand/5 px-4 py-3 flex items-center gap-3 border-b border-brand/10">
                      <div className="w-8 h-8 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                        <Bell size={14} className="text-brand" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-brand-dark">Get Alerted on Affordable Listings</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5 leading-tight">
                          Notify me when homes under <strong className="text-brand-dark">{formatPrice(recommendedMaxRent)}/mo</strong> in {propertyCity} go live.
                        </p>
                      </div>
                    </div>
                    <div className="px-4 py-3">
                      {!alertSubscribed ? (
                        <button
                          type="button"
                          disabled={submittingAlert}
                          onClick={handleSubscribeAlert}
                          className="w-full h-10 bg-brand text-white font-bold text-xs rounded-xl hover:bg-brand-hover transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {submittingAlert ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <>
                              <Bell size={13} />
                              Yes, Notify Me
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5 h-10 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 size={13} className="text-emerald-500" />
                          Alert Set — We&apos;ll Reach Out
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 3 Footer Actions ── */}
              <div className="pt-5 mt-5 border-t border-neutral-100 space-y-3">
                {passesIncomeRatio ? (
                  <Link
                    href={`/apply?property=${propertySlug}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&income=${parsedIncome}`}
                    onClick={onClose}
                    className="w-full flex items-center justify-center gap-2 bg-brand text-white font-bold py-4 rounded-xl hover:bg-brand-hover shadow-md shadow-brand/15 transition-all text-sm cursor-pointer"
                  >
                    Apply Free — Fast Decision <ArrowRight size={15} />
                  </Link>
                ) : (
                  <>
                    <Link
                      href={`/houses-for-rent?maxPrice=${recommendedMaxRent}`}
                      onClick={onClose}
                      className="w-full flex items-center justify-center gap-2 bg-brand text-white font-bold py-4 rounded-xl hover:bg-brand-hover shadow-md shadow-brand/15 transition-all text-sm cursor-pointer"
                    >
                      View Homes Under {formatPrice(recommendedMaxRent)}/mo <ArrowRight size={15} />
                    </Link>
                    <Link
                      href={`/apply?property=${propertySlug}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&income=${parsedIncome}`}
                      onClick={onClose}
                      className="w-full flex items-center justify-center gap-2 border-2 border-brand-dark/20 text-brand-dark font-bold py-3.5 rounded-xl hover:bg-brand-dark hover:text-white hover:border-brand-dark transition-all text-sm cursor-pointer"
                    >
                      Apply Anyway with Co-Signer
                    </Link>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* ── Wizard Form ── */
            <form onSubmit={handleCalculate} className="space-y-5 flex flex-col h-full justify-between">
              <div className="space-y-5">
                {step === 1 ? (
                  /* Step 1: Contact */
                  <>
                    <p className="text-sm text-neutral-500 leading-relaxed">
                      Enter your contact details so we can match your profile to this listing.
                    </p>

                    <div>
                      <label className={labelCls}>Full Name *</label>
                      <div className="relative">
                        <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                        <input
                          ref={firstFieldRef}
                          type="text"
                          required
                          placeholder="Jane Smith"
                          value={name}
                          onChange={(e) => { setName(e.target.value); setErrorMsg(""); }}
                          className={inputCls}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Email Address *</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                        <input
                          type="email"
                          required
                          placeholder="jane@smith.com"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
                          className={inputCls}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Phone <span className="text-neutral-400 font-normal normal-case tracking-normal">(optional)</span></label>
                      <div className="relative">
                        <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                        <input
                          type="tel"
                          placeholder="(555) 000-0000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Move-in Timeline <span className="text-neutral-400 font-normal normal-case tracking-normal">(optional)</span></label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: "ASAP", value: "ASAP" },
                          { label: "1–3 Months", value: "1_3_MONTHS" },
                          { label: "3–6 Months", value: "3_6_MONTHS" },
                          { label: "6+ Months", value: "6_PLUS" },
                          { label: "Just Browsing", value: "JUST_BROWSING" },
                        ].map((o) => (
                          <button
                            key={o.value}
                            type="button"
                            onClick={() => setMoveInTimeline(moveInTimeline === o.value ? "" : o.value)}
                            className={`h-8 px-3 rounded-xl border-2 text-[11px] font-bold transition-all cursor-pointer ${
                              moveInTimeline === o.value
                                ? "border-brand bg-brand/5 text-brand"
                                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                            }`}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  /* Step 2: Financials */
                  <>
                    <p className="text-sm text-neutral-500 leading-relaxed">
                      Your financial details are only used for this calculation. No credit check will be run.
                    </p>

                    <div>
                      <label className={labelCls}>Gross Monthly Income *</label>
                      <div className="relative">
                        <DollarSign size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                        <input
                          ref={firstFieldRef}
                          type="text"
                          required
                          placeholder="5,000"
                          value={income}
                          onChange={(e) => {
                            const clean = e.target.value.replace(/[^0-9]/g, "");
                            setIncome(clean ? parseInt(clean, 10).toLocaleString("en-US") : "");
                            setErrorMsg("");
                          }}
                          className={inputCls}
                        />
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-2 leading-relaxed">
                        Before tax — includes salary, child support, vouchers, or other assistance.
                      </p>
                    </div>

                    <div>
                      <label className={labelCls}>Estimated Credit Range *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {CREDIT_OPTIONS.map((o) => (
                          <button
                            key={o.value}
                            type="button"
                            onClick={() => { setCredit(o.value); setErrorMsg(""); }}
                            className={`h-[56px] rounded-xl border-2 text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                              credit === o.value
                                ? "border-brand bg-brand/5 text-brand"
                                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                            }`}
                          >
                            <span className="font-black">{o.label.split(" ")[0]}</span>
                            <span className="text-[9px] opacity-70">{o.label.includes("(") ? o.label.substring(o.label.indexOf("(")) : ""}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3x rent preview */}
                    {parsedIncome > 0 && (
                      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-xs transition-all ${
                        passesIncomeRatio
                          ? "border-emerald-200 bg-emerald-50/50 text-emerald-800"
                          : "border-amber-200 bg-amber-50/50 text-amber-800"
                      }`}>
                        {passesIncomeRatio
                          ? <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                          : <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                        }
                        <span>
                          Required: <strong>${(propertyPrice * 3).toLocaleString()}/mo</strong> —{" "}
                          {passesIncomeRatio ? "Your income qualifies" : `You need $${(propertyPrice * 3 - parsedIncome).toLocaleString()} more`}
                        </span>
                      </div>
                    )}

                    {/* Occupants */}
                    <div>
                      <label className={labelCls}>Total Occupants <span className="text-neutral-400 font-normal normal-case tracking-normal">(optional)</span></label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setOccupants(String(Math.max(1, parseInt(occupants || "1", 10) - 1)))}
                          className="w-10 h-10 rounded-xl border-2 border-neutral-200 text-neutral-500 font-bold text-lg hover:border-neutral-300 hover:bg-neutral-50 transition-all flex items-center justify-center cursor-pointer"
                        >−</button>
                        <div className="flex-1 h-10 border border-neutral-200 rounded-xl flex items-center justify-center text-sm font-bold text-brand-dark">
                          {occupants || "—"}
                          {occupants && <span className="text-xs text-neutral-400 font-normal ml-1">{parseInt(occupants) === 1 ? "person" : "people"}</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => setOccupants(String(Math.min(10, parseInt(occupants || "0", 10) + 1)))}
                          className="w-10 h-10 rounded-xl border-2 border-neutral-200 text-neutral-500 font-bold text-lg hover:border-neutral-300 hover:bg-neutral-50 transition-all flex items-center justify-center cursor-pointer"
                        >+</button>
                      </div>
                    </div>

                    {/* Pets */}
                    <div>
                      <label className={labelCls}>Do you have pets? <span className="text-neutral-400 font-normal normal-case tracking-normal">(optional)</span></label>
                      <div className="flex gap-2">
                        {[{ label: "Yes", value: true }, { label: "No", value: false }].map((o) => (
                          <button
                            key={String(o.value)}
                            type="button"
                            onClick={() => setHasPets(hasPets === o.value ? null : o.value)}
                            className={`flex-1 h-10 rounded-xl border-2 text-[11px] font-bold transition-all cursor-pointer ${
                              hasPets === o.value
                                ? "border-brand bg-brand/5 text-brand"
                                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                            }`}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Preferred Contact */}
                    <div>
                      <label className={labelCls}>Preferred Contact <span className="text-neutral-400 font-normal normal-case tracking-normal">(optional)</span></label>
                      <div className="flex gap-2">
                        {[
                          { label: "Phone Call", value: "PHONE" },
                          { label: "Text / SMS", value: "TEXT" },
                          { label: "Email", value: "EMAIL" },
                        ].map((o) => (
                          <button
                            key={o.value}
                            type="button"
                            onClick={() => setPreferredContact(preferredContact === o.value ? "" : o.value)}
                            className={`flex-1 h-10 rounded-xl border-2 text-[10px] font-bold transition-all cursor-pointer ${
                              preferredContact === o.value
                                ? "border-brand bg-brand/5 text-brand"
                                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                            }`}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Form footer */}
              <div className="pt-5 border-t border-neutral-100">
                {errorMsg && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5 mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <p className="text-red-600 text-xs font-medium">{errorMsg}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={loading}
                      className="w-1/3 h-[52px] border-2 border-neutral-200 rounded-xl text-neutral-500 font-bold hover:bg-neutral-50 hover:border-neutral-300 transition-all flex items-center justify-center gap-1 text-sm cursor-pointer"
                    >
                      <ArrowLeft size={14} /> Back
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`h-[52px] bg-brand text-white font-bold rounded-xl hover:bg-brand-hover shadow-md shadow-brand/10 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-60 ${
                      step > 1 ? "w-2/3" : "w-full"
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        {step === 1 ? "Next: Financials" : "Calculate Eligibility"}
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
