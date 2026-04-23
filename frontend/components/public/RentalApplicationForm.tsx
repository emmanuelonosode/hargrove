"use client";

import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, MapPin, Calendar, Users, Lock, Eye, EyeOff,
  ChevronRight, ChevronLeft, Check, AlertCircle, Building2, Shield, RotateCcw
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const API_BASE = "";
const STORAGE_KEY = "hasker_app_draft";
const SAVED_PROFILE_KEY = "hasker_saved_profile";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Recursively flattens DRF error objects into a readable string or map.
 */
function parseBackendError(data: any): { message: string; fields: Record<string, string> } {
  const fields: Record<string, string> = {};
  let primaryMessage = "Submission failed. Please check the errors below.";

  if (typeof data === "string") return { message: data, fields: {} };
  
  const extract = (obj: any, prefix = "") => {
    Object.keys(obj).forEach(key => {
      const val = obj[key];
      const fieldKey = prefix ? `${prefix}.${key}` : key;
      if (Array.isArray(val)) {
        fields[fieldKey] = val[0];
      } else if (typeof val === "object") {
        extract(val, fieldKey);
      } else {
        fields[fieldKey] = String(val);
      }
    });
  };

  if (data && typeof data === "object") {
    extract(data);
    if (data.detail) primaryMessage = data.detail;
    else if (Object.keys(fields).length > 0) {
       const firstField = Object.keys(fields)[0];
       primaryMessage = `${firstField}: ${fields[firstField]}`;
    }
  }

  return { message: primaryMessage, fields };
}

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

const STEP_LABELS_GUEST = ["Personal", "Address", "Rental", "Household", "Account", "Review", "Payment"];
const STEP_LABELS_USER  = ["Personal", "Address", "Rental", "Household", "Review", "Payment"];

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

// ── Main Component ────────────────────────────────────────────────────────────

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
  const { user, login, register, verifyEmail, resendOTP, fetchLatestProfile } = useAuth();
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
  const [propertyData, setPropertyData] = useState<any>(null);
  const [autofilledFields, setAutofilledFields] = useState<Set<string>>(new Set());

  // Payment State
  const [selectedMethod, setSelectedMethod] = useState<string>("CASHAPP");
  const [paymentRef, setPaymentRef] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);

  // --- Input primitives (Scoped) ---

  function Label({ children, field }: { children: React.ReactNode; field?: string }) {
    const isAutofilled = field && autofilledFields.has(field);
    return (
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-[11px] font-semibold tracking-[0.07em] uppercase text-[#6E6E73]">
          {children}
        </label>
        {isAutofilled && (
          <span className="text-[9px] font-bold text-brand uppercase tracking-tighter bg-brand/10 px-1.5 py-0.5 rounded">
            Saved
          </span>
        )}
      </div>
    );
  }

  function Input({
    error,
    className,
    field,
    ...props
  }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string; field?: string }) {
    const isAutofilled = field && autofilledFields.has(field);
    return (
      <div>
        <input
          {...props}
          onFocus={() => field && setAutofilledFields(prev => {
            const next = new Set(prev);
            next.delete(field);
            return next;
          })}
          className={cn(
            "w-full rounded-xl px-4 py-3 text-[14px] text-[#1D1D1F] bg-[#F5F5F7] outline-none transition-all",
            "focus:bg-white focus:ring-2 focus:ring-brand/30 focus:shadow-[0_0_0_1px_#1A56DB]",
            isAutofilled && "bg-brand/[0.03] border-brand/20",
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
    field,
    ...props
  }: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string; field?: string }) {
    const isAutofilled = field && autofilledFields.has(field);
    return (
      <div>
        <select
          {...props}
          onFocus={() => field && setAutofilledFields(prev => {
            const next = new Set(prev);
            next.delete(field);
            return next;
          })}
          className={cn(
            "w-full rounded-xl px-4 py-3 text-[14px] text-[#1D1D1F] bg-[#F5F5F7] outline-none transition-all appearance-none",
            "focus:bg-white focus:ring-2 focus:ring-brand/30 focus:shadow-[0_0_0_1px_#1A56DB]",
            isAutofilled && "bg-brand/[0.03] border-brand/20",
            error && "ring-2 ring-red-400/50"
          )}
        >
          {children}
        </select>
        {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
      </div>
    );
  }

  // LocalStorage fallback for guests
  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem(SAVED_PROFILE_KEY);
      if (saved && !sessionStorage.getItem(STORAGE_KEY)) {
        try {
          const profile = JSON.parse(saved);
          setForm(prev => ({ ...prev, ...profile, rental_property: propertySlug ?? null }));
          setAutofilledFields(new Set(Object.keys(profile)));
          toast.info("Welcome back! We've pre-filled the form from your last visit.");
        } catch {}
      }
    }
  }, [user, propertySlug]);

  // --- Helpers ---
  function startFresh() {
    clearDraft();
    setForm({ ...empty(), rental_property: propertySlug ?? null });
    setStep(0);
    setAutofilledFields(new Set());
    toast.info("Form cleared. You can start fresh.");
  }

  // Fetch property details for summary
  useEffect(() => {
    if (propertySlug) {
      fetch(`${API_BASE}/api/v1/properties/${propertySlug}/`)
        .then(res => res.json())
        .then(data => setPropertyData(data))
        .catch(err => console.error("Failed to fetch property details", err));
    }
  }, [propertySlug]);

  // Fast-Track Logic: Fetch latest profile if no draft exists
  useEffect(() => {
    const hasDraft = sessionStorage.getItem(STORAGE_KEY);
    if (user && !hasDraft) {
      fetchLatestProfile()
        .then(profile => {
          if (profile) {
            setForm(prev => ({ ...prev, ...profile, rental_property: propertySlug ?? null }));
            setAutofilledFields(new Set(Object.keys(profile)));
            setStep(REVIEW_STEP);
            toast.success(`Welcome back, ${profile.first_name}! We've loaded your details.`, {
              description: "Please review them for this property."
            });
          }
        })
        .catch(() => {
           // Silently fail, user just fills the form normally
        });
    }
  }, [user, fetchLatestProfile, propertySlug]);

  // Auth gate state
  const [authMode, setAuthMode] = useState<"register" | "login" | "verify">("register");
  const [authForm, setAuthForm] = useState({ email: "", password: "", confirm: "", first_name: "", last_name: "" });
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown effect
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (resendCooldown > 0) {
      t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // Step configuration
  const ACCOUNT_STEP = 4; // only shown when !user
  const REVIEW_STEP = user ? 4 : 5;
  const PAYMENT_STEP = user ? 5 : 6;
  const TOTAL_STEPS = user ? 6 : 7;

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
      setStep(REVIEW_STEP);
    }
  }, [user, step, ACCOUNT_STEP, REVIEW_STEP]);

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

  function goBack() { 
    if (user && step === REVIEW_STEP) {
      setStep(3);
    } else if (!user && step === REVIEW_STEP) {
      setStep(ACCOUNT_STEP);
    } else {
      setStep((s) => Math.max(0, s - 1)); 
    }
    setServerError(null); 
  }

  function goNext() {
    if (!validateStep(step)) return;
    if (step === PAYMENT_STEP) { handleSubmit(); return; }
    
    // Skip account step if user is logged in
    if (!user && step === 3) { setStep(ACCOUNT_STEP); return; }
    if (user && step === 3) { setStep(REVIEW_STEP); return; }
    
    setStep((s) => s + 1);
  }

  // ── Auth gate handlers ─────────────────────────────────────────────────────

  async function handleAuth() {
    setAuthError(null);
    
    // Read directly from DOM to bypass React state sync issues with browser autofill
    const domEmail = (document.getElementById("auth-email") as HTMLInputElement)?.value;
    const domPassword = (document.getElementById("auth-password") as HTMLInputElement)?.value;
    const domConfirm = (document.getElementById("auth-confirm") as HTMLInputElement)?.value;

    const emailVal = (domEmail || authForm.email || form.email || "").trim();
    const passVal = domPassword || authForm.password || "";
    const confirmVal = domConfirm || authForm.confirm || "";

    if (authMode === "register") {
      const domFName = (document.getElementById("auth-first-name") as HTMLInputElement)?.value || "";
      const domLName = (document.getElementById("auth-last-name") as HTMLInputElement)?.value || "";
      
      const fName = domFName.trim() || authForm.first_name.trim() || form.first_name.trim();
      const lName = domLName.trim() || authForm.last_name.trim() || form.last_name.trim();

      if (!fName || !lName) {
        setAuthError("Enter your full name.");
        console.error("Auth validation failed: Missing names", { fName, lName, domFName, domLName });
        return;
      }
      if (!emailVal) { setAuthError("Enter your email."); return; }
      if (passVal.length < 8) { setAuthError("Password must be at least 8 characters."); return; }
      if (passVal !== confirmVal) { setAuthError("Passwords don't match."); return; }
    } else {
      if (!emailVal || !passVal) { setAuthError("Enter email and password."); return; }
    }

    setAuthLoading(true);
    try {
      if (authMode === "register") {
        await register({
          email: emailVal,
          password: passVal,
          first_name: authForm.first_name || form.first_name,
          last_name: authForm.last_name || form.last_name,
          phone: form.cell_phone,
        });
        setAuthMode("verify");
        setResendCooldown(60);
      } else {
        await login(emailVal, passVal);
      }
    } catch (err: any) {
      const { message, fields } = parseBackendError(err.response?.data || err.message || err);
      setAuthError(message);
      setErrors(fields);
      toast.error("Authentication failed", { description: message });
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleVerify(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const otp = otpCode.join("");
    if (otp.length < 6) { setAuthError("Please enter the 6-digit code."); return; }
    setAuthLoading(true); setAuthError(null);
    try {
      await verifyEmail(authForm.email || form.email, otp);
    } catch (err: any) {
      const { message } = parseBackendError(err.response?.data || err.message || err);
      setAuthError(message);
      toast.error("Verification failed", { description: message });
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setAuthError(null);
    try {
      const emailVal = (document.getElementById("auth-email") as HTMLInputElement)?.value || authForm.email || form.email;
      await resendOTP(emailVal);
      setResendCooldown(60);
      toast.success("Code resent successfully");
    } catch (err: any) {
      const { message } = parseBackendError(err.response?.data || err.message || err);
      setAuthError(message);
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
       const pasted = value.slice(0, 6).split('');
       const newCode = [...otpCode];
       for(let i=0; i<pasted.length; i++){
          if(index + i < 6) newCode[index + i] = pasted[i];
       }
       setOtpCode(newCode);
       const nextIndex = Math.min(index + pasted.length, 5);
       document.getElementById(`apply-otp-${nextIndex}`)?.focus();
       return;
    }
    const newCode = [...otpCode];
    newCode[index] = value;
    setOtpCode(newCode);
    if (value && index < 5) document.getElementById(`apply-otp-${index + 1}`)?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      document.getElementById(`apply-otp-${index - 1}`)?.focus();
    }
  };

  // ── Final submit ───────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!validateStep(PAYMENT_STEP)) return;
    
    // Validate manual payment fields
    if (!paymentRef.trim()) {
      toast.error("Please enter your transaction reference (e.g. CashTag or Email)");
      return;
    }
    if (!proofFile) {
      toast.error("Please upload a screenshot/receipt of your transfer");
      return;
    }

    setSubmitting(true);
    setServerError(null);
    setErrors({});

    try {
      let finalProofUrl = "";

      // 1. Upload Proof to Cloudinary
      const formData = new FormData();
      formData.append("file", proofFile);
      formData.append("upload_preset", "hasker_unsigned"); // Ensure this preset exists in Cloudinary
      
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/da8i2waxr/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        finalProofUrl = uploadData.secure_url;
      } else {
        throw new Error("Failed to upload receipt. Please try again.");
      }

      // 2. Submit Application
      const payload = {
        ...form,
        payment_method: selectedMethod,
        reference_id: paymentRef,
        proof_image: finalProofUrl,
      };

      const res = await fetch(`${API_BASE}/api/v1/leads/apply/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const { message, fields } = parseBackendError(data);
        
        // Auto-navigate to step with error
        const errFields = Object.keys(fields);
        if (errFields.length > 0) {
          const first = errFields[0];
          if (["first_name", "last_name", "email", "cell_phone"].includes(first)) setStep(0);
          else if (["present_address", "city", "state", "zip_code"].includes(first)) setStep(1);
          else if (["move_in_date", "intended_stay_duration"].includes(first)) setStep(2);
          else if (["has_kids", "has_pets"].includes(first)) setStep(3);
          
          toast.error("Please fix the errors in the form", { description: message });
        } else {
          toast.error(message);
        }

        setErrors(fields);
        throw new Error(message);
      }

      const data = await res.json();
      
      // Tiered Persistence
      const profileToSave = { ...form };
      delete (profileToSave as any).confirmed;
      delete (profileToSave as any).rental_property;
      localStorage.setItem(SAVED_PROFILE_KEY, JSON.stringify(profileToSave));

      clearDraft();
      toast.success("Application Submitted!");
      router.push(`/apply/success?ref=${data.id}&name=${encodeURIComponent(form.first_name)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred. Please try again.";
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Step content ───────────────────────────────────────────────────────────

  const stepLabels = user ? STEP_LABELS_USER : STEP_LABELS_GUEST;

  return (
    <div className="space-y-5">
      {/* Step indicator */}
      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] px-5 py-5">
        <StepIndicator current={step} total={TOTAL_STEPS} labels={stepLabels} />
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
                <Label field="move_in_date">Intended Move-In Date *</Label>
                <Input field="move_in_date" type="date" value={form.move_in_date} onChange={text("move_in_date")} error={errors.move_in_date} min={new Date().toISOString().split("T")[0]} />
              </div>
              <div>
                <Label field="intended_stay_duration">Intended Stay Duration *</Label>
                <Select field="intended_stay_duration" value={form.intended_stay_duration} onChange={text("intended_stay_duration")} error={errors.intended_stay_duration}>
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
              <Label field="months_rent_upfront">Months Rent Upfront</Label>
              <Select
                field="months_rent_upfront"
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
                  {authMode === "register" ? "Create your account" : authMode === "verify" ? "Verify your email" : "Sign in to continue"}
                </h2>
                <p className="text-[12px] text-[#6E6E73]">
                  {authMode === "verify" ? "Enter the 6-digit code sent to your email" : "We'll use this to track your application and send updates"}
                </p>
              </div>
            </div>

            {authError && (
              <div className="mt-4 bg-red-50 border border-red-200/60 text-red-600 text-[12px] rounded-xl px-4 py-3 flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                {authError}
              </div>
            )}

            {authMode === "verify" ? (
              <div className="mt-5 space-y-5">
                <div className="flex justify-between gap-2 max-w-[320px] mx-auto">
                  {otpCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`apply-otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-[20px] font-semibold text-[#1D1D1F] bg-[#F5F5F7] rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-brand/30 focus:shadow-[0_0_0_1px_#1A56DB] transition-all"
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleVerify()}
                  disabled={authLoading}
                  className="w-full flex items-center justify-center gap-2 bg-brand text-white text-[13px] font-semibold py-3 rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-50"
                >
                  {authLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : "Verify & Continue"}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0}
                    className="text-[12px] text-[#6E6E73] hover:text-[#1D1D1F] transition-colors disabled:opacity-50"
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Didn't receive code? Resend"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Pre-fill notice */}
                {form.first_name && authMode === "register" && (
                  <div className="mt-4 bg-[#F5F5F7] rounded-xl px-4 py-3 flex items-start gap-2">
                    <Check size={14} className="text-[#34C759] mt-0.5 shrink-0" />
                    <p className="text-[12px] text-[#1D1D1F]">
                      Your application details are saved. After creating your account you'll verify your email and go straight to review.
                    </p>
                  </div>
                )}

                <div className="mt-5 space-y-3">
                  {authMode === "register" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>First Name</Label>
                        <Input
                          id="auth-first-name"
                          value={authForm.first_name || form.first_name}
                          onChange={(e) => setAuthForm((f) => ({ ...f, first_name: e.target.value }))}
                          placeholder="Jane"
                        />
                      </div>
                      <div>
                        <Label>Last Name</Label>
                        <Input
                          id="auth-last-name"
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
                      id="auth-email"
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
                        id="auth-password"
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
                        id="auth-confirm"
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
              </>
            )}
          </div>

          {/* Back only — no next button since next is the auth button above */}
          <button
            type="button"
            onClick={authMode === "verify" ? () => { setAuthMode("login"); setOtpCode(["", "", "", "", "", ""]); setAuthError(null); } : goBack}
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
          <Section icon={Building2} title="Review your application" sub="Confirm everything looks right before moving to payment">
            <div className="space-y-5">
              
              {/* Property Summary (New) */}
              <div className="rounded-xl bg-brand-dark text-white p-5 overflow-hidden relative">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-[10px] tracking-widest uppercase text-white/50">Applying for</p>
                    {autofilledFields.size > 0 && (
                      <button 
                        onClick={startFresh}
                        className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw size={10} /> Not you? Start fresh
                      </button>
                    )}
                  </div>
                  <h4 className="text-[18px] font-bold mb-1">{propertyData?.title || "Rental Property"}</h4>
                  <p className="text-[12px] text-white/60 mb-4">{propertyData?.address || "Selected Property"}</p>
                  
                  <div className="grid grid-cols-1 gap-4 pt-4 border-t border-white/10">
                    <div>
                      <p className="text-[10px] uppercase text-white/50 mb-0.5">Monthly Rent</p>
                      <p className="text-[16px] font-bold">${propertyData?.price || "—"}/mo</p>
                    </div>
                  </div>
                </div>
                {/* Decorative house icon in background */}
                <Building2 className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 rotate-12" />
              </div>

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

      {/* ── Payment Step ──────────────────────────────────────────────── */}
      {step === PAYMENT_STEP && (
        <Section icon={Lock} title="Pay Application Fee" sub="Choose your preferred method and upload proof of transfer">
          <div className="space-y-6">
            
            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: "CASHAPP", label: "CashApp", color: "bg-[#00D632]" },
                { id: "PAYPAL", label: "PayPal", color: "bg-[#003087]" },
                { id: "CHIME", label: "Chime", color: "bg-[#25D366]" },
                { id: "BANK_TRANSFER", label: "Zelle / Bank", color: "bg-[#6E6E73]" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMethod(m.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                    selectedMethod === m.id 
                      ? "border-brand bg-brand/5" 
                      : "border-black/[0.05] hover:border-black/10 bg-white"
                  )}
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold", m.color)}>
                    {m.label[0]}
                  </div>
                  <span className="text-[11px] font-semibold text-[#1D1D1F]">{m.label}</span>
                </button>
              ))}
            </div>

            {/* Dynamic Instructions */}
            <div className="bg-[#F5F5F7] rounded-2xl p-5 border border-black/[0.03]">
              <h4 className="text-[13px] font-bold text-[#1D1D1F] mb-3">Transfer Instructions</h4>
              
              {selectedMethod === "CASHAPP" && (
                <div className="space-y-2">
                  <p className="text-[13px] text-[#6E6E73]">Send <span className="font-bold text-[#1D1D1F]">$50.00</span> to:</p>
                  <p className="text-[18px] font-bold text-[#00D632] tracking-tight">$HaskerRealty</p>
                  <p className="text-[11px] text-[#6E6E73]">Include your full name in the CashApp notes.</p>
                </div>
              )}
              {selectedMethod === "PAYPAL" && (
                <div className="space-y-2">
                  <p className="text-[13px] text-[#6E6E73]">Send <span className="font-bold text-[#1D1D1F]">$50.00</span> via PayPal to:</p>
                  <p className="text-[16px] font-bold text-[#003087]">payments@haskerrealtygroup.com</p>
                  <p className="text-[11px] text-[#6E6E73]">Use "Friends & Family" to avoid delays.</p>
                </div>
              )}
              {selectedMethod === "CHIME" && (
                <div className="space-y-2">
                  <p className="text-[13px] text-[#6E6E73]">Send <span className="font-bold text-[#1D1D1F]">$50.00</span> to Chime user:</p>
                  <p className="text-[18px] font-bold text-[#25D366]">@Hasker-Realty</p>
                </div>
              )}
              {selectedMethod === "BANK_TRANSFER" && (
                <div className="space-y-2">
                  <p className="text-[13px] text-[#6E6E73]">Transfer <span className="font-bold text-[#1D1D1F]">$50.00</span> via Zelle or Bank:</p>
                  <div className="text-[12px] text-[#1D1D1F] font-medium leading-relaxed">
                    Account: Hasker & Co Realty<br/>
                    Zelle: info@haskerrealtygroup.com
                  </div>
                </div>
              )}
            </div>

            {/* Proof Upload */}
            <div className="space-y-4">
              <div>
                <Label>Transaction Ref / Your Username *</Label>
                <Input 
                  value={paymentRef} 
                  onChange={(e) => setPaymentRef(e.target.value)} 
                  placeholder={selectedMethod === "CASHAPP" ? "Your $CashTag" : "Confirmation # or Email"} 
                />
              </div>

              <div className="relative">
                <Label>Upload Receipt Screenshot *</Label>
                <label className={cn(
                  "flex flex-col items-center justify-center w-full aspect-[16/6] rounded-2xl border-2 border-dashed transition-all cursor-pointer",
                  proofFile ? "border-brand bg-brand/5" : "border-black/10 hover:border-black/20 bg-[#F5F5F7]"
                )}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="sr-only" 
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  />
                  {proofFile ? (
                    <div className="flex flex-col items-center text-center px-4">
                      <Check size={24} className="text-brand mb-1" />
                      <p className="text-[13px] font-semibold text-brand truncate max-w-full">{proofFile.name}</p>
                      <p className="text-[10px] text-brand/60 uppercase font-bold mt-1">Tap to change</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-[#6E6E73]">
                      <Camera size={24} className="mb-2 opacity-50" />
                      <p className="text-[13px] font-medium">Capture or Upload Receipt</p>
                      <p className="text-[11px] opacity-60 mt-1">PNG, JPG or Screenshot</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
              <Shield className="text-green-600 shrink-0" size={18} />
              <p className="text-[12px] text-green-700 leading-relaxed">
                Your payment proof will be manually verified by our team. You will receive an email once confirmed.
              </p>
            </div>

            {serverError && (
              <div className="bg-red-50 border border-red-200/60 text-red-600 text-[12px] rounded-xl px-4 py-3 flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                {serverError}
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ── Navigation ────────────────────────────────────────────────── */}
      {(step !== ACCOUNT_STEP || user) && (
        <NavButtons
          step={step}
          total={TOTAL_STEPS}
          onBack={goBack}
          onNext={goNext}
          nextLabel={step === PAYMENT_STEP ? "Pay & Submit" : step === REVIEW_STEP ? "Next" : "Continue"}
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
