"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar, Clock, MapPin, Video, Phone, ArrowRight, Loader2, CheckCircle2,
  User, Mail, Sun, Sunset
} from "lucide-react";
import { getStoredUTMs, getBestKnownCity, getDeviceContext, trackEvent } from "@/lib/tracking";

const API_BASE = "";

interface PropertyInquiryFormProps {
  propertySlug: string;
  propertyTitle: string;
  listingType: string;
  propertyId?: number;
  propertyCity?: string;
}

interface DayOption {
  dayName: string;
  dayNum: number;
  month: string;
  fullDateString: string;
}

const TOUR_TYPES = [
  { id: "in-person", label: "In-Person", icon: MapPin, desc: "Meet on-site" },
  { id: "video", label: "Video Tour", icon: Video, desc: "FaceTime / Zoom" },
  { id: "call", label: "Phone Call", icon: Phone, desc: "Agent call" },
];

const TIME_SLOTS = [
  { id: "morning", label: "Morning", hours: "9:00 AM – 12:00 PM" },
  { id: "afternoon", label: "Afternoon", hours: "1:00 PM – 5:00 PM" },
];

/* ─── Illustrations ─────────────────────────────────────────────────── */

function CalendarIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect x="8" y="18" width="84" height="66" rx="7" stroke="currentColor" strokeWidth="2.5"/>
      <path d="M8 36H92" stroke="currentColor" strokeWidth="2"/>
      <rect x="8" y="18" width="84" height="18" rx="7" fill="currentColor" fillOpacity="0.07"/>
      <line x1="32" y1="10" x2="32" y2="26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="68" y1="10" x2="68" y2="26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="28" cy="53" r="5.5" fill="currentColor"/>
      <circle cx="50" cy="53" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="72" cy="53" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="28" cy="72" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="50" cy="72" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

function SuccessIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 110 90" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M38 10L70 34H60V72H16V34H6L38 10Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      <rect x="31" y="48" width="14" height="24" rx="1.5" stroke="currentColor" strokeWidth="2"/>
      <rect x="17" y="44" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="48" y="44" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="83" cy="35" r="22" fill="white" stroke="currentColor" strokeWidth="2.5"/>
      <path d="M74 35L80 42L93 26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ─── Component ─────────────────────────────────────────────────────── */

export function PropertyInquiryForm({
  propertySlug,
  propertyTitle,
  listingType,
  propertyId,
  propertyCity,
}: PropertyInquiryFormProps) {
  const [step, setStep] = useState(1);
  const [tourType, setTourType] = useState("in-person");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("morning");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [moveInTimeline, setMoveInTimeline] = useState("");
  const [preferredContact, setPreferredContact] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [availableDays, setAvailableDays] = useState<DayOption[]>([]);

  // Generate next 5 days
  useEffect(() => {
    const days: DayOption[] = [];
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 1; i <= 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);

      days.push({
        dayName: daysOfWeek[d.getDay()],
        dayNum: d.getDate(),
        month: months[d.getMonth()],
        fullDateString: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
      });
    }

    setAvailableDays(days);
    if (days.length > 0) {
      setSelectedDate(days[0].fullDateString);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError(null);

    const tourLabel = TOUR_TYPES.find((t) => t.id === tourType)?.label ?? tourType;
    const timeLabel = TIME_SLOTS.find((ts) => ts.id === selectedTimeSlot)?.hours ?? selectedTimeSlot;

    const constructedMessage =
      `Request for Interactive Tour:\n` +
      `- Tour Type: ${tourLabel}\n` +
      `- Preferred Date: ${selectedDate}\n` +
      `- Preferred Time: ${timeLabel}\n\n` +
      (message.trim() ? `User Note: ${message.trim()}` : `I would like to schedule a ${tourLabel.toLowerCase()} tour for this property on ${selectedDate} during the ${selectedTimeSlot}.`);

    try {
      const res = await fetch(`${API_BASE}/api/v1/leads/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          source: "PROPERTY_INQUIRY",
          interest_type: listingType === "for-rent" ? "RENT" : "BUY",
          property_interest: propertyId,
          move_in_timeline: moveInTimeline || undefined,
          preferred_contact: preferredContact || undefined,
          message: constructedMessage + getDeviceContext(),
          services_requested: [propertySlug],
          detected_city: propertyCity || getBestKnownCity() || undefined,
          ...getStoredUTMs(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const detail =
          data && typeof data === "object"
            ? Object.values(data).flat().join(" ")
            : "Something went wrong. Please try again.";
        throw new Error(detail);
      }

      setSuccess(true);
      trackEvent("schedule_tour", {
        property: propertySlug,
        tour_type: tourType,
        date: selectedDate,
        time: selectedTimeSlot,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  /* ── Success State ── */
  if (success) {
    const selectedTourObj = TOUR_TYPES.find((t) => t.id === tourType);
    const selectedTimeSlotObj = TIME_SLOTS.find((ts) => ts.id === selectedTimeSlot);
    return (
      <div className="py-4 px-1">
        <div className="flex flex-col items-center text-center mb-5">
          <SuccessIllustration className="w-28 h-auto text-emerald-600 mb-4" />
          <p className="text-[9px] font-black tracking-[0.3em] uppercase text-emerald-600 mb-1.5">Request Confirmed</p>
          <h4 className="text-brand-dark font-serif text-xl font-bold mb-2">Tour Request Sent!</h4>
          <p className="text-neutral-500 text-xs leading-relaxed max-w-[260px]">
            A rental specialist will review your{" "}
            <strong className="text-brand-dark font-semibold">{selectedTourObj?.label}</strong> request and be in touch shortly.
          </p>
        </div>

        {/* Booking summary */}
        <div className="border border-neutral-200 rounded-2xl overflow-hidden mb-4">
          <div className="bg-neutral-50 px-4 py-2.5 border-b border-neutral-100">
            <p className="text-[9px] font-black tracking-widest uppercase text-neutral-400">Booking Summary</p>
          </div>
          <div className="divide-y divide-neutral-100">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-neutral-400 font-medium">Tour Type</span>
              <span className="font-bold text-brand-dark text-xs flex items-center gap-1.5">
                {selectedTourObj && <selectedTourObj.icon size={12} className="text-brand" />}
                {selectedTourObj?.label}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-neutral-400 font-medium">Preferred Date</span>
              <span className="font-bold text-brand-dark text-xs flex items-center gap-1.5">
                <Calendar size={12} className="text-brand" />
                {selectedDate}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-neutral-400 font-medium">Time Window</span>
              <span className="font-bold text-brand-dark text-xs flex items-center gap-1.5">
                <Clock size={12} className="text-brand" />
                {selectedTimeSlotObj?.label}
              </span>
            </div>
          </div>
        </div>

        {/* Apply nudge — for rental/lease listings, clean card no purple */}
        {(listingType === "for-rent" || listingType === "for-lease") && (
          <div className="border border-brand/20 rounded-2xl overflow-hidden">
            <div className="bg-brand/5 px-4 py-3 border-b border-brand/10">
              <p className="text-[10px] font-black tracking-widest uppercase text-brand mb-0.5">Secure Your Spot</p>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Other applicants are actively viewing this home. Apply now to hold your place.
              </p>
            </div>
            <div className="px-4 py-3">
              <Link
                href={`/apply?property=${propertySlug}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`}
                className="flex items-center justify-center gap-1.5 w-full py-3 bg-brand text-white text-xs font-bold rounded-xl hover:bg-brand-hover transition-all shadow-sm shadow-brand/10 cursor-pointer"
              >
                Start Free Application <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  const labelCls = "block text-[10px] font-black tracking-widest uppercase text-neutral-500 mb-2";
  const inputCls =
    "w-full h-11 pl-10 pr-4 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-800 " +
    "placeholder:text-neutral-400 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 focus:bg-white transition-all font-medium";

  return (
    <div className="space-y-4">

      {/* ── Header with illustration ── */}
      <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
        <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center shrink-0">
          <CalendarIllustration className="w-6 h-6 text-brand" />
        </div>
        <div>
          <p className="text-[9px] font-black tracking-[0.28em] uppercase text-brand mb-0.5">Schedule a Tour</p>
          <p className="text-xs text-neutral-500 leading-tight">Pick a time — a specialist will confirm within hours.</p>
        </div>
      </div>

      {/* ── Step indicator ── */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          {[
            { n: 1, label: "Tour Preferences" },
            { n: 2, label: "Contact Details" },
          ].map(({ n, label }, i) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[9px] font-bold transition-all ${
                step === n
                  ? "bg-brand text-white"
                  : step > n
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-neutral-100 text-neutral-400"
              }`}>
                {step > n ? <CheckCircle2 size={10} /> : <span className="font-black">{n}</span>}
                <span className="hidden sm:inline">{label}</span>
              </div>
              {i < 1 && (
                <div className={`w-5 h-px transition-all ${step > 1 ? "bg-emerald-300" : "bg-neutral-200"}`} />
              )}
            </div>
          ))}
        </div>
        <span className="text-[9px] text-neutral-400 font-bold">
          {step === 1 ? "1 / 2" : "2 / 2"}
        </span>
      </div>

      {step === 1 ? (
        /* ── Step 1: Tour Picker ── */
        <div className="space-y-4">

          {/* Tour type */}
          <div className="space-y-2">
            <label className={labelCls}>Tour Format</label>
            <div className="grid grid-cols-3 gap-2">
              {TOUR_TYPES.map((t) => {
                const Icon = t.icon;
                const isSelected = tourType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTourType(t.id)}
                    className={`flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                      isSelected
                        ? "border-brand bg-brand/5 text-brand"
                        : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? "bg-brand/10" : "bg-neutral-100"}`}>
                      <Icon size={16} className={isSelected ? "text-brand" : "text-neutral-400"} />
                    </div>
                    <span className="text-[10px] font-bold leading-tight block">{t.label}</span>
                    <span className="text-[9px] text-neutral-400 leading-tight">{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date picker */}
          <div className="space-y-2">
            <label className={labelCls}>Preferred Date</label>
            <div className="grid grid-cols-5 gap-1.5">
              {availableDays.map((day) => {
                const isSelected = selectedDate === day.fullDateString;
                return (
                  <button
                    key={day.fullDateString}
                    type="button"
                    onClick={() => setSelectedDate(day.fullDateString)}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-brand border-brand text-white shadow-md shadow-brand/15"
                        : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    <span className={`text-[8px] uppercase tracking-wider font-bold leading-none ${isSelected ? "text-white/75" : "text-neutral-400"}`}>
                      {day.dayName}
                    </span>
                    <span className="text-sm font-black mt-1 leading-none">{day.dayNum}</span>
                    <span className={`text-[8px] mt-1 leading-none font-medium ${isSelected ? "text-white/75" : "text-neutral-400"}`}>
                      {day.month}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slot */}
          <div className="space-y-2">
            <label className={labelCls}>Time Preference</label>
            <div className="grid grid-cols-2 gap-2">
              {TIME_SLOTS.map((ts) => {
                const isSelected = selectedTimeSlot === ts.id;
                const Icon = ts.id === "morning" ? Sun : Sunset;
                return (
                  <button
                    key={ts.id}
                    type="button"
                    onClick={() => setSelectedTimeSlot(ts.id)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-brand bg-brand/5 text-brand"
                        : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? "bg-brand/10" : "bg-neutral-100"}`}>
                      <Icon size={16} className={isSelected ? "text-brand" : "text-neutral-400"} />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold block">{ts.label}</span>
                      <span className="text-[9px] text-neutral-400 block mt-0.5 font-medium">{ts.hours}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full h-11 bg-brand hover:bg-brand-hover text-white font-bold rounded-xl shadow-md shadow-brand/15 transition-all flex items-center justify-center gap-1.5 text-sm cursor-pointer mt-1"
          >
            Continue to Contact <ArrowRight size={15} />
          </button>
        </div>
      ) : (
        /* ── Step 2: Contact Details ── */
        <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
          <div>
            <label htmlFor="inq-name" className={labelCls}>Full Name *</label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                id="inq-name"
                type="text"
                required
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(null); }}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label htmlFor="inq-email" className={labelCls}>Email Address *</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                id="inq-email"
                type="email"
                required
                placeholder="jane@smith.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label htmlFor="inq-phone" className={labelCls}>
              Phone <span className="text-neutral-400 font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <div className="relative">
              <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                id="inq-phone"
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
                  className={`flex-1 h-9 rounded-xl border-2 text-[10px] font-bold transition-all cursor-pointer ${
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

          <div>
            <label htmlFor="inq-message" className={labelCls}>
              Special Notes <span className="text-neutral-400 font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              id="inq-message"
              rows={2}
              placeholder="Accessibility needs, specific questions, or anything else..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-800 placeholder:text-neutral-400 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all resize-none font-medium"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={loading}
              className="w-1/3 h-11 border-2 border-neutral-200 rounded-xl text-neutral-500 font-bold hover:bg-neutral-50 hover:border-neutral-300 transition-all text-xs cursor-pointer"
            >
              Back
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-2/3 h-11 bg-brand hover:bg-brand-hover text-white font-bold rounded-xl shadow-md shadow-brand/15 transition-all flex items-center justify-center gap-1.5 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  Book Appointment
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
