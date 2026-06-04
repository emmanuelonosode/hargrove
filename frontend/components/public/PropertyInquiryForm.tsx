"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, Loader2, MapPin, Video, Phone,
  Sun, Sunset, User, Mail, ChevronLeft,
} from "lucide-react";
import {
  getStoredUTMs, getStoredReferralCode, getBestKnownCity,
  getDeviceContext, trackEvent,
} from "@/lib/tracking";

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
  { id: "in-person", label: "In-person", desc: "Meet on-site",     Icon: MapPin },
  { id: "video",     label: "Video tour", desc: "FaceTime / Zoom",  Icon: Video  },
  { id: "call",      label: "Phone call", desc: "Agent calls you",  Icon: Phone  },
];

const TIME_SLOTS = [
  { id: "morning",   label: "Morning",   hours: "9 AM ”“ 12 PM", Icon: Sun    },
  { id: "afternoon", label: "Afternoon", hours: "1 ”“ 5 PM",     Icon: Sunset },
];

const TIMELINES = [
  { label: "ASAP",          value: "ASAP"         },
  { label: "1”“3 months",    value: "1_3_MONTHS"   },
  { label: "3”“6 months",    value: "3_6_MONTHS"   },
  { label: "6+ months",     value: "6_PLUS"       },
  { label: "Just browsing", value: "JUST_BROWSING" },
];

const CONTACT_METHODS = [
  { label: "Phone", value: "PHONE" },
  { label: "Text",  value: "TEXT"  },
  { label: "Email", value: "EMAIL" },
];

/* â”€â”€â”€ Shared style tokens â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const labelCls = "block text-[10px] font-semibold tracking-[0.18em] uppercase text-[#475569] mb-2.5";

const inputBaseCls =
  "w-full h-11 bg-white border border-[#E2E8F0] rounded-sm text-[13.5px] text-[#1E3A5F] " +
  "placeholder:text-[#94A3B8] outline-none transition-[border-color,box-shadow] duration-100 " +
  "focus:border-brand focus:ring-2 focus:ring-brand/10";

/* â”€â”€â”€ Step line â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function StepLine({ step, label }: { step: number; label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-[11px] text-[#94A3B8] font-[500]">
      <span className="flex items-center gap-[3px]">
        {[1, 2].map((i) => (
          <span
            key={i}
            className="block h-[2px] w-[18px] rounded-full transition-colors duration-200"
            style={{ background: i <= step ? "#1E3A5F" : "#E2E8F0" }}
          />
        ))}
      </span>
      Step {step} of 2 &middot; {label}
    </div>
  );
}

/* â”€â”€â”€ Header bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function HeaderBar({
  mode,
  eyebrow,
  title,
}: {
  mode: "key" | "check";
  eyebrow: string;
  title: string;
}) {
  return (
    <div
      className="flex gap-3.5 items-center px-[22px] py-[18px] border-b border-[#F1F5F9]"
      style={{ background: "#FBF9F4" }}
    >
      <div className="w-[60px] h-[60px] shrink-0 bg-white border border-[#F1F5F9] rounded-sm overflow-hidden flex items-center justify-center">
        {mode === "key" ? (
          <Image
            src="/illustrations/spot-key.png"
            alt=""
            width={60}
            height={60}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#1E3A5F] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-brand mb-1.5">
          {eyebrow}
        </p>
        <h2 className="font-serif text-[22px] font-bold text-[#1E3A5F] leading-[1.1] m-0">
          {title}
        </h2>
      </div>
    </div>
  );
}

/* â”€â”€â”€ Option card (tour type / date / time / pill) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function OptCard({
  selected,
  onClick,
  children,
  className = "",
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "border rounded-sm cursor-pointer transition-all duration-100 font-sans",
        selected
          ? "bg-[#1E3A5F] border-[#1E3A5F] text-white"
          : "bg-white border-[#E2E8F0] text-[#1E3A5F] hover:border-[#94A3B8]",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/* â”€â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

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
        fullDateString: d.toLocaleDateString("en-US", {
          weekday: "short", month: "short", day: "numeric", year: "numeric",
        }),
      });
    }
    setAvailableDays(days);
    if (days.length > 0) setSelectedDate(days[0].fullDateString);
  }, []);

  const selectedTourObj = TOUR_TYPES.find((t) => t.id === tourType);
  const selectedTimeObj = TIME_SLOTS.find((ts) => ts.id === selectedTimeSlot);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address."); return;
    }

    setLoading(true);
    setError(null);

    const tourLabel = selectedTourObj?.label ?? tourType;
    const timeLabel = selectedTimeObj?.hours ?? selectedTimeSlot;
    const constructedMessage =
      `Request for Interactive Tour:\n` +
      `- Tour Type: ${tourLabel}\n` +
      `- Preferred Date: ${selectedDate}\n` +
      `- Preferred Time: ${timeLabel}\n\n` +
      (message.trim()
        ? `User Note: ${message.trim()}`
        : `I would like to schedule a ${tourLabel.toLowerCase()} tour for this property on ${selectedDate} during the ${selectedTimeSlot}.`);

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
          referral_code: getStoredReferralCode() || undefined,
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

  /* â”€â”€ Success â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  if (success) {
    return (
      <div className="bg-white border border-[#F1F5F9] rounded-sm shadow-[0_1px_3px_rgba(30,58,95,0.04)] overflow-hidden">
        <HeaderBar mode="check" eyebrow="Request Confirmed" title="Tour request sent." />

        <div className="p-[22px] flex flex-col gap-[18px]">
          <p className="text-[13px] leading-[1.55] text-[#475569] m-0">
            A specialist will review your{" "}
            <strong className="text-[#1E3A5F] font-semibold">
              {selectedTourObj?.label.toLowerCase()}
            </strong>{" "}
            request and be in touch within 24 hours.
          </p>

          {/* Booking summary */}
          <div className="border border-[#F1F5F9] rounded-sm overflow-hidden">
            <div className="px-3.5 py-2 bg-white border-b border-[#F1F5F9]">
              <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-[#94A3B8] m-0">
                Booking Summary
              </p>
            </div>
            <div style={{ background: "#FBF9F4" }}>
              {[
                { k: "Tour format",  v: selectedTourObj?.label,                             Icon: selectedTourObj?.Icon },
                { k: "Date",         v: selectedDate.replace(/,\s\d{4}$/, ""),              Icon: undefined              },
                { k: "Time window",  v: `${selectedTimeObj?.label} Â· ${selectedTimeObj?.hours}`, Icon: selectedTimeObj?.Icon },
              ].map((row, i) => (
                <div
                  key={row.k}
                  className="flex items-center justify-between px-3.5 py-[11px]"
                  style={{ borderTop: i ? "1px solid #F1F5F9" : "none" }}
                >
                  <span className="text-[12px] text-[#64748B]">{row.k}</span>
                  <span className="text-[12.5px] font-semibold text-[#1E3A5F] flex items-center gap-1.5">
                    {row.Icon && <row.Icon size={12} className="text-brand" />}
                    {row.v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Apply nudge */}
          {(listingType === "for-rent" || listingType === "for-lease") && (
            <div className="border border-[#DBEAFE] rounded-sm p-4" style={{ background: "#EFF4FF" }}>
              <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-brand mb-1.5">
                Secure Your Spot
              </p>
              <p className="text-[12.5px] text-[#475569] leading-[1.55] mb-3">
                Other applicants are viewing this home. Apply now to hold your place.
              </p>
              <Link
                href={`/apply?property=${propertySlug}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`}
                className="flex items-center justify-center gap-2 w-full h-12 bg-brand hover:bg-brand-hover text-white text-[14px] font-[500] rounded-sm tracking-[0.05em] transition-colors duration-150"
              >
                Start free application
                <ArrowRight size={15} />
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => { setSuccess(false); setStep(1); setName(""); setEmail(""); setPhone(""); setMoveInTimeline(""); setPreferredContact(""); setMessage(""); }}
            className="self-center text-[12px] text-[#475569] bg-transparent border-none cursor-pointer underline"
          >
            Book another viewing
          </button>
        </div>
      </div>
    );
  }

  /* â”€â”€ Step 2: Contact details â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  if (step === 2) {
    const canSubmit = name.trim().length > 0 && /^\S+@\S+\.\S+$/.test(email);
    return (
      <div className="bg-white border border-[#F1F5F9] rounded-sm shadow-[0_1px_3px_rgba(30,58,95,0.04)] overflow-hidden">
        <HeaderBar mode="key" eyebrow="Schedule a Tour" title="Tell us how to reach you." />

        <form onSubmit={handleSubmit} noValidate className="p-[22px] flex flex-col gap-[18px]">
          <StepLine step={2} label="Your details" />

          {/* Name */}
          <div>
            <label htmlFor="sv-name" className={labelCls}>Full name</label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
              <input
                id="sv-name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(null); }}
                placeholder="Jane Smith"
                className={inputBaseCls + " pl-9 pr-3"}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="sv-email" className={labelCls}>Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
              <input
                id="sv-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                placeholder="jane@smith.com"
                className={inputBaseCls + " pl-9 pr-3"}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="sv-phone" className={labelCls}>
              Phone{" "}
              <span className="text-[#94A3B8] normal-case font-normal tracking-normal">
                optional
              </span>
            </label>
            <div className="relative">
              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
              <input
                id="sv-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 000-0000"
                className={inputBaseCls + " pl-9 pr-3"}
              />
            </div>
          </div>

          {/* Timeline */}
          <div>
            <span className={labelCls}>
              Move-in timeline{" "}
              <span className="text-[#94A3B8] normal-case font-normal tracking-normal">optional</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {TIMELINES.map((o) => (
                <OptCard
                  key={o.value}
                  selected={moveInTimeline === o.value}
                  onClick={() => setMoveInTimeline(moveInTimeline === o.value ? "" : o.value)}
                  className="px-3 py-[7px] text-[12px] font-[500]"
                >
                  {o.label}
                </OptCard>
              ))}
            </div>
          </div>

          {/* Preferred contact */}
          <div>
            <span className={labelCls}>
              Preferred contact{" "}
              <span className="text-[#94A3B8] normal-case font-normal tracking-normal">optional</span>
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {CONTACT_METHODS.map((o) => (
                <OptCard
                  key={o.value}
                  selected={preferredContact === o.value}
                  onClick={() => setPreferredContact(preferredContact === o.value ? "" : o.value)}
                  className="py-[7px] text-[12px] font-[500] text-center"
                >
                  {o.label}
                </OptCard>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="sv-notes" className={labelCls}>
              Anything else?{" "}
              <span className="text-[#94A3B8] normal-case font-normal tracking-normal">optional</span>
            </label>
            <textarea
              id="sv-notes"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Accessibility needs, specific questions, or anything else…"
              rows={2}
              className={
                "w-full px-3 py-2.5 bg-white border border-[#E2E8F0] rounded-sm " +
                "text-[13px] text-[#1E3A5F] placeholder:text-[#94A3B8] outline-none resize-none " +
                "leading-[1.5] transition-[border-color,box-shadow] duration-100 " +
                "focus:border-brand focus:ring-2 focus:ring-brand/10"
              }
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-sm px-3.5 py-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <p className="text-xs text-red-600 font-medium m-0">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="grid gap-2.5 mt-1" style={{ gridTemplateColumns: "90px 1fr" }}>
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={loading}
              className="flex items-center justify-center gap-1 h-12 bg-white border border-[#E2E8F0] rounded-sm text-[#1E3A5F] text-[13px] font-[500] hover:border-[#94A3B8] transition-colors duration-100 cursor-pointer"
            >
              <ChevronLeft size={14} />
              Back
            </button>
            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="flex items-center justify-center gap-2 h-12 bg-[#1E3A5F] hover:bg-brand text-white text-[14px] font-[500] rounded-sm tracking-[0.05em] transition-colors duration-150 cursor-pointer disabled:bg-[#CBD5E1] disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Booking…
                </>
              ) : (
                <>
                  Book appointment
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  /* â”€â”€ Step 1: Tour preferences â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  return (
    <div className="bg-white border border-[#F1F5F9] rounded-sm shadow-[0_1px_3px_rgba(30,58,95,0.04)] overflow-hidden">
      <HeaderBar mode="key" eyebrow="Schedule a Tour" title="Pick a time to visit." />

      <div className="p-[22px] flex flex-col gap-[22px]">
        <StepLine step={1} label="Tour preferences" />

        {/* Tour format */}
        <div>
          <span className={labelCls}>Tour format</span>
          <div className="grid grid-cols-3 gap-2">
            {TOUR_TYPES.map((t) => {
              const selected = tourType === t.id;
              return (
                <OptCard
                  key={t.id}
                  selected={selected}
                  onClick={() => setTourType(t.id)}
                  className="flex flex-col items-center gap-2 py-3.5 px-2 text-center"
                >
                  <t.Icon size={19} color={selected ? "#fff" : "#1E3A5F"} strokeWidth={1.8} />
                  <div className="flex flex-col gap-0.5">
                    <span
                      className="text-[12px] font-semibold leading-[1.15]"
                      style={{ color: selected ? "#fff" : "#1E3A5F" }}
                    >
                      {t.label}
                    </span>
                    <span
                      className="text-[10px] leading-[1.2] font-normal"
                      style={{ color: selected ? "rgba(255,255,255,0.7)" : "#94A3B8" }}
                    >
                      {t.desc}
                    </span>
                  </div>
                </OptCard>
              );
            })}
          </div>
        </div>

        {/* Date picker */}
        <div>
          <span className={labelCls}>
            Preferred date{" "}
            <span className="text-[#94A3B8] normal-case font-normal tracking-normal text-[10px]">
              amber dot = soonest
            </span>
          </span>
          <div className="grid grid-cols-5 gap-1.5">
            {availableDays.map((day, idx) => {
              const selected = selectedDate === day.fullDateString;
              return (
                <OptCard
                  key={day.fullDateString}
                  selected={selected}
                  onClick={() => setSelectedDate(day.fullDateString)}
                  className="flex flex-col items-center gap-0.5 pt-2.5 pb-2 relative"
                >
                  {/* Amber dot for soonest available */}
                  {idx === 0 && (
                    <span
                      className="absolute top-1 right-1.5 w-[5px] h-[5px] rounded-full"
                      style={{ background: selected ? "#F4C77A" : "#E8A33C" }}
                    />
                  )}
                  <span
                    className="text-[9px] font-semibold tracking-[0.12em] uppercase leading-none"
                    style={{ color: selected ? "rgba(255,255,255,0.7)" : "#94A3B8" }}
                  >
                    {day.dayName}
                  </span>
                  <span
                    className="font-serif text-[22px] font-bold leading-[1]"
                    style={{ color: selected ? "#fff" : "#1E3A5F" }}
                  >
                    {day.dayNum}
                  </span>
                  <span
                    className="text-[9px] font-[500] leading-none"
                    style={{ color: selected ? "rgba(255,255,255,0.55)" : "#94A3B8" }}
                  >
                    {day.month}
                  </span>
                </OptCard>
              );
            })}
          </div>
        </div>

        {/* Time of day */}
        <div>
          <span className={labelCls}>Time of day</span>
          <div className="grid grid-cols-2 gap-2">
            {TIME_SLOTS.map((ts) => {
              const selected = selectedTimeSlot === ts.id;
              const accentColor = ts.id === "morning" ? "#E8A33C" : "#C97757";
              return (
                <OptCard
                  key={ts.id}
                  selected={selected}
                  onClick={() => setSelectedTimeSlot(ts.id)}
                  className="flex items-center gap-3 px-3.5 py-3 text-left"
                >
                  <ts.Icon
                    size={21}
                    color={selected ? "#fff" : accentColor}
                    strokeWidth={1.8}
                  />
                  <div className="flex flex-col gap-0.5">
                    <span
                      className="text-[13px] font-semibold leading-[1.15]"
                      style={{ color: selected ? "#fff" : "#1E3A5F" }}
                    >
                      {ts.label}
                    </span>
                    <span
                      className="text-[10.5px] leading-none"
                      style={{ color: selected ? "rgba(255,255,255,0.65)" : "#94A3B8" }}
                    >
                      {ts.hours}
                    </span>
                  </div>
                </OptCard>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={() => setStep(2)}
          className="flex items-center justify-center gap-2 w-full h-12 bg-[#1E3A5F] hover:bg-brand text-white text-[14px] font-[500] rounded-sm tracking-[0.05em] transition-colors duration-150 cursor-pointer"
        >
          Continue to contact
          <ArrowRight size={15} />
        </button>

        <p className="text-[11px] text-[#94A3B8] text-center m-0 leading-[1.55]">
          A specialist will confirm within 24 hours.
        </p>
      </div>
    </div>
  );
}
