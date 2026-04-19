"use client";

import { useState } from "react";

const SERVICE_OPTIONS = [
  "Studio / 1-Bedroom",
  "2-Bedroom Apartment",
  "3-Bedroom Home",
  "4+ Bedrooms",
  "Pet-Friendly Unit",
  "Short-Term Lease",
  "Furnished Unit",
  "Immediate Move-In",
];

const BUDGET_MAP: Record<string, { min: number | null; max: number | null }> = {
  "Under $800/mo":        { min: 0,    max: 800 },
  "$800 – $1,200/mo":     { min: 800,  max: 1200 },
  "$1,200 – $1,800/mo":   { min: 1200, max: 1800 },
  "$1,800 – $2,500/mo":   { min: 1800, max: 2500 },
  "$2,500+/mo":           { min: 2500, max: null },
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function ContactForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [phone, setPhone]         = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [budget, setBudget]       = useState("Select monthly budget");
  const [message, setMessage]     = useState("");

  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  function toggleService(service: string) {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const budgetRange = BUDGET_MAP[budget] ?? { min: null, max: null };

    const payload: Record<string, unknown> = {
      full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
      email: email.trim(),
      phone: phone.trim(),
      source: "CONTACT_FORM",
      interest_type: "RENT",
      services_requested: selectedServices,
      message: message.trim(),
    };

    if (budgetRange.min !== null) payload.budget_min = budgetRange.min;
    if (budgetRange.max !== null) payload.budget_max = budgetRange.max;

    try {
      const res = await fetch(`${API_BASE}/api/v1/leads/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      setFirstName(""); setLastName(""); setEmail(""); setPhone("");
      setSelectedServices([]); setBudget("Select monthly budget"); setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-serif text-2xl font-bold text-brand-dark mb-2">Inquiry Received!</h3>
        <p className="text-neutral-500 text-sm max-w-sm">
          Thank you for reaching out. One of our rental specialists will be in touch within 24 hours
          to help you find the right home.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-6 text-xs text-brand underline underline-offset-2"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="contact-first-name" className="block text-xs font-semibold tracking-wide text-neutral-500 uppercase mb-2">
            First Name *
          </label>
          <input
            id="contact-first-name"
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Maria"
            className="w-full border border-neutral-200 rounded-sm px-4 py-3 text-sm text-brand-dark outline-none focus:border-brand transition-colors"
          />
        </div>
        <div>
          <label htmlFor="contact-last-name" className="block text-xs font-semibold tracking-wide text-neutral-500 uppercase mb-2">
            Last Name *
          </label>
          <input
            id="contact-last-name"
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Thompson"
            className="w-full border border-neutral-200 rounded-sm px-4 py-3 text-sm text-brand-dark outline-none focus:border-brand transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="contact-email" className="block text-xs font-semibold tracking-wide text-neutral-500 uppercase mb-2">
            Email *
          </label>
          <input
            id="contact-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="maria@example.com"
            className="w-full border border-neutral-200 rounded-sm px-4 py-3 text-sm text-brand-dark outline-none focus:border-brand transition-colors"
          />
        </div>
        <div>
          <label htmlFor="contact-phone" className="block text-xs font-semibold tracking-wide text-neutral-500 uppercase mb-2">
            Phone
          </label>
          <input
            id="contact-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 000-0000"
            className="w-full border border-neutral-200 rounded-sm px-4 py-3 text-sm text-brand-dark outline-none focus:border-brand transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold tracking-wide text-neutral-500 uppercase mb-2">
          I&apos;m looking for
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SERVICE_OPTIONS.map((service) => (
            <label key={service} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedServices.includes(service)}
                onChange={() => toggleService(service)}
                className="w-4 h-4 rounded-sm border border-neutral-300 accent-brand"
              />
              <span className="text-xs text-neutral-600 group-hover:text-brand-dark transition-colors">
                {service}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="contact-budget" className="block text-xs font-semibold tracking-wide text-neutral-500 uppercase mb-2">
          Monthly Budget
        </label>
        <select
          id="contact-budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="w-full border border-neutral-200 rounded-sm px-4 py-3 text-sm text-brand-dark outline-none focus:border-brand transition-colors appearance-none bg-white"
        >
          <option>Select monthly budget</option>
          <option>Under $800/mo</option>
          <option>$800 – $1,200/mo</option>
          <option>$1,200 – $1,800/mo</option>
          <option>$1,800 – $2,500/mo</option>
          <option>$2,500+/mo</option>
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-xs font-semibold tracking-wide text-neutral-500 uppercase mb-2">
          Message
        </label>
        <textarea
          id="contact-message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your rental needs — preferred city, move-in date, must-haves, etc."
          className="w-full border border-neutral-200 rounded-sm px-4 py-3 text-sm text-brand-dark outline-none focus:border-brand transition-colors resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-sm px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand text-white font-medium py-4 rounded-sm hover:bg-brand-hover transition-colors tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Sending…" : "Send Inquiry"}
      </button>
      <p className="text-xs text-neutral-400 text-center">
        We respond within 24 hours. Your information is never shared.
      </p>
    </form>
  );
}
