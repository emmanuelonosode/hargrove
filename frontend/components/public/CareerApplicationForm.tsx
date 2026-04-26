"use client";

import { useState } from "react";
import { Send, CheckCircle, AlertCircle, Loader2, ChevronDown } from "lucide-react";

interface RoleField {
  name: string;
  label: string;
  type: "text" | "url" | "select";
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

const roleExtraFields: Record<string, RoleField[]> = {
  "real-estate-agent": [
    {
      name: "license_status",
      label: "Virginia License Status",
      type: "select",
      required: true,
      options: [
        "I have an active Virginia real estate license",
        "I'm willing to obtain one within 90 days",
        "I hold a license in another state",
      ],
    },
  ],
  "leasing-consultant": [
    {
      name: "experience",
      label: "Years of Customer Service / Sales Experience",
      type: "select",
      required: true,
      options: ["Less than 1 year", "1–2 years", "3–5 years", "5+ years"],
    },
  ],
  "property-manager": [
    {
      name: "pm_years",
      label: "Years of Property Management Experience",
      type: "select",
      required: true,
      options: ["1–2 years", "3–5 years", "5–10 years", "10+ years"],
    },
  ],
  "marketing-coordinator": [
    {
      name: "portfolio_url",
      label: "Portfolio or Website URL (optional)",
      type: "url",
      placeholder: "https://yourportfolio.com",
      required: false,
    },
  ],
  "maintenance-technician": [
    {
      name: "certifications",
      label: "Relevant Certifications",
      type: "text",
      placeholder: "e.g., EPA 608, HVAC Type II, CPO…",
      required: false,
    },
  ],
  "tenant-relations-specialist": [
    {
      name: "cs_years",
      label: "Years of Customer-Facing Experience",
      type: "select",
      required: true,
      options: ["Less than 1 year", "1–2 years", "3–5 years", "5+ years"],
    },
  ],
};

interface Props {
  roleId: string;
  roleTitle: string;
}

export function CareerApplicationForm({ roleId, roleTitle }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const extraFields = roleExtraFields[roleId] ?? [];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const fd = new FormData(e.currentTarget);

    const name = fd.get("name") as string;
    const email = fd.get("email") as string;
    const phone = fd.get("phone") as string;
    const linkedin = fd.get("linkedin") as string;
    const message = fd.get("message") as string;

    // Build extra field lines for the message body
    const extraLines = extraFields
      .map((f) => {
        const val = fd.get(f.name) as string;
        return val ? `${f.label}: ${val}` : null;
      })
      .filter(Boolean)
      .join("\n");

    const fullMessage = [
      `=== CAREER APPLICATION ===`,
      `Position: ${roleTitle}`,
      extraLines,
      linkedin ? `LinkedIn / Portfolio: ${linkedin}` : null,
      ``,
      `Cover Note:`,
      message,
    ]
      .filter((l) => l !== null)
      .join("\n");

    try {
      const res = await fetch("/api/v1/leads/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: name,
          email,
          phone,
          source: "CONTACT_FORM",
          interest_type: "RENT",
          message: fullMessage,
          services_requested: [`Career Application — ${roleTitle}`],
          preferred_location: "Virginia Beach, VA",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const detail =
          typeof data === "object"
            ? Object.values(data).flat().join(" ")
            : "Something went wrong. Please try again.";
        throw new Error(detail);
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="mt-6 rounded-sm bg-green-50 border border-green-200 px-6 py-5 flex items-start gap-4">
        <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-green-800 text-sm">Application received!</p>
          <p className="text-green-700 text-sm mt-1 leading-relaxed">
            Thanks for applying for <strong>{roleTitle}</strong>. We review every application and
            will be in touch within 2–3 business days if there&apos;s a fit.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 border-t border-neutral-100 pt-6">
      {/* Toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2.5 bg-brand-dark text-white text-sm font-semibold px-7 py-3.5 rounded-sm hover:bg-brand transition-colors duration-200 group"
      >
        Apply for This Role
        <ChevronDown
          size={15}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 bg-neutral-50 border border-neutral-200 rounded-sm p-6 lg:p-8 space-y-5"
        >
          <div>
            <p className="font-serif text-lg font-bold text-brand-dark mb-1">
              Apply — {roleTitle}
            </p>
            <p className="text-xs text-neutral-500">
              Fill in the details below and we&apos;ll be in touch within 2–3 business days.
            </p>
          </div>

          {/* Name + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder="Jane Smith"
                className="w-full border border-neutral-200 rounded-sm px-3.5 py-2.5 text-sm text-brand-dark placeholder:text-neutral-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-colors bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="jane@example.com"
                className="w-full border border-neutral-200 rounded-sm px-3.5 py-2.5 text-sm text-brand-dark placeholder:text-neutral-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-colors bg-white"
              />
            </div>
          </div>

          {/* Phone + LinkedIn */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                name="phone"
                type="tel"
                required
                placeholder="(757) 555-0100"
                className="w-full border border-neutral-200 rounded-sm px-3.5 py-2.5 text-sm text-brand-dark placeholder:text-neutral-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-colors bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                LinkedIn or Portfolio URL
                <span className="text-neutral-400 font-normal ml-1">(optional)</span>
              </label>
              <input
                name="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/yourname"
                className="w-full border border-neutral-200 rounded-sm px-3.5 py-2.5 text-sm text-brand-dark placeholder:text-neutral-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-colors bg-white"
              />
            </div>
          </div>

          {/* Role-specific fields */}
          {extraFields.map((field) => (
            <div key={field.name}>
              <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.type === "select" ? (
                <select
                  name={field.name}
                  required={field.required}
                  defaultValue=""
                  className="w-full border border-neutral-200 rounded-sm px-3.5 py-2.5 text-sm text-brand-dark focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-colors bg-white appearance-none cursor-pointer"
                >
                  <option value="" disabled>
                    Select an option…
                  </option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name={field.name}
                  type={field.type}
                  required={field.required}
                  placeholder={field.placeholder}
                  className="w-full border border-neutral-200 rounded-sm px-3.5 py-2.5 text-sm text-brand-dark placeholder:text-neutral-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-colors bg-white"
                />
              )}
            </div>
          ))}

          {/* Message */}
          <div>
            <label className="block text-xs font-semibold text-brand-dark mb-1.5">
              Why do you want to join us? <span className="text-red-500">*</span>
            </label>
            <textarea
              name="message"
              required
              rows={4}
              placeholder="Tell us a bit about yourself, your experience, and why this role is a good fit for you. No formal cover letter needed — just be yourself."
              className="w-full border border-neutral-200 rounded-sm px-3.5 py-2.5 text-sm text-brand-dark placeholder:text-neutral-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-colors bg-white resize-none leading-relaxed"
            />
          </div>

          {/* Error */}
          {status === "error" && (
            <div className="flex items-start gap-3 rounded-sm bg-red-50 border border-red-200 px-4 py-3">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{errorMsg || "Something went wrong. Please try again."}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pt-1">
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex items-center gap-2 bg-brand text-white text-sm font-semibold px-7 py-3 rounded-sm hover:bg-brand/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {status === "loading" ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Sending…
                </>
              ) : (
                <>
                  <Send size={14} /> Submit Application
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              Cancel
            </button>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed">
            By submitting this form you agree that Hasker &amp; Co. Realty Group may store and use
            your information to process your application. We do not share your details with third
            parties.
          </p>
        </form>
      )}
    </div>
  );
}
