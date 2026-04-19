"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface FormData {
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  cell_phone: string;
  home_phone: string;
  present_address: string;
  city: string;
  state: string;
  zip_code: string;
  move_in_date: string;
  intended_stay_duration: string;
  months_rent_upfront: number;
  has_kids: boolean;
  number_of_kids: number;
  has_pets: boolean;
  pet_description: string;
  smokes: boolean;
  drinks: boolean;
  rental_property: string | null;
  confirmed: boolean;
}

const emptyForm = (): FormData => ({
  first_name: "",
  middle_name: "",
  last_name: "",
  email: "",
  cell_phone: "",
  home_phone: "",
  present_address: "",
  city: "",
  state: "",
  zip_code: "",
  move_in_date: "",
  intended_stay_duration: "",
  months_rent_upfront: 1,
  has_kids: false,
  number_of_kids: 0,
  has_pets: false,
  pet_description: "",
  smokes: false,
  drinks: false,
  rental_property: null,
  confirmed: false,
});

interface Success {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface Props {
  propertySlug?: string;
}

export function RentalApplicationForm({ propertySlug }: Props) {
  const [form, setForm] = useState<FormData>({
    ...emptyForm(),
    rental_property: propertySlug ?? null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<Success | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  function set(field: keyof FormData, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function text(field: keyof FormData) {
    return (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      set(field, e.target.value);
  }

  function checkbox(field: keyof FormData) {
    return (e: ChangeEvent<HTMLInputElement>) => set(field, e.target.checked);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.first_name.trim()) e.first_name = "First name is required.";
    if (!form.last_name.trim()) e.last_name = "Last name is required.";
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email))
      e.email = "A valid email address is required.";
    if (!form.cell_phone.trim()) e.cell_phone = "Cell phone is required.";
    if (!form.present_address.trim()) e.present_address = "Address is required.";
    if (!form.city.trim()) e.city = "City is required.";
    if (!form.state.trim()) e.state = "State is required.";
    if (!form.zip_code.trim()) e.zip_code = "ZIP code is required.";
    if (!form.move_in_date) e.move_in_date = "Move-in date is required.";
    if (!form.intended_stay_duration.trim())
      e.intended_stay_duration = "Intended stay duration is required.";
    if (form.has_kids && form.number_of_kids < 1)
      e.number_of_kids = "Please specify how many children.";
    if (form.has_pets && !form.pet_description.trim())
      e.pet_description = "Please describe your pet(s).";
    if (!form.confirmed) e.confirmed = "You must certify the information is accurate.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        first_name: form.first_name,
        middle_name: form.middle_name,
        last_name: form.last_name,
        email: form.email,
        cell_phone: form.cell_phone,
        home_phone: form.home_phone,
        present_address: form.present_address,
        city: form.city,
        state: form.state,
        zip_code: form.zip_code,
        move_in_date: form.move_in_date,
        intended_stay_duration: form.intended_stay_duration,
        months_rent_upfront: form.months_rent_upfront,
        has_kids: form.has_kids,
        number_of_kids: form.has_kids ? form.number_of_kids : 0,
        has_pets: form.has_pets,
        pet_description: form.has_pets ? form.pet_description : "",
        smokes: form.smokes,
        drinks: form.drinks,
        ...(form.rental_property ? { rental_property: form.rental_property } : {}),
      };

      const res = await fetch(`${API_BASE}/api/v1/leads/apply/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // Surface first field error or a generic message
        const firstError = Object.values(data as Record<string, string[]>)
          .flat()
          .filter(Boolean)[0];
        throw new Error(firstError ?? "Submission failed. Please try again.");
      }

      const data = await res.json();
      setSuccess({ id: data.id, email: form.email, first_name: form.first_name, last_name: form.last_name });
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
          <Check size={28} className="text-green-600" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-brand-dark mb-3">Application Received</h2>
        <p className="text-neutral-600 mb-2">
          Thank you, <strong>{success.first_name} {success.last_name}</strong>. Your application has been submitted.
        </p>
        <p className="text-neutral-500 text-sm mb-2">Reference: <strong>#{String(success.id).padStart(5, "0")}</strong></p>
        <p className="text-neutral-500 text-sm">
          A copy of your application PDF will be emailed to <strong>{success.email}</strong>.
          Our team will review it and get back to you shortly.
        </p>
      </div>
    );
  }

  const inputCls = (field: keyof FormData) =>
    `w-full border rounded-sm px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand ${
      errors[field] ? "border-red-400 bg-red-50" : "border-neutral-200 bg-white"
    }`;

  const labelCls = "block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1";
  const errorCls = "text-xs text-red-500 mt-1";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-10 max-w-3xl mx-auto px-4 py-10">

      {/* Section 1 — Personal Information */}
      <section>
        <h2 className="font-serif text-xl font-bold text-brand-dark mb-5 pb-2 border-b border-neutral-200">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="first_name" className={labelCls}>First Name *</label>
            <input id="first_name" type="text" value={form.first_name} onChange={text("first_name")} className={inputCls("first_name")} />
            {errors.first_name && <p className={errorCls}>{errors.first_name}</p>}
          </div>
          <div>
            <label htmlFor="middle_name" className={labelCls}>Middle Name</label>
            <input id="middle_name" type="text" value={form.middle_name} onChange={text("middle_name")} className={inputCls("middle_name")} />
          </div>
          <div>
            <label htmlFor="last_name" className={labelCls}>Last Name *</label>
            <input id="last_name" type="text" value={form.last_name} onChange={text("last_name")} className={inputCls("last_name")} />
            {errors.last_name && <p className={errorCls}>{errors.last_name}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="email" className={labelCls}>Email *</label>
            <input id="email" type="email" value={form.email} onChange={text("email")} className={inputCls("email")} />
            {errors.email && <p className={errorCls}>{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="cell_phone" className={labelCls}>Cell Phone *</label>
            <input id="cell_phone" type="tel" value={form.cell_phone} onChange={text("cell_phone")} className={inputCls("cell_phone")} />
            {errors.cell_phone && <p className={errorCls}>{errors.cell_phone}</p>}
          </div>
          <div>
            <label htmlFor="home_phone" className={labelCls}>Home Phone</label>
            <input id="home_phone" type="tel" value={form.home_phone} onChange={text("home_phone")} className={inputCls("home_phone")} />
          </div>
        </div>
      </section>

      {/* Section 2 — Current Address */}
      <section>
        <h2 className="font-serif text-xl font-bold text-brand-dark mb-5 pb-2 border-b border-neutral-200">
          Current Address
        </h2>
        <div className="mb-4">
          <label htmlFor="present_address" className={labelCls}>Street Address *</label>
          <input id="present_address" type="text" value={form.present_address} onChange={text("present_address")} className={inputCls("present_address")} />
          {errors.present_address && <p className={errorCls}>{errors.present_address}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className={labelCls}>City *</label>
            <input id="city" type="text" value={form.city} onChange={text("city")} className={inputCls("city")} />
            {errors.city && <p className={errorCls}>{errors.city}</p>}
          </div>
          <div>
            <label htmlFor="state" className={labelCls}>State *</label>
            <input id="state" type="text" maxLength={2} placeholder="CA" value={form.state} onChange={text("state")} className={inputCls("state")} />
            {errors.state && <p className={errorCls}>{errors.state}</p>}
          </div>
          <div>
            <label htmlFor="zip_code" className={labelCls}>ZIP Code *</label>
            <input id="zip_code" type="text" value={form.zip_code} onChange={text("zip_code")} className={inputCls("zip_code")} />
            {errors.zip_code && <p className={errorCls}>{errors.zip_code}</p>}
          </div>
        </div>
      </section>

      {/* Section 3 — Rental Details */}
      <section>
        <h2 className="font-serif text-xl font-bold text-brand-dark mb-5 pb-2 border-b border-neutral-200">
          Rental Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="move_in_date" className={labelCls}>Intended Move-In Date *</label>
            <input id="move_in_date" type="date" value={form.move_in_date} onChange={text("move_in_date")} className={inputCls("move_in_date")} />
            {errors.move_in_date && <p className={errorCls}>{errors.move_in_date}</p>}
          </div>
          <div>
            <label htmlFor="intended_stay_duration" className={labelCls}>Duration *</label>
            <input id="intended_stay_duration" type="text" placeholder="e.g. 12 months" value={form.intended_stay_duration} onChange={text("intended_stay_duration")} className={inputCls("intended_stay_duration")} />
            {errors.intended_stay_duration && <p className={errorCls}>{errors.intended_stay_duration}</p>}
          </div>
          <div>
            <label htmlFor="months_rent_upfront" className={labelCls}>Months Rent Upfront *</label>
            <select
              id="months_rent_upfront"
              value={form.months_rent_upfront}
              onChange={(e) => set("months_rent_upfront", Number(e.target.value))}
              className={inputCls("months_rent_upfront")}
            >
              {[1, 2, 3, 6, 12].map((n) => (
                <option key={n} value={n}>{n} month{n > 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Section 4 — Household */}
      <section>
        <h2 className="font-serif text-xl font-bold text-brand-dark mb-5 pb-2 border-b border-neutral-200">
          Household
        </h2>
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.has_kids}
                onChange={checkbox("has_kids")}
                className="w-4 h-4 accent-brand"
              />
              <span className="text-sm font-medium text-brand-dark">I have children who will be living in the property</span>
            </label>
            {form.has_kids && (
              <div className="mt-3 ml-7">
                <label htmlFor="number_of_kids" className={labelCls}>Number of Children *</label>
                <input
                  id="number_of_kids"
                  type="number"
                  min={1}
                  value={form.number_of_kids || ""}
                  onChange={(e) => set("number_of_kids", Number(e.target.value))}
                  className={`${inputCls("number_of_kids")} max-w-[120px]`}
                />
                {errors.number_of_kids && <p className={errorCls}>{errors.number_of_kids}</p>}
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.has_pets}
                onChange={checkbox("has_pets")}
                className="w-4 h-4 accent-brand"
              />
              <span className="text-sm font-medium text-brand-dark">I have pets</span>
            </label>
            {form.has_pets && (
              <div className="mt-3 ml-7">
                <label htmlFor="pet_description" className={labelCls}>Describe Your Pet(s) *</label>
                <textarea
                  id="pet_description"
                  rows={2}
                  placeholder="e.g. 1 golden retriever, 2 cats"
                  value={form.pet_description}
                  onChange={text("pet_description")}
                  className={`${inputCls("pet_description")} resize-none`}
                />
                {errors.pet_description && <p className={errorCls}>{errors.pet_description}</p>}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 5 — Lifestyle */}
      <section>
        <h2 className="font-serif text-xl font-bold text-brand-dark mb-5 pb-2 border-b border-neutral-200">
          Habits &amp; Lifestyle
        </h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.smokes} onChange={checkbox("smokes")} className="w-4 h-4 accent-brand" />
            <span className="text-sm font-medium text-brand-dark">I smoke</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.drinks} onChange={checkbox("drinks")} className="w-4 h-4 accent-brand" />
            <span className="text-sm font-medium text-brand-dark">I drink alcohol</span>
          </label>
        </div>
      </section>

      {/* Section 6 — Certification */}
      <section className="bg-brand-light border border-brand-muted rounded-sm p-6">
        <h2 className="font-serif text-xl font-bold text-brand-dark mb-4">Certification</h2>
        <p className="text-sm text-neutral-600 italic leading-relaxed mb-5">
          I certify that the answers given herein are true and complete to the best of my knowledge.
          I authorize investigation of all statements contained in this application for rental purposes.
          I understand that incomplete or misleading information may be grounds for rejection of my application.
        </p>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.confirmed}
            onChange={checkbox("confirmed")}
            className="w-4 h-4 mt-0.5 accent-brand"
          />
          <span className="text-sm font-medium text-brand-dark">
            I confirm that all information provided is accurate and complete.
          </span>
        </label>
        {errors.confirmed && <p className={errorCls}>{errors.confirmed}</p>}
      </section>

      {/* Server error */}
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm px-4 py-3">
          {serverError}
        </div>
      )}

      <Button
        type="submit"
        variant="accent"
        className="w-full py-3 text-base"
        disabled={submitting}
      >
        {submitting ? "Submitting…" : "Submit Application"}
      </Button>

      <p className="text-xs text-center text-neutral-400">
        Your application and personal information are handled confidentially in accordance with our privacy policy.
      </p>
    </form>
  );
}
