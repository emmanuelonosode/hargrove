"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar, Clock, MapPin, Video, Phone, ArrowRight, Loader2, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getStoredUTMs, getBestKnownCity, trackEvent } from "@/lib/tracking";

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
  { id: "in-person", label: "In-Person", icon: MapPin, desc: "Meet an agent on-site" },
  { id: "video", label: "Video Tour", icon: Video, desc: "Live walkthrough via FaceTime/Zoom" },
  { id: "call", label: "Phone Consult", icon: Phone, desc: "15-min call to discuss details" },
];

const TIME_SLOTS = [
  { id: "morning", label: "Morning", hours: "9:00 AM – 12:00 PM" },
  { id: "afternoon", label: "Afternoon", hours: "1:00 PM – 5:00 PM" },
];

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
      
      // Skip Sundays if standard business rule, but let's keep all for flexibility unless it's Sunday
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
          message: constructedMessage,
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

  if (success) {
    const selectedTourObj = TOUR_TYPES.find((t) => t.id === tourType);
    const selectedTimeSlotObj = TIME_SLOTS.find((ts) => ts.id === selectedTimeSlot);
    return (
      <div className="text-center py-8 px-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
          <CheckCircle2 size={28} className="text-emerald-400 animate-bounce" />
        </div>
        <h4 className="text-white font-serif text-lg font-bold mb-1">Tour Requested!</h4>
        <p className="text-blue-100 text-xs leading-relaxed max-w-xs mx-auto mb-5">
          Your request for a <strong className="text-white font-semibold">{selectedTourObj?.label}</strong> tour has been sent. A rental specialist will confirm your time shortly!
        </p>
        
        {/* Booking Summary Card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left space-y-2.5 max-w-xs mx-auto text-xs text-white/90">
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <span className="text-white/50 font-medium">Tour Type</span>
            <span className="font-bold flex items-center gap-1">
              {selectedTourObj && <selectedTourObj.icon size={12} />}
              {selectedTourObj?.label}
            </span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <span className="text-white/50 font-medium">Date</span>
            <span className="font-bold">{selectedDate}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/50 font-medium">Time Window</span>
            <span className="font-bold">{selectedTimeSlotObj?.hours.split(" ")[0]} {selectedTimeSlotObj?.hours.split(" ").slice(-1)[0]} Preference</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Step Indicators */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">
          Step {step} of 2: {step === 1 ? "Select Tour Details" : "Contact Information"}
        </span>
        <div className="flex gap-1">
          <div className={`w-6 h-1 rounded-full transition-all duration-300 ${step >= 1 ? "bg-accent" : "bg-white/20"}`} />
          <div className={`w-6 h-1 rounded-full transition-all duration-300 ${step >= 2 ? "bg-accent" : "bg-white/20"}`} />
        </div>
      </div>

      {step === 1 ? (
        /* STEP 1: INTERACTIVE TOUR PICKER */
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Tour Types Grid */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-white/80">1. Select Tour Type</label>
            <div className="grid grid-cols-3 gap-2">
              {TOUR_TYPES.map((t) => {
                const Icon = t.icon;
                const isSelected = tourType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTourType(t.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-accent border-accent text-brand-dark font-bold shadow-md shadow-accent/20"
                        : "bg-white/5 border-white/15 text-white hover:bg-white/10 hover:border-white/25"
                    }`}
                  >
                    <Icon size={18} className={`mb-1.5 ${isSelected ? "text-brand-dark" : "text-blue-300"}`} />
                    <span className="text-[11px] leading-tight block font-medium">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Picker Grid */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-white/80">2. Select Preferred Date</label>
            <div className="grid grid-cols-5 gap-1.5">
              {availableDays.map((day) => {
                const isSelected = selectedDate === day.fullDateString;
                return (
                  <button
                    key={day.fullDateString}
                    type="button"
                    onClick={() => setSelectedDate(day.fullDateString)}
                    className={`flex flex-col items-center justify-center py-2 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-accent border-accent text-brand-dark font-bold shadow-sm shadow-accent/25"
                        : "bg-white/5 border-white/15 text-white hover:bg-white/10"
                    }`}
                  >
                    <span className="text-[9px] uppercase tracking-wider opacity-60 leading-none">{day.dayName}</span>
                    <span className="text-sm font-extrabold mt-1 leading-none">{day.dayNum}</span>
                    <span className="text-[9px] opacity-70 mt-1 leading-none">{day.month}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slot Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-white/80">3. Select Time Preference</label>
            <div className="grid grid-cols-2 gap-2">
              {TIME_SLOTS.map((ts) => {
                const isSelected = selectedTimeSlot === ts.id;
                return (
                  <button
                    key={ts.id}
                    type="button"
                    onClick={() => setSelectedTimeSlot(ts.id)}
                    className={`flex flex-col py-2 px-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-accent border-accent text-brand-dark shadow-sm shadow-accent/20 font-bold"
                        : "bg-white/5 border-white/15 text-white hover:bg-white/10"
                    }`}
                  >
                    <span className={`text-[11px] leading-tight font-bold uppercase tracking-wider ${isSelected ? "text-brand-dark" : "text-accent"}`}>
                      {ts.label}
                    </span>
                    <span className={`text-[10px] mt-0.5 leading-none opacity-80 ${isSelected ? "text-brand-dark/95" : "text-neutral-300"}`}>
                      {ts.hours}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full h-12 bg-accent hover:bg-accent-hover text-brand-dark font-bold rounded-xl shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-1.5 text-sm cursor-pointer mt-4"
          >
            Continue to Schedule <ArrowRight size={15} />
          </button>
        </div>
      ) : (
        /* STEP 2: CONTACT DETAILS */
        <form onSubmit={handleSubmit} noValidate className="space-y-3 animate-in fade-in duration-200">
          <div>
            <label htmlFor="inq-name" className="sr-only">Your Name</label>
            <input
              id="inq-name"
              type="text"
              required
              placeholder="Your Full Name *"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(null); }}
              className="w-full h-11 bg-white/10 border border-white/20 rounded-xl px-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all"
            />
          </div>
          
          <div>
            <label htmlFor="inq-email" className="sr-only">Email Address</label>
            <input
              id="inq-email"
              type="email"
              required
              placeholder="Email Address *"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              className="w-full h-11 bg-white/10 border border-white/20 rounded-xl px-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all"
            />
          </div>
          
          <div>
            <label htmlFor="inq-phone" className="sr-only">Phone Number</label>
            <input
              id="inq-phone"
              type="tel"
              placeholder="Phone Number (Optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-11 bg-white/10 border border-white/20 rounded-xl px-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all"
            />
          </div>
          
          <div>
            <label htmlFor="inq-message" className="sr-only">Special Notes</label>
            <textarea
              id="inq-message"
              rows={2}
              placeholder="Special requests or notes (optional)..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={loading}
              className="w-1/3 h-12 border border-white/20 rounded-xl text-white font-bold hover:bg-white/5 transition-all text-xs"
            >
              Back
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 h-12 bg-accent hover:bg-accent-hover text-brand-dark font-bold rounded-xl shadow-lg shadow-accent/25 transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  Book Tour
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </div>

          {(listingType === "for-rent" || listingType === "for-lease") && (
            <div className="pt-2 text-center">
              <span className="text-[10px] text-white/40 mr-1">Ready to rent immediately?</span>
              <Link 
                href={`/apply?property=${propertySlug}`} 
                className="text-[10px] text-accent font-bold hover:underline"
              >
                Apply Direct
              </Link>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
