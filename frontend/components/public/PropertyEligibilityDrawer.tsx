"use client";

import { useEffect, useRef, useState } from "react";
import {
  X, User, Mail, Phone, DollarSign, CreditCard,
  CheckCircle2, AlertTriangle, Loader2, ArrowRight,
  TrendingUp, Building2, HelpCircle, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { getStoredUTMs, getBestKnownCity, trackEvent } from "@/lib/tracking";

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
  const [income, setIncome] = useState("");
  const [credit, setCredit] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
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
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!income) { setErrorMsg("Please enter your monthly income."); return; }
      if (!credit) { setErrorMsg("Please select your credit range."); return; }
      
      setLoading(true);
      setErrorMsg("");
      
      try {
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
          message: `Eligibility Assessment for "${propertyTitle}":\n` + 
                   `- Monthly Gross Income: $${parsedIncome.toLocaleString()}\n` +
                   `- Credit Range: ${CREDIT_OPTIONS.find(o => o.value === credit)?.label ?? credit}\n` +
                   `- Pre-Qualified Status: ${passesIncomeRatio ? "YES" : "NO"} (Rent is $${propertyPrice.toLocaleString()}/mo, 3x rent is $${(propertyPrice * 3).toLocaleString()}/mo)`,
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

  function handleBack() {
    setErrorMsg("");
    setStep(s => Math.max(1, s - 1));
  }

  function handleClose() {
    if (!loading) {
      onClose();
      // Small delay to reset fields after transition ends
      setTimeout(() => {
        setStep(1);
        setName("");
        setEmail("");
        setPhone("");
        setIncome("");
        setCredit("");
        setErrorMsg("");
      }, 350);
    }
  }

  const inputCls =
    "w-full h-[58px] border-2 border-neutral-200 rounded-xl pl-11 pr-4 text-brand-dark text-base " +
    "placeholder:text-neutral-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all bg-white";

  const labelCls = "block text-sm font-bold text-brand-dark mb-2";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        aria-hidden="true"
        className={`fixed inset-0 z-50 bg-brand-dark/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pre-Qualification Check"
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[500px] bg-[#F9FAFB] shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="bg-white px-7 pt-7 pb-5 border-b border-neutral-100 shrink-0 flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1 bg-brand/10 text-brand text-[10px] font-bold tracking-[0.25em] uppercase px-2.5 py-1 rounded-full mb-2">
              <TrendingUp size={10} /> Smart Qualification
            </span>
            <h2 className="font-serif text-xl font-bold text-brand-dark leading-snug">
              Check Your Eligibility
            </h2>
            <p className="text-[11px] text-neutral-400 mt-1">
              Find out in 30 seconds if you meet the requirements for this home.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close panel"
            className="shrink-0 w-9 h-9 flex items-center justify-center border border-neutral-200 rounded-xl text-neutral-400 hover:text-brand-dark hover:border-neutral-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress Bar */}
        {step < 3 && (
          <div className="h-1 bg-neutral-100 w-full shrink-0">
            <div
              className="h-full bg-brand transition-all duration-300"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-6">
          {step === 3 ? (
            <div className="flex flex-col h-full justify-between">
              {passesIncomeRatio ? (
                /* SUCCESS STATE */
                <div className="space-y-6 py-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-lg shadow-emerald-100">
                    <CheckCircle2 size={32} className="text-emerald-500 animate-bounce" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black tracking-widest uppercase text-emerald-600 mb-1">Pre-Qualification Met</p>
                    <h3 className="font-serif text-2xl font-bold text-[#062F16] leading-tight">
                      Excellent News, {name.split(" ")[0]}!
                    </h3>
                  </div>
                  
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 space-y-4">
                    <p className="text-sm text-emerald-800 leading-relaxed">
                      Your gross monthly income of <strong className="font-bold text-emerald-950">${parsedIncome.toLocaleString()}</strong> is <strong className="font-bold text-emerald-950">{(parsedIncome / propertyPrice).toFixed(1)}x</strong> the rent amount. This comfortably exceeds our standard <strong>3x rent income guideline</strong> (${(propertyPrice * 3).toLocaleString()}/mo).
                    </p>
                    <div className="h-px bg-emerald-100/60" />
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm text-emerald-600">
                        <Building2 size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-neutral-400 leading-none">Property Rent</p>
                        <p className="text-[14px] font-bold text-neutral-700 mt-1">{formatPrice(propertyPrice)}/mo</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-[13px] text-neutral-500 leading-relaxed">
                    We recommend finalizing your rental application today. Properties of this caliber in {propertyCity} lease quickly.
                  </p>
                </div>
              ) : (
                /* NOT ELIGIBLE / LOW INCOME STATE */
                <div className="space-y-6 py-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-lg shadow-amber-100">
                    <AlertTriangle size={32} className="text-amber-500 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black tracking-widest uppercase text-amber-700 mb-1">Alternative Path Available</p>
                    <h3 className="font-serif text-2xl font-bold text-amber-950 leading-tight">
                      Let&apos;s Review Your Options
                    </h3>
                  </div>
                  
                  <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-5 space-y-4">
                    <p className="text-sm text-amber-900 leading-relaxed">
                      Standard guidelines require a monthly income of <strong className="font-semibold">${(propertyPrice * 3).toLocaleString()}</strong> (3x the rent). Your current income of <strong>${parsedIncome.toLocaleString()}</strong> is slightly below this.
                    </p>
                    <div className="h-px bg-amber-200/40" />
                    <p className="text-xs text-amber-800/80 leading-relaxed">
                      <strong>Don&apos;t worry!</strong> You can still qualify by applying with a co-signer / guarantor, prepaying additional months upfront, or using a housing voucher. Alternatively, we have excellent homes matching your budget.
                    </p>
                  </div>

                  <div className="bg-white border border-neutral-100 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                    <HelpCircle size={16} className="text-neutral-400 shrink-0" />
                    <p className="text-[12px] text-neutral-500 leading-normal">
                      Recommended budget limit: <strong className="text-neutral-700 font-bold">{formatPrice(recommendedMaxRent)}/mo</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="pt-6 border-t border-neutral-100 bg-white -mx-7 px-7 pb-4">
                {passesIncomeRatio ? (
                  <Link
                    href={`/apply?property=${propertySlug}`}
                    onClick={onClose}
                    className="w-full flex items-center justify-center gap-2 bg-brand text-white font-bold py-4 rounded-xl hover:bg-brand-hover shadow-lg shadow-brand/20 transition-all text-sm cursor-pointer"
                  >
                    Apply Free — Fast Decision <ArrowRight size={16} />
                  </Link>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href={`/homes-for-rent?maxPrice=${recommendedMaxRent}`}
                      onClick={onClose}
                      className="w-full flex items-center justify-center gap-2 bg-brand text-white font-bold py-4 rounded-xl hover:bg-brand-hover shadow-lg shadow-brand/20 transition-all text-sm cursor-pointer"
                    >
                      View Homes Under {formatPrice(recommendedMaxRent)}/mo <ArrowRight size={16} />
                    </Link>
                    <Link
                      href={`/apply?property=${propertySlug}`}
                      onClick={onClose}
                      className="w-full flex items-center justify-center gap-2 border-2 border-brand-dark text-brand-dark font-bold py-3.5 rounded-xl hover:bg-brand-dark hover:text-white transition-all text-sm cursor-pointer"
                    >
                      Apply Anyway with Co-Signer
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* WIZARD FORM */
            <form onSubmit={handleCalculate} className="space-y-5 flex flex-col h-full justify-between">
              <div className="space-y-5">
                {step === 1 ? (
                  /* STEP 1: CONTACT DETAILS */
                  <>
                    <p className="text-sm text-neutral-500 mb-2 leading-relaxed">
                      Let&apos;s start with your contact details so we can match your profile to this listing.
                    </p>
                    
                    <div>
                      <label className={labelCls}>Full Name *</label>
                      <div className="relative">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
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
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
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
                      <label className={labelCls}>Phone Number (Optional)</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                        <input
                          type="tel"
                          placeholder="(555) 000-0000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  /* STEP 2: FINANCIAL DETAILS */
                  <>
                    <p className="text-sm text-neutral-500 mb-2 leading-relaxed">
                      Your financial details will only be used to run the eligibility calculation. No credit check will be run.
                    </p>
                    
                    <div>
                      <label className={labelCls}>Gross Monthly Income *</label>
                      <div className="relative">
                        <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                        <input
                          ref={firstFieldRef}
                          type="text"
                          required
                          placeholder="5,000"
                          value={income}
                          onChange={(e) => {
                            // Only allow numbers and a comma
                            const clean = e.target.value.replace(/[^0-9]/g, "");
                            setIncome(clean ? parseInt(clean, 10).toLocaleString("en-US") : "");
                            setErrorMsg("");
                          }}
                          className={inputCls}
                        />
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1.5">
                        Before tax. Includes salary, child support, vouchers, or other assistance.
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
                            className={`h-[52px] rounded-xl border-2 text-sm font-semibold transition-all flex items-center justify-center ${
                              credit === o.value
                                ? "border-brand bg-brand/5 text-brand"
                                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                            }`}
                          >
                            <CreditCard size={14} className="mr-1.5 opacity-60" />
                            {o.label.split(" ")[0]} {o.label.includes("(") ? o.label.substring(o.label.indexOf("(")) : ""}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-6 border-t border-neutral-100 bg-white -mx-7 px-7 pb-4">
                {errorMsg && (
                  <p className="text-red-500 text-xs mb-3 flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    {errorMsg}
                  </p>
                )}
                
                <div className="flex gap-3">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={loading}
                      className="w-1/3 h-[54px] border-2 border-neutral-200 rounded-xl text-neutral-500 font-bold hover:bg-neutral-50 hover:border-neutral-300 transition-all flex items-center justify-center gap-1 text-sm"
                    >
                      <ArrowLeft size={15} /> Back
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`h-[54px] bg-brand text-white font-bold rounded-xl hover:bg-brand-hover shadow-md shadow-brand/10 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer ${
                      step > 1 ? "w-2/3" : "w-full"
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        {step === 1 ? "Next: Financials" : "Calculate Eligibility"}
                        <ArrowRight size={16} />
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
