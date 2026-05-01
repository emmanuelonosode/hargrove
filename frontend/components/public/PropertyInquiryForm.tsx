"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getStoredUTMs, getBestKnownCity, trackEvent } from "@/lib/tracking";

const API_BASE = "";

interface PropertyInquiryFormProps {
  propertySlug: string;
  propertyTitle: string;
  listingType: string;
}

export function PropertyInquiryForm({
  propertySlug,
  propertyTitle,
  listingType,
}: PropertyInquiryFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
          message:
            message.trim() ||
            `I'm interested in "${propertyTitle}" and would like to schedule a viewing.`,
          services_requested: [propertySlug],
          detected_city: getBestKnownCity() || undefined,
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
      trackEvent("generate_lead", { property: propertySlug });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-white font-semibold mb-1">Inquiry Sent!</p>
        <p className="text-blue-100 text-xs leading-relaxed">
          A rental specialist will contact you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <div>
        <label htmlFor="inq-name" className="sr-only">Your Name</label>
        <input
          id="inq-name"
          type="text"
          required
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-sm px-3 py-2.5 text-sm text-white placeholder:text-white/50 outline-none focus:border-brand transition-colors"
        />
      </div>
      <div>
        <label htmlFor="inq-email" className="sr-only">Email Address</label>
        <input
          id="inq-email"
          type="email"
          required
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-sm px-3 py-2.5 text-sm text-white placeholder:text-white/50 outline-none focus:border-brand transition-colors"
        />
      </div>
      <div>
        <label htmlFor="inq-phone" className="sr-only">Phone Number</label>
        <input
          id="inq-phone"
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-sm px-3 py-2.5 text-sm text-white placeholder:text-white/50 outline-none focus:border-brand transition-colors"
        />
      </div>
      <div>
        <label htmlFor="inq-message" className="sr-only">Message</label>
        <textarea
          id="inq-message"
          rows={3}
          placeholder="I'm interested in this property and would like to schedule a viewing..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-sm px-3 py-2.5 text-sm text-white placeholder:text-white/50 outline-none focus:border-brand transition-colors resize-none"
        />
      </div>

      {error && (
        <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-sm px-3 py-2">
          {error}
        </p>
      )}

      <Button
        variant="accent"
        className="w-full"
        type="submit"
        disabled={loading}
      >
        {loading ? "Sending…" : "Send Inquiry"}
      </Button>

      {(listingType === "for-rent" || listingType === "for-lease") && (
        <Button variant="outline-white" className="w-full" type="button" asChild>
          <Link href={`/apply?property=${propertySlug}`} className="flex items-center gap-2">
            <Calendar size={14} />
            Apply to Rent
          </Link>
        </Button>
      )}
    </form>
  );
}
