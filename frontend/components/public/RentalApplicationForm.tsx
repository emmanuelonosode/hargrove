"use client";

import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, MapPin, Calendar, Users, Lock, Eye, EyeOff,
  ChevronRight, ChevronLeft, Check, AlertCircle, Building2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const STORAGE_KEY = "hasker_app_draft";

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormData {
  // Step 1 — Personal
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  cell_phone: string;
  home_phone: string;
  // Step 2 — Address
  present_address: string;
  city: string;
  state: string;
  zip_code: string;
  // Step 3 — Rental
  move_in_date: string;
  intended_stay_duration: string;
  months_rent_upfront: number;
  // Step 4 — Household
  has_kids: boolean;
  number_of_kids: number;
  has_pets: boolean;
  pet_description: string;
  smokes: boolean;
  drinks: boolean;
  // Meta
  rental_property: string | null;
  confirmed: boolean;
}

const empty = (): FormData => ({
  first_name: "", middle_name: "", last_name: "",
  email: "", cell_phone: "", home_phone: "",
  present_address: "", city: "", state: "", zip_code: "",
  move_in_date: "", intended_stay_duration: "", months_rent_upfront: 1,
  has_kids: false, number_of_kids: 0,
  has_pets: false, pet_description: "",
  smokes: false, drinks: false,
  rental_property: null, confirmed: false,
});

// ── Step config ───────────────────────────────────────────────────────────────

const STEP_LABELS = ["Personal", "Address", "Rental", "Household", "Account", "Review"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function saveDraft(data: FormData) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

function loadDraft(): Partial<FormData> {
  try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}"); } catch { return {}; }
}

function clearDraft() {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
}

// ── Input primitives (Apple feel) ─────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-semibold tracking-[0.07em] uppercase text-[#6E6E73] mb-1.5">
      {children}
    </label>
  );
}

function Input({
  error,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <div>
      <input
        {...props}
        className={cn(
          "w-full rounded-xl px-4 py-3 text-[14px] text-[#1D1D1F] bg-[#F5F5F7] outline-none transition-all",
          "focus:bg-white focus:ring-2 focus:ring-brand/30 focus:shadow-[0_0_0_1px_#1A56DB]",
          error && "ring-2 ring-red-400/50 bg-red-50/50",
          className
        )}
      />
      {error && (
        <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

function Select({
  error,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  return (
    <div>
      <select
        {...props}
        className={cn(
          "w-full rounded-xl px-4 py-3 text-[14px] text-[#1D1D1F] bg-[#F5F5F7] outline-none transition-all appearance-none",
          "focus:bg-white focus:ring-2 focus:ring-brand/30 focus:shadow-[0_0_0_1px_#1A56DB]",
          error && "ring-2 ring-red-400/50"
        )}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  sub,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  sub?: string;
}) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer py-3.5 px-4 rounded-xl hover:bg-black/[0.02] transition-colors">
      <div>
        <p className="text-[14px] font-medium text-[#1D1D1F]">{label}</p>
        {sub && <p className="text-[12px] text-[#6E6E73] mt-0.5">{sub}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200",
          checked ? "bg-brand" : "bg-[#D1D1D6]"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200",
            checked && "translate-x-5"
          )}
        />
      </button>
    </label>
  );
}

// ── Step Indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current, total, labels }: { current: number; total: number; labels: string[] }) {
  return (
    <div className="flex items-center gap-0">
      {Array.from({ length: total }).map((_, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            {/* Circle */}
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all duration-300",
                done && "bg-brand text-white",
                active && "bg-[#1D1D1F] text-white ring-4 ring-[#1D1D1F]/10",
                !done && !active && "bg-[#E5E5EA] text-[#6E6E73]"
              )}>
                {done ? <Check size={13} strokeWidth={2.5} /> : i + 1}
              </div>
              <span className={cn(
                "hidden sm:block text-[9px] font-semibold mt-1 tracking-wide uppercase whitespace-nowrap",
                active ? "text-[#1D1D1F]" : done ? "text-brand" : "text-[#C7C7CC]"
              )}>
                {labels[i]}
              </span>
            </div>
            {/* Connector */}
            {i < total - 1 && (
              <div className={cn(
                "flex-1 h-px mx-1 sm:mx-2 mt-0 sm:-mt-4 transition-colors duration-300",
                i < current ? "bg-brand" : "bg-[#E5E5EA]"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  sub,
  children,
}: {
  icon: React.ElementType;
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-[#F5F5F7] flex items-center justify-center shrink-0">
          <Icon size={17} className="text-[#3C3C43]" strokeWidth={1.8} />
        </div>
        <div>
          <h2 className="text-[16px] font-semibold text-[#1D1D1F] tracking-tight">{title}</h2>
          {sub && <p className="text-[12px] text-[#6E6E73] mt-0.5">{sub}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

// ── Navigation buttons ────────────────────────────────────────────────────────

function NavButtons({
  step,
  total,
  onBack,
  onNext,
  nextLabel = "Continue",
  loading = false,
  disabled = false,
}: {
  step: number;
  total: number;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {step > 0 && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-[#6E6E73] hover:text-[#1D1D1F] transition-colors px-4 py-3 rounded-xl hover:bg-black/[0.04]"
        >
          <ChevronLeft size={15} strokeWidth={2.5} />
          Back
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={loading || disabled}
        className={cn(
          "flex-1 flex items-center justify-center gap-1.5 bg-brand text-white text-[13px] font-semibold px-6 py-3 rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-50",
        )}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing…
          </span>
        ) : (
          <>
            {nextLabel}
            {step < total - 1 && <ChevronRight size={15} strokeWidth={2.5} />}
          </>
        )}
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface Props { propertySlug?: string; }

export function RentalApplicationForm({ propertySlug }: Props) {
  const { user, login, register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<FormData>(() => ({
    ...empty(),
    ...loadDraft(),
    rental_property: propertySlug ?? null,
  }));
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Auth gate state
  const [authMode, setAuthMode] = useState<"register" | "login">("register");
  const [authForm, setAuthForm] = useState({ email: "", password: "", confirm: "", first_name: "", last_name: "" });
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Total steps: Personal, Address, Rental, Household, [Account if no user], Review
  const TOTAL_STEPS = user ? 5 : 6;
  // Effective step indices
  const REVIEW_STEP = user ? 4 : 5;
  const ACCOUNT_STEP = 4; // only shown when !user

  // Save draft whenever form changes
  useEffect(() => { saveDraft(form); }, [form]);

  // Pre-fill from authenticated user
  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        first_name: f.first_name || user.first_name,
        last_name: f.last_name || user.last_name,
        email: f.email || user.email,
      }));
    }
  }, [user]);

  // Auto-advance past account step after auth
  useEffect(() => {
    if (user && step === ACCOUNT_STEP) {
      setStep(ACCOUNT_STEP + 1);
    }
  }, [user, step, ACCOUNT_STEP]);

  function set<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  }

  function text(field: keyof FormData) {
    return (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      set(field, e.target.value as never);
  }

  // ── Per-step validation ────────────────────────────────────────────────────

  function validateStep(s: number): boolean {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!form.first_name.trim()) e.first_name = "Required";
      if (!form.last_name.trim()) e.last_name = "Required";
      if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
      if (!form.cell_phone.trim()) e.cell_phone = "Required";
    }
    if (s === 1) {
      if (!form.present_address.trim()) e.present_address = "Required";
      if (!form.city.trim()) e.city = "Required";
      if (!form.state.trim()) e.state = "Required";
      if (!form.zip_code.trim()) e.zip_code = "Required";
    }
    if (s === 2) {
      if (!form.move_in_date) e.move_in_date = "Required";
      if (!form.intended_stay_duration.trim()) e.intended_stay_duration = "Required";
    }
    if (s === 3) {
      if (form.has_kids && form.number_of_kids < 1) e.number_of_kids = "Specify number";
      if (form.has_pets && !form.pet_description.trim()) e.pet_description = "Describe your pet(s)";
    }
    if (s === REVIEW_STEP) {
      if (!form.confirmed) e.confirmed = "Please confirm the information is accurate";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function goBack() { setStep((s) => Math.max(0, s - 1)); setServerError(null); }

  function goNext() {
    if (!validateStep(step)) return;
    if (step === REVIEW_STEP) { handleSubmit(); return; }
    // Skip account step if user is logged in
    if (!user && step === 3) { setStep(ACCOUNT_STEP); return; }
    if (user && step === 3) { setStep(REVIEW_STEP); return; }
    setStep((s) => s + 1);
  }

  // ── Auth gate handlers ─────────────────────────────────────────────────────

  async function handleAuth() {
    setAuthError(null);
    if (authMode === "register") {
      if (!authForm.first_name.trim() || !authForm.last_name.trim()) {
        setAuthError("Enter your full name."); return;
      }
      if (!authForm.email.trim()) { setAuthError("Enter your email."); return; }
      if (authForm.password.length < 8) { setAuthError("Password must be at least 8 characters."); return; }
      if (authForm.password !== authForm.confirm) { setAuthError("Passwords don't match."); return; }
    } else {
      if (!authForm.email.trim() || !authForm.password) { setAuthError("Enter email and password."); return; }
    }

    setAuthLoading(true);
    try {
      if (authMode === "register") {
        await register({
          email: authForm.email || form.email,
          password: authForm.password,
          first_name: authForm.first_name || form.first_name,
          last_name: authForm.last_name || form.last_name,
        });
      } else {
        await login(authForm.email, authForm.password);
      }
      // user state update triggers useEffect to advance step
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Authentication failed. Try again.");
    } finally {
      setAuthLoading(false);
    }
  }

  // ── Final submit ───────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!validateStep(REVIEW_STEP)) return;
    setSubmitting(true);
    setServerError(null);
    try {
      const payload = {
        first_name: form.first_name, middle_name: form.middle_name, last_name: form.last_name,
        email: form.email, cell_phone: form.cell_phone, home_phone: form.home_phone,
        present_address: form.present_address, city: form.city, state: form.state, zip_code: form.zip_code,
        move_in_date: form.move_in_date, intended_stay_duration: form.intended_stay_duration,
        months_rent_upfront: form.months_rent_upfront,
        has_kids: form.has_kids, number_of_kids: form.has_kids ? form.number_of_kids : 0,
        has_pets: form.has_pets, pet_description: form.has_pets ? form.pet_description : "",
        smokes: form.smokes, drinks: form.drinks,
        ...(form.rental_property ? { rental_property: form.rental_property } : {}),
      };

      const res = await fetch(`${API_BASE}/api/v1/leads/apply/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const firstError = (Object.values(data as Record<string, string[]>).flat().filter(Boolean))[0];
        throw new Error(firstError ?? "Submission failed. Please try again.");
      }

      const data = await res.json();
      clearDraft();
      router.push(`/apply/success?ref=${data.id}&name=${encodeURIComponent(form.first_name)}`);
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Step content ───────────────────────────────────────────────────────────

  const visibleStep = user
    ? step // steps 0-3 direct, 4 = review
    : step; // steps 0-3, 4 = account, 5 = review

  const stepLabels = user
    ? ["Personal", "Address", "Rental", "Household", "Review"]
    : ["Personal", "Address", "Rental", "Household", "Account", "Review"];

  return (
    <div className="space-y-5">
      {/* Step indicator */}
      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] px-5 py-5">
        <StepIndicator current={visibleStep} total={TOTAL_STEPS} labels={stepLabels} />
      </div>

      {/* ── Step 0: Personal Info ──────────────────────────────────────── */}
      {step === 0 && (
        <Section icon={User} title="Tell us about yourself" sub="Basic personal information for your application">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label>First Name *</Label>
                <Input value={form.first_name} onChange={text("first_name")} placeholder="Jane" error={errors.first_name} />
              </div>
              <div>
                <Label>Middle Name</Label>
                <Input value={form.middle_name} onChange={text("middle_name")} placeholder="Optional" />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input value={form.last_name} onChange={text("last_name")} placeholder="Smith" error={errors.last_name} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Email Address *</Label>
                <Input type="email" value={form.email} onChange={text("email")} placeholder="you@example.com" error={errors.email} />
              </div>
              <div>
                <Label>Cell Phone *</Label>
                <Input type="tel" value={form.cell_phone} onChange={text("cell_phone")} placeholder="+1 555-000-0000" error={errors.cell_phone} />
              </div>
            </div>
            <div>
              <Label>Home Phone (optional)</Label>
              <Input type="tel" value={form.home_phone} onChange={text("home_phone")} placeholder="+1 555-000-0000" />
            </div>
          </div>
        </Section>
      )}

      {/* ── Step 1: Current Address ────────────────────────────────────── */}
      {step === 1 && (
        <Section icon={MapPin} title="Your current address" sub="Where do you currently live?">
          <div className="space-y-4">
            <div>
              <Label>Street Address *</Label>
              <Input value={form.present_address} onChange={text("present_address")} placeholder="123 Main Street, Apt 4B" error={errors.present_address} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label>City *</Label>
                <Input value={form.city} onChange={text("city")} placeholder="Atlanta" error={errors.city} />
              </div>
              <div>
                <Label>State *</Label>
                <Input value={form.state} onChange={text("state")} placeholder="GA" maxLength={2} error={errors.state} className="uppercase" />
              </div>
              <div>
                <Label>ZIP Code *</Label>
                <Input value={form.zip_code} onChange={text("zip_code")} placeholder="30301" error={errors.zip_code} />
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ── Step 2: Rental Preferences ────────────────────────────────── */}
      {step === 2 && (
        <Section icon={Calendar} title="Rental preferences" sub="When do you want to move in and for how long?">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Intended Move-In Date *</Label>
                <Input type="date" value={form.move_in_date} onChange={text("move_in_date")} error={errors.move_in_date} min={new Date().toISOString().split("T")[0]} />
              </div>
              <div>
                <Label>Intended Stay Duration *</Label>
                <Select value={form.intended_stay_duration} onChange={text("intended_stay_duration")} error={errors.intended_stay_duration}>
                  <option value="">Select duration</option>
                  <option value="3 months">3 months</option>
                  <option value="6 months">6 months</option>
                  <option value="12 months">12 months (1 year)</option>
                  <option value="24 months">24 months (2 years)</option>
                  <option value="36 months">36 months (3 years)</option>
                  <option value="Flexible">Flexible / Month-to-month</option>
                </Select>
              </div>
            </div>
            <div>
              <Label>Months Rent Upfront</Label>
              <Select
                value={form.months_rent_upfront}
                onChange={(e) => set("months_rent_upfront", Number(e.target.value))}
              >
                {[1, 2, 3, 6, 12].map((n) => (
                  <option key={n} value={n}>{n} month{n > 1 ? "s" : ""}</option>
                ))}
              </Select>
              <p className="mt-1.5 text-[11px] text-[#6E6E73]">First and last month&apos;s rent is standard.</p>
            </div>
          </div>
        </Section>
      )}

      {/* ── Step 3: Household ─────────────────────────────────────────── */}
      {step === 3 && (
        <Section icon={Users} title="Your household" sub="Tell us who will be living in the property">
          <div className="space-y-1">
            <Toggle
              checked={form.has_kids}
              onChange={(v) => set("has_kids", v)}
              label="I have children"
              sub="Children who will be living in the property"
            />
            {form.has_kids && (
              <div className="px-4 pb-3">
                <Label>Number of Children *</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.number_of_kids || ""}
                  onChange={(e) => set("number_of_kids", Number(e.target.value))}
                  className="max-w-[100px]"
                  error={errors.number_of_kids}
                />
              </div>
            )}

            <div className="h-px bg-black/[0.04] my-1" />

            <Toggle
              checked={form.has_pets}
              onChange={(v) => set("has_pets", v)}
              label="I have pets"
              sub="Cats, dogs, or other animals"
            />
            {form.has_pets && (
              <div className="px-4 pb-3">
                <Label>Describe your pet(s) *</Label>
                <textarea
                  rows={2}
                  value={form.pet_description}
                  onChange={text("pet_description")}
                  placeholder="e.g. 1 golden retriever, 25 lbs"
                  className="w-full rounded-xl px-4 py-3 text-[14px] text-[#1D1D1F] bg-[#F5F5F7] outline-none focus:bg-white focus:ring-2 focus:ring-brand/30 focus:shadow-[0_0_0_1px_#1A56DB] resize-none"
                />
                {errors.pet_description && <p className="mt-1 text-[11px] text-red-500">{errors.pet_description}</p>}
              </div>
            )}

            <div className="h-px bg-black/[0.04] my-1" />
            <Toggle checked={form.smokes} onChange={(v) => set("smokes", v)} label="I smoke" />
            <div className="h-px bg-black/[0.04] my-1" />
            <Toggle checked={form.drinks} onChange={(v) => set("drinks", v)} label="I drink alcohol" />
          </div>
        </Section>
      )}

      {/* ── Step 4: Account Gate (only when not logged in) ────────────── */}
      {step === ACCOUNT_STEP && !user && (
        <>
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-[#EFF4FF] flex items-center justify-center shrink-0">
                <Lock size={17} className="text-brand" strokeWidth={1.8} />
              </div>
              <div>
                <h2 className="text-[16px] font-semibold text-[#1D1D1F] tracking-tight">
                  {authMode === "register" ? "Create your account" : "Sign in to continue"}
                </h2>
                <p className="text-[12px] text-[#6E6E73]">
                  We&apos;ll use this to track your application and send updates
                </p>
              </div>
            </div>

            {/* Pre-fill notice */}
            {form.first_name && authMode === "register" && (
              <div className="mt-4 bg-[#F5F5F7] rounded-xl px-4 py-3 flex items-start gap-2">
                <Check size={14} className="text-[#34C759] mt-0.5 shrink-0" />
                <p className="text-[12px] text-[#1D1D1F]">
                  Your application details are saved. After creating your account you&apos;ll go straight to review.
                </p>
              </div>
            )}

            {authError && (
              <div className="mt-4 bg-red-50 border border-red-200/60 text-red-600 text-[12px] rounded-xl px-4 py-3 flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                {authError}
              </div>
            )}

            <div className="mt-5 space-y-3">
              {authMode === "register" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      value={authForm.first_name || form.first_name}
                      onChange={(e) => setAuthForm((f) => ({ ...f, first_name: e.target.value }))}
                      placeholder="Jane"
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      value={authForm.last_name || form.last_name}
                      onChange={(e) => setAuthForm((f) => ({ ...f, last_name: e.target.value }))}
                      placeholder="Smith"
                    />
                  </div>
                </div>
              )}

              <div>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={authForm.email || form.email}
                  onChange={(e) => setAuthForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPass ? "text" : "password"}
                    value={authForm.password}
                    onChange={(e) => setAuthForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder={authMode === "register" ? "Min. 8 characters" : "Your password"}
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {authMode === "register" && (
                <div>
                  <Label>Confirm Password</Label>
                  <Input
                    type={showPass ? "text" : "password"}
                    value={authForm.confirm}
                    onChange={(e) => setAuthForm((f) => ({ ...f, confirm: e.target.value }))}
                    placeholder="Re-enter password"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleAuth}
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-2 bg-brand text-white text-[13px] font-semibold py-3 rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-50"
              >
                {authLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : authMode === "register" ? "Create Account & Continue" : "Sign In & Continue"}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setAuthMode((m) => m === "register" ? "login" : "register"); setAuthError(null); }}
                  className="text-[12px] text-brand font-semibold hover:underline"
                >
                  {authMode === "register"
                    ? "Already have an account? Sign in instead"
                    : "Don't have an account? Create one"}
                </button>
              </div>
            </div>
          </div>

          {/* Back only — no next button since next is the auth button above */}
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-[#6E6E73] hover:text-[#1D1D1F] transition-colors px-4 py-3 rounded-xl hover:bg-black/[0.04]"
          >
            <ChevronLeft size={15} strokeWidth={2.5} />
            Back
          </button>
        </>
      )}

      {/* ── Review Step ───────────────────────────────────────────────── */}
      {step === REVIEW_STEP && (
        <>
          <Section icon={Building2} title="Review your application" sub="Confirm everything looks right before submitting">
            <div className="space-y-5">

              {/* Summary rows */}
              {[
                {
                  title: "Personal",
                  rows: [
                    [`Name`, `${form.first_name} ${form.middle_name ? form.middle_name + " " : ""}${form.last_name}`],
                    ["Email", form.email],
                    ["Cell Phone", form.cell_phone],
                    form.home_phone && ["Home Phone", form.home_phone],
                  ].filter(Boolean) as [string, string][],
                  onEdit: () => setStep(0),
                },
                {
                  title: "Current Address",
                  rows: [
                    ["Street", form.present_address],
                    ["City / State / ZIP", `${form.city}, ${form.state.toUpperCase()} ${form.zip_code}`],
                  ],
                  onEdit: () => setStep(1),
                },
                {
                  title: "Rental Preferences",
                  rows: [
                    ["Move-In Date", form.move_in_date ? new Date(form.move_in_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""],
                    ["Duration", form.intended_stay_duration],
                    ["Months Upfront", `${form.months_rent_upfront} month${form.months_rent_upfront > 1 ? "s" : ""}`],
                  ],
                  onEdit: () => setStep(2),
                },
                {
                  title: "Household",
                  rows: [
                    ["Children", form.has_kids ? `Yes — ${form.number_of_kids}` : "No"],
                    ["Pets", form.has_pets ? `Yes — ${form.pet_description}` : "No"],
                    ["Smokes", form.smokes ? "Yes" : "No"],
                    ["Drinks", form.drinks ? "Yes" : "No"],
                  ],
                  onEdit: () => setStep(3),
                },
              ].map(({ title, rows, onEdit }) => (
                <div key={title} className="rounded-xl bg-[#F5F5F7] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/[0.04]">
                    <p className="text-[11px] font-semibold tracking-[0.07em] uppercase text-[#6E6E73]">{title}</p>
                    <button
                      type="button"
                      onClick={onEdit}
                      className="text-[11px] font-semibold text-brand hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  {rows.map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4 px-4 py-2.5 border-b border-black/[0.04] last:border-0">
                      <p className="text-[12px] text-[#6E6E73] shrink-0">{label}</p>
                      <p className="text-[12px] font-medium text-[#1D1D1F] text-right">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              ))}

              {/* Certification */}
              <div className="rounded-xl border border-brand/20 bg-[#EFF4FF] px-4 py-4">
                <p className="text-[12px] text-[#1D1D1F] leading-relaxed italic mb-4">
                  I certify that the answers given herein are true and complete to the best of my knowledge.
                  I authorize investigation of all statements contained in this application for rental purposes.
                  Incomplete or misleading information may result in rejection of this application.
                </p>
                <label className="flex items-start gap-3 cursor-pointer">
                  <div
                    role="checkbox"
                    aria-checked={form.confirmed}
                    onClick={() => set("confirmed", !form.confirmed)}
                    className={cn(
                      "w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border-2 transition-all cursor-pointer",
                      form.confirmed
                        ? "bg-brand border-brand"
                        : "bg-white border-black/20 hover:border-brand"
                    )}
                  >
                    {form.confirmed && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-[13px] font-medium text-[#1D1D1F]">
                    I confirm all information is accurate and complete.
                  </span>
                </label>
                {errors.confirmed && (
                  <p className="mt-2 text-[11px] text-red-500 flex items-center gap-1">
                    <AlertCircle size={11} /> {errors.confirmed}
                  </p>
                )}
              </div>

              {serverError && (
                <div className="bg-red-50 border border-red-200/60 text-red-600 text-[12px] rounded-xl px-4 py-3 flex items-start gap-2">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  {serverError}
                </div>
              )}
            </div>
          </Section>
        </>
      )}

      {/* ── Navigation ────────────────────────────────────────────────── */}
      {step !== ACCOUNT_STEP && (
        <NavButtons
          step={step}
          total={TOTAL_STEPS}
          onBack={goBack}
          onNext={goNext}
          nextLabel={step === REVIEW_STEP ? "Submit Application" : "Continue"}
          loading={submitting}
        />
      )}

      {/* Privacy note */}
      <p className="text-center text-[11px] text-[#6E6E73]">
        Your information is handled confidentially.{" "}
        <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
      </p>
    </div>
  );
}
