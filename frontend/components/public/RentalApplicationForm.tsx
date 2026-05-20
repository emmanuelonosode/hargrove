"use client";

import { useState, useEffect, useRef } from "react";
import {
  useForm, useFieldArray, Controller,
  FormProvider, useFormContext,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, MapPin, Calendar, Users, Lock, Eye, EyeOff,
  ChevronRight, ChevronLeft, Check, AlertCircle, Building2,
  Shield, RotateCcw, Briefcase, PawPrint, Car, Trash2, Plus,
  Phone, FileText,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getStoredUTMs, trackEvent, trackMetaEvent } from "@/lib/tracking";

// ── Constants ────────────────────────────────────────────────────────────────

const API_BASE = typeof window !== "undefined"
  ? ""
  : (process.env.NEXT_PUBLIC_API_URL ?? "https://admin.haskerrealtygroup.com");
const STORAGE_KEY = "hasker_app_draft_v2";
const SAVED_PROFILE_KEY = "hasker_saved_profile_v2";
const DRAFT_ID_KEY = "hasker_app_draft_id";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

const STEP_LABELS_GUEST = ["Personal","Identity","Address","Rental","Household","Background","Account","Review"];
const STEP_LABELS_USER  = ["Personal","Identity","Address","Rental","Household","Background","Review"];

// ── Zod Schema ────────────────────────────────────────────────────────────────

const animalSchema = z.object({
  type:              z.string().min(1, "Required"),
  breed:             z.string().min(1, "Required"),
  weight:            z.string().min(1, "Required"),
  name:              z.string().min(1, "Required"),
  is_service_animal: z.boolean(),
});

const schema = z.object({
  // Step 0 – Personal
  first_name:                     z.string().min(1, "Required"),
  middle_name:                    z.string().optional(),
  last_name:                      z.string().min(1, "Required"),
  marital_status:                 z.string().min(1, "Required"),
  email:                          z.string().email("Enter a valid email"),
  cell_phone:                     z.string().min(1, "Required"),
  phone_type:                     z.string().min(1, "Required"),
  home_phone:                     z.string().optional(),
  preferred_contact:              z.enum(["email", "phone"], { error: "Select a preference" }),
  emergency_contact_name:         z.string().min(1, "Required"),
  emergency_contact_relationship: z.string().min(1, "Required"),
  emergency_contact_phone:        z.string().min(1, "Required"),
  emergency_contact_phone_type:   z.string().min(1, "Required"),

  // Step 1 – Identity & Income
  date_of_birth:          z.string().min(1, "Required"),
  id_type:                z.enum(["ssn", "ein", "neither"], { error: "Required" }),
  ssn:                    z.string().optional(),
  ein:                    z.string().optional(),
  ein_confirm:            z.string().optional(),
  has_drivers_license:    z.boolean(),
  drivers_license_number: z.string().optional(),
  drivers_license_state:  z.string().optional(),
  gross_monthly_income:   z.string().min(1, "Required"),
  employer_name:          z.string().optional(),
  employer_phone:         z.string().optional(),
  job_title:              z.string().optional(),
  employment_start_date:  z.string().optional(),

  // Step 2 – Address
  present_address:       z.string().min(1, "Required"),
  city:                  z.string().min(1, "Required"),
  state:                 z.string().length(2, "Use 2-letter code"),
  zip_code:              z.string().min(5, "Enter a valid ZIP"),
  how_long_at_address:   z.string().min(1, "Required"),
  reason_for_leaving:    z.string().min(1, "Required"),
  current_landlord_name: z.string().optional(),
  current_landlord_phone:z.string().optional(),

  // Step 3 – Rental
  move_in_date:            z.string().min(1, "Required"),
  intended_stay_duration:  z.string().min(1, "Required"),
  months_rent_upfront:     z.number().min(1),

  // Step 4 – Household
  has_kids:          z.boolean(),
  number_of_kids:    z.number(),
  has_vehicles:      z.boolean(),
  number_of_vehicles:z.number(),
  has_pets:          z.boolean(),
  animals:           z.array(animalSchema),
  smokes:            z.boolean(),
  drinks:            z.boolean(),

  // Step 5 – Background
  has_felony_eviction_bankruptcy: z.boolean({ error: "Please select Yes or No" }),
  is_active_military:             z.boolean({ error: "Please select Yes or No" }),
  has_housing_assistance:         z.boolean({ error: "Please select Yes or No" }),

  // Meta
  rental_property: z.string().nullable(),
  confirmed:       z.boolean(),
}).superRefine((d, ctx) => {
  if (d.id_type === "ssn" && (d.ssn ?? "").replace(/\D/g, "").length !== 9)
    ctx.addIssue({ code: "custom", path: ["ssn"], message: "Enter your full 9-digit SSN" });

  if (d.id_type === "ein") {
    if ((d.ein ?? "").replace(/\D/g, "").length !== 9)
      ctx.addIssue({ code: "custom", path: ["ein"], message: "Enter a valid 9-digit EIN" });
    if (d.ein !== d.ein_confirm)
      ctx.addIssue({ code: "custom", path: ["ein_confirm"], message: "EIN does not match" });
  }

  if (d.has_drivers_license) {
    if (!d.drivers_license_number?.trim())
      ctx.addIssue({ code: "custom", path: ["drivers_license_number"], message: "Required" });
    if (!d.drivers_license_state?.trim())
      ctx.addIssue({ code: "custom", path: ["drivers_license_state"], message: "Required" });
  }

  if (d.has_kids && !d.number_of_kids)
    ctx.addIssue({ code: "custom", path: ["number_of_kids"], message: "Specify number" });

  if (d.has_vehicles && !d.number_of_vehicles)
    ctx.addIssue({ code: "custom", path: ["number_of_vehicles"], message: "Specify count" });
});

type FormData = z.infer<typeof schema>;

// Fields validated per step (for trigger())
const STEP_FIELDS: (keyof FormData)[][] = [
  // 0 Personal
  ["first_name","last_name","marital_status","email","cell_phone","phone_type",
   "preferred_contact","emergency_contact_name","emergency_contact_relationship",
   "emergency_contact_phone","emergency_contact_phone_type"],
  // 1 Identity
  ["date_of_birth","id_type","ssn","ein","ein_confirm",
   "has_drivers_license","drivers_license_number","drivers_license_state","gross_monthly_income"],
  // 2 Address
  ["present_address","city","state","zip_code","how_long_at_address","reason_for_leaving"],
  // 3 Rental
  ["move_in_date","intended_stay_duration","months_rent_upfront"],
  // 4 Household
  ["has_kids","number_of_kids","has_vehicles","number_of_vehicles","has_pets"],
  // 5 Background
  ["has_felony_eviction_bankruptcy","is_active_military","has_housing_assistance"],
];

const DEFAULT_VALUES: FormData = {
  first_name:"", middle_name:"", last_name:"", marital_status:"",
  email:"", cell_phone:"", phone_type:"mobile", home_phone:"",
  preferred_contact: "email" as const,
  emergency_contact_name:"", emergency_contact_relationship:"",
  emergency_contact_phone:"", emergency_contact_phone_type:"mobile",
  date_of_birth:"", id_type: "ssn" as const, ssn:"", ein:"", ein_confirm:"",
  has_drivers_license:true, drivers_license_number:"", drivers_license_state:"",
  gross_monthly_income:"", employer_name:"", employer_phone:"",
  job_title:"", employment_start_date:"",
  present_address:"", city:"", state:"", zip_code:"",
  how_long_at_address:"", reason_for_leaving:"",
  current_landlord_name:"", current_landlord_phone:"",
  move_in_date:"", intended_stay_duration:"", months_rent_upfront:1,
  has_kids:false, number_of_kids:0,
  has_vehicles:false, number_of_vehicles:0,
  has_pets:false, animals:[],
  smokes:false, drinks:false,
  has_felony_eviction_bankruptcy: undefined as unknown as boolean,
  is_active_military:             undefined as unknown as boolean,
  has_housing_assistance:         undefined as unknown as boolean,
  rental_property:null, confirmed:false,
};

// ── Storage helpers ───────────────────────────────────────────────────────────

function saveDraftLocal(data: Partial<FormData>) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}
function loadDraftLocal(): Partial<FormData> {
  try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}"); } catch { return {}; }
}
function clearDraftLocal() {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
}
function parseBackendError(data: unknown): { message: string; fields: Record<string, string> } {
  const fields: Record<string, string> = {};
  let message = "Submission failed. Please check the errors below.";
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (typeof obj.detail === "string") message = obj.detail;
    const extract = (o: Record<string, unknown>, prefix = "") => {
      Object.keys(o).forEach(k => {
        const v = o[k]; const fk = prefix ? `${prefix}.${k}` : k;
        if (Array.isArray(v)) fields[fk] = String(v[0]);
        else if (v && typeof v === "object") extract(v as Record<string, unknown>, fk);
        else fields[fk] = String(v);
      });
    };
    extract(obj);
    if (!obj.detail && Object.keys(fields).length)
      message = `${Object.keys(fields)[0]}: ${Object.values(fields)[0]}`;
  }
  return { message, fields };
}

// ── UI Primitives ─────────────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[11px] font-semibold tracking-[0.07em] uppercase text-[#6E6E73] mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
      <AlertCircle size={10} /> {message}
    </p>
  );
}

function TextInput({
  error, className, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <div>
      <input
        {...props}
        className={cn(
          "w-full rounded-xl px-4 py-3 text-[14px] text-[#1D1D1F] bg-[#F5F5F7] outline-none transition-all",
          "focus:bg-white focus:ring-2 focus:ring-brand/30 focus:shadow-[0_0_0_1px_#1A56DB]",
          error && "ring-2 ring-red-400/50 bg-red-50/50",
          className,
        )}
      />
      <FieldError message={error} />
    </div>
  );
}

function SelectInput({
  error, children, className, ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  return (
    <div>
      <select
        {...props}
        className={cn(
          "w-full rounded-xl px-4 py-3 text-[14px] text-[#1D1D1F] bg-[#F5F5F7] outline-none transition-all appearance-none",
          "focus:bg-white focus:ring-2 focus:ring-brand/30 focus:shadow-[0_0_0_1px_#1A56DB]",
          error && "ring-2 ring-red-400/50",
          className,
        )}
      >
        {children}
      </select>
      <FieldError message={error} />
    </div>
  );
}

function Toggle({
  checked, onChange, label, sub,
}: { checked: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer py-3.5 px-4 rounded-xl hover:bg-black/[0.02] transition-colors">
      <div>
        <p className="text-[14px] font-medium text-[#1D1D1F]">{label}</p>
        {sub && <p className="text-[12px] text-[#6E6E73] mt-0.5">{sub}</p>}
      </div>
      <button
        type="button" role="switch" aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200",
          checked ? "bg-brand" : "bg-[#D1D1D6]",
        )}
      >
        <span className={cn(
          "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked && "translate-x-5",
        )} />
      </button>
    </label>
  );
}

function YesNoRadio({
  value, onChange, error,
}: { value: boolean | undefined; onChange: (v: boolean) => void; error?: string }) {
  return (
    <div>
      <div className="flex gap-3">
        {([true, false] as const).map(v => (
          <button
            key={String(v)}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              "flex-1 py-3 rounded-xl text-[13px] font-semibold border-2 transition-all",
              value === v
                ? "border-brand bg-brand text-white"
                : "border-[#E5E5EA] bg-[#F5F5F7] text-[#6E6E73] hover:border-brand/40",
            )}
          >
            {v ? "Yes" : "No"}
          </button>
        ))}
      </div>
      <FieldError message={error} />
    </div>
  );
}

function Section({
  icon: Icon, title, sub, children,
}: { icon: React.ElementType; title: string; sub?: string; children: React.ReactNode }) {
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

function Divider() {
  return <div className="h-px bg-black/[0.04] my-1" />;
}

function StepIndicator({ current, total, labels }: { current: number; total: number; labels: string[] }) {
  return (
    <>
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[13px] font-bold text-[#1D1D1F]">{labels[current]}</span>
          <span className="text-[11px] text-neutral-400 font-medium">{current + 1} of {total}</span>
        </div>
        <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand rounded-full transition-all duration-500"
            style={{ width: `${((current + 1) / total) * 100}%` }}
          />
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-0">
        {Array.from({ length: total }).map((_, i) => {
          const done = i < current; const active = i === current;
          return (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all duration-300",
                  done && "bg-brand text-white",
                  active && "bg-[#1D1D1F] text-white ring-4 ring-[#1D1D1F]/10",
                  !done && !active && "bg-[#E5E5EA] text-[#6E6E73]",
                )}>
                  {done ? <Check size={13} strokeWidth={2.5} /> : i + 1}
                </div>
                <span className={cn(
                  "text-[9px] font-semibold mt-1 tracking-wide uppercase whitespace-nowrap",
                  active ? "text-[#1D1D1F]" : done ? "text-brand" : "text-[#C7C7CC]",
                )}>
                  {labels[i]}
                </span>
              </div>
              {i < total - 1 && (
                <div className={cn(
                  "flex-1 h-px mx-1 sm:mx-2 mt-0 sm:-mt-4 transition-colors duration-300",
                  i < current ? "bg-brand" : "bg-[#E5E5EA]",
                )} />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function NavButtons({
  step, total, onBack, onNext, nextLabel = "Continue", loading = false,
}: {
  step: number; total: number;
  onBack: () => void; onNext: () => void;
  nextLabel?: string; loading?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {step > 0 && (
        <button
          type="button" onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-[#6E6E73] hover:text-[#1D1D1F] transition-colors px-4 py-3 rounded-xl hover:bg-black/[0.04]"
        >
          <ChevronLeft size={15} strokeWidth={2.5} /> Back
        </button>
      )}
      <button
        type="button" onClick={onNext} disabled={loading}
        className="flex-1 flex items-center justify-center gap-1.5 bg-brand text-white text-[13px] font-semibold px-6 py-3 rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing…
          </span>
        ) : (
          <>{nextLabel}{step < total - 1 && <ChevronRight size={15} strokeWidth={2.5} />}</>
        )}
      </button>
    </div>
  );
}

// ── Step 0: Personal Info ─────────────────────────────────────────────────────

function Step0_Personal() {
  const { register, control, formState: { errors } } = useFormContext<FormData>();
  return (
    <>
      <Section icon={User} title="Personal Information" sub="Basic details for your application">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <FieldLabel required>First Name</FieldLabel>
              <TextInput {...register("first_name")} placeholder="Jane" error={errors.first_name?.message} />
            </div>
            <div>
              <FieldLabel>Middle Name</FieldLabel>
              <TextInput {...register("middle_name")} placeholder="Optional" />
            </div>
            <div>
              <FieldLabel required>Last Name</FieldLabel>
              <TextInput {...register("last_name")} placeholder="Smith" error={errors.last_name?.message} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel required>Marital Status</FieldLabel>
              <SelectInput {...register("marital_status")} error={errors.marital_status?.message}>
                <option value="">Select…</option>
                {["Single","Married","Divorced","Separated","Widowed"].map(s => (
                  <option key={s} value={s.toLowerCase()}>{s}</option>
                ))}
              </SelectInput>
            </div>
            <div>
              <FieldLabel required>Email</FieldLabel>
              <TextInput type="email" {...register("email")} placeholder="you@example.com" error={errors.email?.message} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <FieldLabel required>Cell Phone</FieldLabel>
              <TextInput type="tel" {...register("cell_phone")} placeholder="+1 555-000-0000" error={errors.cell_phone?.message} />
            </div>
            <div>
              <FieldLabel required>Phone Type</FieldLabel>
              <SelectInput {...register("phone_type")} error={errors.phone_type?.message}>
                <option value="mobile">Mobile</option>
                <option value="home">Home</option>
                <option value="work">Work</option>
              </SelectInput>
            </div>
          </div>

          <div>
            <FieldLabel>Home Phone (optional)</FieldLabel>
            <TextInput type="tel" {...register("home_phone")} placeholder="+1 555-000-0000" />
          </div>

          <div>
            <FieldLabel required>Preferred Contact Method</FieldLabel>
            <Controller
              control={control}
              name="preferred_contact"
              render={({ field }) => (
                <div className="flex gap-3">
                  {(["email","phone"] as const).map(v => (
                    <button
                      key={v} type="button"
                      onClick={() => field.onChange(v)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold border-2 transition-all",
                        field.value === v
                          ? "border-brand bg-brand text-white"
                          : "border-[#E5E5EA] bg-[#F5F5F7] text-[#6E6E73] hover:border-brand/40",
                      )}
                    >
                      {v === "email" ? <FileText size={14} /> : <Phone size={14} />}
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            />
            <FieldError message={errors.preferred_contact?.message} />
          </div>
        </div>
      </Section>

      <Section icon={Shield} title="Emergency Contact" sub="Who should we contact in case of emergency?">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel required>Full Name</FieldLabel>
              <TextInput {...register("emergency_contact_name")} placeholder="Contact name" error={errors.emergency_contact_name?.message} />
            </div>
            <div>
              <FieldLabel required>Relationship</FieldLabel>
              <SelectInput {...register("emergency_contact_relationship")} error={errors.emergency_contact_relationship?.message}>
                <option value="">Select…</option>
                {["Spouse","Parent","Sibling","Child","Friend","Other"].map(r => (
                  <option key={r} value={r.toLowerCase()}>{r}</option>
                ))}
              </SelectInput>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel required>Phone Number</FieldLabel>
              <TextInput type="tel" {...register("emergency_contact_phone")} placeholder="+1 555-000-0000" error={errors.emergency_contact_phone?.message} />
            </div>
            <div>
              <FieldLabel required>Phone Type</FieldLabel>
              <SelectInput {...register("emergency_contact_phone_type")} error={errors.emergency_contact_phone_type?.message}>
                <option value="mobile">Mobile</option>
                <option value="home">Home</option>
                <option value="work">Work</option>
              </SelectInput>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

// ── Step 1: Identity & Income ─────────────────────────────────────────────────

function Step1_Identity() {
  const { register, control, watch, formState: { errors } } = useFormContext<FormData>();
  const idType = watch("id_type");
  const hasDL  = watch("has_drivers_license");
  const monthly = watch("gross_monthly_income");
  const annual  = monthly ? `$${(parseFloat(monthly.replace(/,/g, "")) * 12).toLocaleString("en-US")}` : "—";

  return (
    <>
      <Section icon={FileText} title="Identity" sub="Used for background and credit screening">
        <div className="space-y-4">
          <div>
            <FieldLabel required>Date of Birth</FieldLabel>
            <TextInput type="date" {...register("date_of_birth")} error={errors.date_of_birth?.message}
              max={new Date(Date.now() - 18 * 365.25 * 86400000).toISOString().split("T")[0]}
            />
          </div>

          <div>
            <FieldLabel required>Type of ID</FieldLabel>
            <Controller
              control={control}
              name="id_type"
              render={({ field }) => (
                <div className="flex gap-3">
                  {(["ssn","ein","neither"] as const).map(v => (
                    <button
                      key={v} type="button"
                      onClick={() => field.onChange(v)}
                      className={cn(
                        "flex-1 py-3 rounded-xl text-[13px] font-semibold border-2 transition-all",
                        field.value === v
                          ? "border-brand bg-brand text-white"
                          : "border-[#E5E5EA] bg-[#F5F5F7] text-[#6E6E73] hover:border-brand/40",
                      )}
                    >
                      {v.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            />
            <FieldError message={errors.id_type?.message} />
          </div>

          {idType === "ssn" && (
            <div>
              <FieldLabel required>Social Security Number</FieldLabel>
              <TextInput
                {...register("ssn")}
                type="password"
                inputMode="numeric"
                placeholder="•••-••-••••"
                maxLength={11}
                autoComplete="off"
                error={errors.ssn?.message}
              />
              <p className="mt-1 text-[10px] text-[#6E6E73]">Only the last 4 digits are stored. Your full SSN is never saved.</p>
            </div>
          )}

          {idType === "ein" && (
            <div className="space-y-3">
              <div>
                <FieldLabel required>Employer Identification Number (EIN)</FieldLabel>
                <TextInput {...register("ein")} placeholder="XX-XXXXXXX" error={errors.ein?.message} />
              </div>
              <div>
                <FieldLabel required>Confirm EIN</FieldLabel>
                <TextInput {...register("ein_confirm")} placeholder="Re-enter EIN" error={errors.ein_confirm?.message} />
              </div>
            </div>
          )}

          <Divider />

          <div>
            <Controller
              control={control}
              name="has_drivers_license"
              render={({ field }) => (
                <label className="flex items-center gap-3 cursor-pointer py-2">
                  <input
                    type="checkbox"
                    checked={!field.value}
                    onChange={e => field.onChange(!e.target.checked)}
                    className="w-4 h-4 rounded accent-brand"
                  />
                  <span className="text-[13px] text-[#1D1D1F]">I do not have a driver&apos;s license</span>
                </label>
              )}
            />
          </div>

          {hasDL && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <FieldLabel required>Driver&apos;s License Number</FieldLabel>
                <TextInput {...register("drivers_license_number")} placeholder="DL number" error={errors.drivers_license_number?.message} />
              </div>
              <div>
                <FieldLabel required>State</FieldLabel>
                <SelectInput {...register("drivers_license_state")} error={errors.drivers_license_state?.message}>
                  <option value="">State</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </SelectInput>
              </div>
            </div>
          )}
        </div>
      </Section>

      <Section icon={Briefcase} title="Income & Employment" sub="Financial information for your application">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel required>Gross Monthly Income</FieldLabel>
              <TextInput
                {...register("gross_monthly_income")}
                type="text"
                inputMode="numeric"
                placeholder="$0.00"
                error={errors.gross_monthly_income?.message}
              />
            </div>
            <div>
              <FieldLabel>Gross Annual Salary</FieldLabel>
              <div className="w-full rounded-xl px-4 py-3 text-[14px] bg-[#F5F5F7] text-[#6E6E73] font-semibold select-none">
                {annual}
              </div>
              <p className="mt-1 text-[10px] text-[#6E6E73]">Calculated from monthly × 12</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Employer / Company</FieldLabel>
              <TextInput {...register("employer_name")} placeholder="Company name" />
            </div>
            <div>
              <FieldLabel>Employer Phone</FieldLabel>
              <TextInput type="tel" {...register("employer_phone")} placeholder="+1 555-000-0000" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Job Title</FieldLabel>
              <TextInput {...register("job_title")} placeholder="e.g. Software Engineer" />
            </div>
            <div>
              <FieldLabel>Employment Start Date</FieldLabel>
              <TextInput type="date" {...register("employment_start_date")} />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

// ── Step 2: Current Address ───────────────────────────────────────────────────

function Step2_Address() {
  const { register, formState: { errors } } = useFormContext<FormData>();
  return (
    <>
      <Section icon={MapPin} title="Current Address" sub="Where do you currently live?">
        <div className="space-y-4">
          <div>
            <FieldLabel required>Street Address</FieldLabel>
            <TextInput {...register("present_address")} placeholder="123 Main Street, Apt 4B" error={errors.present_address?.message} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <FieldLabel required>City</FieldLabel>
              <TextInput {...register("city")} placeholder="Atlanta" error={errors.city?.message} />
            </div>
            <div>
              <FieldLabel required>State</FieldLabel>
              <SelectInput {...register("state")} error={errors.state?.message}>
                <option value="">State</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </SelectInput>
            </div>
            <div>
              <FieldLabel required>ZIP Code</FieldLabel>
              <TextInput {...register("zip_code")} placeholder="30301" error={errors.zip_code?.message} />
            </div>
          </div>
          <div>
            <FieldLabel required>How long at this address?</FieldLabel>
            <SelectInput {...register("how_long_at_address")} error={errors.how_long_at_address?.message}>
              <option value="">Select…</option>
              {["Less than 6 months","6–12 months","1–2 years","2–5 years","5+ years"].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </SelectInput>
          </div>
          <div>
            <FieldLabel required>Reason for leaving</FieldLabel>
            <SelectInput {...register("reason_for_leaving")} error={errors.reason_for_leaving?.message}>
              <option value="">Select…</option>
              {[
                "End of lease","Relocation","Better home","Price increase",
                "Building sold","Buying a home","Other",
              ].map(v => <option key={v} value={v}>{v}</option>)}
            </SelectInput>
          </div>
        </div>
      </Section>

      <Section icon={Building2} title="Current Landlord" sub="Optional but helps speed up the process">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Landlord / Property Manager Name</FieldLabel>
              <TextInput {...register("current_landlord_name")} placeholder="Name or company" />
            </div>
            <div>
              <FieldLabel>Landlord Phone</FieldLabel>
              <TextInput type="tel" {...register("current_landlord_phone")} placeholder="+1 555-000-0000" />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

// ── Step 3: Rental Preferences ────────────────────────────────────────────────

function Step3_Rental() {
  const { register, formState: { errors }, setValue, watch } = useFormContext<FormData>();
  return (
    <Section icon={Calendar} title="Rental Preferences" sub="When do you want to move in?">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <FieldLabel required>Intended Move-In Date</FieldLabel>
            <TextInput
              type="date"
              {...register("move_in_date")}
              min={new Date().toISOString().split("T")[0]}
              error={errors.move_in_date?.message}
            />
          </div>
          <div>
            <FieldLabel required>Intended Stay Duration</FieldLabel>
            <SelectInput {...register("intended_stay_duration")} error={errors.intended_stay_duration?.message}>
              <option value="">Select…</option>
              <option value="3 months">3 months</option>
              <option value="6 months">6 months</option>
              <option value="12 months">12 months (1 year)</option>
              <option value="24 months">24 months (2 years)</option>
              <option value="36 months">36 months (3 years)</option>
              <option value="Flexible">Flexible / Month-to-month</option>
            </SelectInput>
          </div>
        </div>
        <div>
          <FieldLabel>Months Rent Upfront</FieldLabel>
          <SelectInput
            value={watch("months_rent_upfront")}
            onChange={e => setValue("months_rent_upfront", Number(e.target.value))}
          >
            {[1,2,3,6,12].map(n => <option key={n} value={n}>{n} month{n > 1 ? "s" : ""}</option>)}
          </SelectInput>
          <p className="mt-1.5 text-[11px] text-[#6E6E73]">First and last month&apos;s rent is standard.</p>
        </div>
      </div>
    </Section>
  );
}

// ── Step 4: Household & Animals ───────────────────────────────────────────────

function Step4_Household({
  animalFields, appendAnimal, removeAnimal,
}: {
  animalFields: { id: string }[];
  appendAnimal: (a: FormData["animals"][0]) => void;
  removeAnimal: (i: number) => void;
}) {
  const { register, control, watch, formState: { errors } } = useFormContext<FormData>();
  const hasKids    = watch("has_kids");
  const hasVehicles = watch("has_vehicles");
  const hasPets    = watch("has_pets");

  return (
    <Section icon={Users} title="Household" sub="Tell us who and what will live in the property">
      <div className="space-y-1">
        {/* Children */}
        <Controller control={control} name="has_kids"
          render={({ field }) => (
            <Toggle checked={field.value} onChange={field.onChange}
              label="Minors or legal dependents" sub="Children who will live in the property" />
          )}
        />
        {hasKids && (
          <div className="px-4 pb-3">
            <FieldLabel required>Number of dependents</FieldLabel>
            <TextInput
              type="number" min={1}
              {...register("number_of_kids", { valueAsNumber: true })}
              className="max-w-[120px]"
              error={errors.number_of_kids?.message}
            />
          </div>
        )}

        <Divider />

        {/* Vehicles */}
        <Controller control={control} name="has_vehicles"
          render={({ field }) => (
            <Toggle checked={field.value} onChange={field.onChange}
              label="Motor vehicles" sub="Cars, trucks, or motorcycles" />
          )}
        />
        {hasVehicles && (
          <div className="px-4 pb-3">
            <FieldLabel required>Number of vehicles</FieldLabel>
            <TextInput
              type="number" min={1}
              {...register("number_of_vehicles", { valueAsNumber: true })}
              className="max-w-[120px]"
              error={errors.number_of_vehicles?.message}
            />
          </div>
        )}

        <Divider />

        {/* Pets / Animals */}
        <Controller control={control} name="has_pets"
          render={({ field }) => (
            <Toggle checked={field.value} onChange={field.onChange}
              label="Pets or service animals" sub="Any animal that will live in the property" />
          )}
        />

        {hasPets && (
          <div className="px-4 pb-4 space-y-4">
            {animalFields.length === 0 && (
              <p className="text-[12px] text-[#6E6E73]">No animals added yet. Click &quot;Add an animal&quot; below.</p>
            )}
            {animalFields.map((field, index) => (
              <div key={field.id} className="relative rounded-xl border border-[#E5E5EA] p-4 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[12px] font-semibold text-[#1D1D1F] flex items-center gap-1.5">
                    <PawPrint size={13} className="text-amber-500" />
                    Animal {index + 1}
                  </p>
                  <button type="button" onClick={() => removeAnimal(index)}
                    className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel required>Animal Type</FieldLabel>
                    <SelectInput
                      {...register(`animals.${index}.type`)}
                      error={(errors.animals as any)?.[index]?.type?.message}
                    >
                      <option value="">Select…</option>
                      {["Dog","Cat","Bird","Reptile","Fish","Small Animal","Other"].map(t => (
                        <option key={t} value={t.toLowerCase()}>{t}</option>
                      ))}
                    </SelectInput>
                  </div>
                  <div>
                    <FieldLabel required>Name</FieldLabel>
                    <TextInput
                      {...register(`animals.${index}.name`)}
                      placeholder="Pet name"
                      error={(errors.animals as any)?.[index]?.name?.message}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel required>Breed</FieldLabel>
                    <TextInput
                      {...register(`animals.${index}.breed`)}
                      placeholder="e.g. Labrador"
                      error={(errors.animals as any)?.[index]?.breed?.message}
                    />
                  </div>
                  <div>
                    <FieldLabel required>Weight (lbs)</FieldLabel>
                    <TextInput
                      {...register(`animals.${index}.weight`)}
                      type="number" min={1} placeholder="lbs"
                      error={(errors.animals as any)?.[index]?.weight?.message}
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel>Is this a service animal?</FieldLabel>
                  <Controller
                    control={control}
                    name={`animals.${index}.is_service_animal`}
                    render={({ field: f }) => (
                      <YesNoRadio value={f.value} onChange={f.onChange} />
                    )}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => appendAnimal({ type:"", breed:"", weight:"", name:"", is_service_animal:false })}
              className="flex items-center gap-2 text-[13px] font-semibold text-brand hover:text-brand-hover transition-colors py-2.5 px-4 rounded-xl border-2 border-dashed border-brand/30 hover:border-brand/60 w-full justify-center"
            >
              <Plus size={15} /> Add an animal
            </button>
          </div>
        )}

        <Divider />
        <Controller control={control} name="smokes"
          render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="I smoke" />}
        />
        <Divider />
        <Controller control={control} name="drinks"
          render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="I drink alcohol" />}
        />
      </div>
    </Section>
  );
}

// ── Step 5: Background & Status ───────────────────────────────────────────────

function Step5_Background() {
  const { control, formState: { errors } } = useFormContext<FormData>();
  const questions: { name: keyof FormData; label: string; sub: string }[] = [
    {
      name: "has_felony_eviction_bankruptcy",
      label: "Criminal or rental history",
      sub: "Do you have any past or current felonies, evictions, bankruptcies, or pending criminal charges?",
    },
    {
      name: "is_active_military",
      label: "Active military service",
      sub: "Are you currently serving in the active military?",
    },
    {
      name: "has_housing_assistance",
      label: "Housing assistance",
      sub: "Will you be receiving rental assistance from a public housing authority (Section 8, etc.)?",
    },
  ];

  return (
    <Section icon={Shield} title="Background & Status" sub="Required disclosures for all applicants">
      <div className="space-y-6">
        {questions.map(({ name, label, sub }) => (
          <div key={name}>
            <p className="text-[14px] font-semibold text-[#1D1D1F] mb-0.5">{label}</p>
            <p className="text-[12px] text-[#6E6E73] mb-3">{sub}</p>
            <Controller
              control={control}
              name={name}
              render={({ field }) => (
                <YesNoRadio
                  value={field.value as boolean | undefined}
                  onChange={field.onChange}
                  error={(errors[name] as any)?.message}
                />
              )}
            />
          </div>
        ))}
      </div>
    </Section>
  );
}

// ── Review Step ───────────────────────────────────────────────────────────────

function ReviewStep({
  propertyData, onEdit, serverError, autofilledFields, startFresh,
}: {
  propertyData: any;
  onEdit: (step: number) => void;
  serverError: string | null;
  autofilledFields: Set<string>;
  startFresh: () => void;
}) {
  const { watch, control, formState: { errors } } = useFormContext<FormData>();
  const f = watch();

  const sections = [
    {
      title: "Personal", step: 0,
      rows: [
        ["Name", [f.first_name, f.middle_name, f.last_name].filter(Boolean).join(" ")],
        ["Marital Status", f.marital_status],
        ["Email", f.email],
        ["Cell Phone", `${f.cell_phone} (${f.phone_type})`],
        f.home_phone && ["Home Phone", f.home_phone],
        ["Preferred Contact", f.preferred_contact],
        ["Emergency Contact", f.emergency_contact_name
          ? `${f.emergency_contact_name} (${f.emergency_contact_relationship}) — ${f.emergency_contact_phone}`
          : ""],
      ].filter(Boolean) as [string, string][],
    },
    {
      title: "Identity & Income", step: 1,
      rows: [
        ["Date of Birth", f.date_of_birth],
        ["ID Type", (f.id_type ?? "").toUpperCase()],
        f.id_type === "ssn" && ["SSN", "•••-••-" + (f.ssn ?? "").replace(/\D/g, "").slice(-4)],
        f.id_type === "ein" && ["EIN", f.ein ?? ""],
        ["Driver's License", f.has_drivers_license
          ? `${f.drivers_license_number} (${f.drivers_license_state})`
          : "None"],
        ["Gross Monthly Income", f.gross_monthly_income ? `$${f.gross_monthly_income}` : ""],
        f.employer_name && ["Employer", f.employer_name],
        f.job_title && ["Job Title", f.job_title],
      ].filter(Boolean) as [string, string][],
    },
    {
      title: "Address", step: 2,
      rows: [
        ["Street", f.present_address],
        ["City / State / ZIP", `${f.city}, ${(f.state ?? "").toUpperCase()} ${f.zip_code}`],
        ["Time at Address", f.how_long_at_address],
        ["Reason for Leaving", f.reason_for_leaving],
        f.current_landlord_name && ["Landlord", f.current_landlord_name],
      ].filter(Boolean) as [string, string][],
    },
    {
      title: "Rental Preferences", step: 3,
      rows: [
        ["Move-In Date", f.move_in_date
          ? new Date(f.move_in_date + "T00:00:00").toLocaleDateString("en-US", { month:"long", day:"numeric", year:"numeric" })
          : ""],
        ["Duration", f.intended_stay_duration],
        ["Months Upfront", `${f.months_rent_upfront} month${f.months_rent_upfront > 1 ? "s" : ""}`],
      ],
    },
    {
      title: "Household", step: 4,
      rows: [
        ["Children", f.has_kids ? `Yes — ${f.number_of_kids}` : "No"],
        ["Vehicles", f.has_vehicles ? `Yes — ${f.number_of_vehicles}` : "No"],
        ["Animals", f.has_pets && f.animals.length
          ? f.animals.map(a => `${a.name} (${a.type}, ${a.weight}lbs${a.is_service_animal ? ", service" : ""})`).join("; ")
          : "None"],
        ["Smokes", f.smokes ? "Yes" : "No"],
        ["Drinks", f.drinks ? "Yes" : "No"],
      ],
    },
    {
      title: "Background", step: 5,
      rows: [
        ["Felony / Eviction / Bankruptcy", f.has_felony_eviction_bankruptcy === true ? "Yes" : f.has_felony_eviction_bankruptcy === false ? "No" : "—"],
        ["Active Military", f.is_active_military === true ? "Yes" : f.is_active_military === false ? "No" : "—"],
        ["Housing Assistance", f.has_housing_assistance === true ? "Yes" : f.has_housing_assistance === false ? "No" : "—"],
      ],
    },
  ];

  return (
    <Section icon={Building2} title="Review your application" sub="Confirm everything looks right before submitting">
      <div className="space-y-5">
        {/* Property card */}
        <div className="rounded-xl bg-brand-dark text-white p-5 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-1">
              <p className="text-[10px] tracking-widest uppercase text-white/50">Applying for</p>
              {autofilledFields.size > 0 && (
                <button onClick={startFresh}
                  className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white flex items-center gap-1 transition-colors">
                  <RotateCcw size={10} /> Start fresh
                </button>
              )}
            </div>
            <h4 className="text-[18px] font-bold mb-1">{propertyData?.title || "Rental Property"}</h4>
            <p className="text-[12px] text-white/60 mb-4">{propertyData?.address || ""}</p>
            <div className="pt-4 border-t border-white/10">
              <p className="text-[10px] uppercase text-white/50 mb-0.5">Monthly Rent</p>
              <p className="text-[16px] font-bold">${propertyData?.price || "—"}/mo</p>
            </div>
          </div>
          <Building2 className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 rotate-12" />
        </div>

        {/* Summary sections */}
        {sections.map(({ title, step, rows }) => (
          <div key={title} className="rounded-xl bg-[#F5F5F7] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/[0.04]">
              <p className="text-[11px] font-semibold tracking-[0.07em] uppercase text-[#6E6E73]">{title}</p>
              <button type="button" onClick={() => onEdit(step)}
                className="text-[11px] font-semibold text-brand hover:underline">
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
          <Controller
            control={control}
            name="confirmed"
            render={({ field }) => (
              <label className="flex items-start gap-3 cursor-pointer">
                <div
                  role="checkbox" aria-checked={field.value}
                  onClick={() => field.onChange(!field.value)}
                  className={cn(
                    "w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border-2 transition-all cursor-pointer",
                    field.value ? "bg-brand border-brand" : "bg-white border-black/20 hover:border-brand",
                  )}
                >
                  {field.value && <Check size={12} className="text-white" strokeWidth={3} />}
                </div>
                <span className="text-[13px] font-medium text-[#1D1D1F]">
                  I confirm all information is accurate and complete.
                </span>
              </label>
            )}
          />
          {errors.confirmed && (
            <p className="mt-2 text-[11px] text-red-500 flex items-center gap-1">
              <AlertCircle size={11} /> Please confirm before submitting
            </p>
          )}
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200/60 text-red-600 text-[12px] rounded-xl px-4 py-3 flex items-start gap-2">
            <AlertCircle size={14} className="shrink-0 mt-0.5" /> {serverError}
          </div>
        )}
      </div>
    </Section>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface Props { propertySlug?: string }

export function RentalApplicationForm({ propertySlug }: Props) {
  const { user, login, register: authRegister, verifyEmail, resendOTP, fetchLatestProfile } = useAuth();
  const router = useRouter();

  const [step, setStep]           = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [propertyData, setPropertyData] = useState<any>(null);
  const [autofilledFields, setAutofilledFields] = useState<Set<string>>(new Set());
  const [draftId, setDraftId] = useState<number | null>(() => {
    try { const s = sessionStorage.getItem(DRAFT_ID_KEY); return s ? parseInt(s, 10) : null; } catch { return null; }
  });

  const hasStartedRef   = useRef(false);
  const isSubmittedRef  = useRef(false);

  // Auth gate state
  const [authMode, setAuthMode]     = useState<"register"|"login"|"verify">("register");
  const [authForm, setAuthForm]     = useState({ email:"", password:"", confirm:"", first_name:"", last_name:"" });
  const [authError, setAuthError]   = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [showPass, setShowPass]     = useState(false);
  const [otpCode, setOtpCode]       = useState(["","","","","",""]);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Step offsets
  const ACCOUNT_STEP = 6;
  const REVIEW_STEP  = user ? 6 : 7;
  const TOTAL_STEPS  = user ? 7 : 8;

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...DEFAULT_VALUES,
      ...loadDraftLocal(),
      rental_property: propertySlug ?? null,
    },
    mode: "onTouched",
  });

  const {
    control, register, watch, trigger, getValues, setValue, reset,
    formState: { errors },
  } = methods;

  const { fields: animalFields, append: appendAnimal, remove: removeAnimal } = useFieldArray({
    control, name: "animals",
  });

  // Persist draft to session storage on every change
  useEffect(() => {
    const sub = methods.watch(data => saveDraftLocal(data as Partial<FormData>));
    return () => sub.unsubscribe();
  }, [methods]);

  // Fetch property info
  useEffect(() => {
    if (!propertySlug) return;
    fetch(`${API_BASE}/api/v1/properties/${propertySlug}/`)
      .then(r => r.json()).then(setPropertyData).catch(() => {});
  }, [propertySlug]);

  // Pre-fill from auth user
  useEffect(() => {
    if (user) {
      if (!getValues("first_name")) setValue("first_name", user.first_name);
      if (!getValues("last_name"))  setValue("last_name",  user.last_name);
      if (!getValues("email"))      setValue("email",      user.email);
    }
  }, [user, getValues, setValue]);

  // Fast-track returning applicant
  useEffect(() => {
    if (user && !sessionStorage.getItem(STORAGE_KEY)) {
      fetchLatestProfile()
        .then(profile => {
          if (!profile) return;
          reset({ ...DEFAULT_VALUES, ...profile, rental_property: propertySlug ?? null });
          setAutofilledFields(new Set(Object.keys(profile)));
          setStep(REVIEW_STEP);
          toast.success(`Welcome back, ${profile.first_name}! We've loaded your details.`);
        }).catch(() => {});
    }
  }, [user]);// eslint-disable-line

  // Skip account step after auth
  useEffect(() => {
    if (user && step === ACCOUNT_STEP) setStep(REVIEW_STEP);
  }, [user, step, ACCOUNT_STEP, REVIEW_STEP]);

  // Guest: pre-fill from localStorage
  useEffect(() => {
    if (!user && !sessionStorage.getItem(STORAGE_KEY)) {
      const saved = localStorage.getItem(SAVED_PROFILE_KEY);
      if (!saved) return;
      try {
        const profile = JSON.parse(saved);
        reset({ ...DEFAULT_VALUES, ...profile, rental_property: propertySlug ?? null });
        setAutofilledFields(new Set(Object.keys(profile)));
        toast.info("Welcome back! We've pre-filled the form from your last visit.");
      } catch {}
    }
  }, []);// eslint-disable-line

  // Exit-intent save notice
  useEffect(() => {
    if (step === 0) return;
    const fn = () => {
      if (document.hidden && !isSubmittedRef.current)
        toast.info("Your progress is saved — come back any time to finish.", { duration: 4000 });
    };
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, [step]);

  // Abandon tracking
  useEffect(() => {
    const fn = () => {
      if (hasStartedRef.current && !isSubmittedRef.current)
        window.dataLayer?.push({ event:"application_abandoned", step_reached:step });
    };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, [step]);

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (resendCooldown > 0) t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // ── Draft save to backend ──────────────────────────────────────────────────

  function saveDraftToBackend(currentStep: number) {
    const d = getValues();
    if (!d.email) return;

    const payload: Record<string, unknown> = {
      email: d.email,
      ...(draftId ? { draft_id: draftId } : {}),
    };

    if (currentStep >= 0) {
      Object.assign(payload, {
        first_name: d.first_name, middle_name: d.middle_name, last_name: d.last_name,
        marital_status: d.marital_status, cell_phone: d.cell_phone, home_phone: d.home_phone,
        phone_type: d.phone_type, preferred_contact: d.preferred_contact,
        emergency_contact_name: d.emergency_contact_name,
        emergency_contact_relationship: d.emergency_contact_relationship,
        emergency_contact_phone: d.emergency_contact_phone,
        emergency_contact_phone_type: d.emergency_contact_phone_type,
      });
    }
    if (currentStep >= 1) {
      Object.assign(payload, {
        date_of_birth: d.date_of_birth, id_type: d.id_type,
        ssn_last4: d.id_type === "ssn" ? (d.ssn ?? "").replace(/\D/g, "").slice(-4) : "",
        ein: d.id_type === "ein" ? d.ein : "",
        has_drivers_license: d.has_drivers_license,
        drivers_license_number: d.has_drivers_license ? d.drivers_license_number : "",
        drivers_license_state:  d.has_drivers_license ? d.drivers_license_state : "",
        gross_monthly_income: d.gross_monthly_income,
        employer_name: d.employer_name, employer_phone: d.employer_phone,
        job_title: d.job_title, employment_start_date: d.employment_start_date,
      });
    }
    if (currentStep >= 2) {
      Object.assign(payload, {
        present_address: d.present_address, city: d.city, state: d.state, zip_code: d.zip_code,
        how_long_at_address: d.how_long_at_address, reason_for_leaving: d.reason_for_leaving,
        current_landlord_name: d.current_landlord_name, current_landlord_phone: d.current_landlord_phone,
      });
    }
    if (currentStep >= 3) {
      Object.assign(payload, {
        move_in_date: d.move_in_date, intended_stay_duration: d.intended_stay_duration,
        months_rent_upfront: d.months_rent_upfront,
        ...(d.rental_property ? { rental_property: d.rental_property } : {}),
      });
    }
    if (currentStep >= 4) {
      Object.assign(payload, {
        has_kids: d.has_kids, number_of_kids: d.number_of_kids,
        has_vehicles: d.has_vehicles, number_of_vehicles: d.number_of_vehicles,
        has_pets: d.has_pets, animals: d.animals,
        smokes: d.smokes, drinks: d.drinks,
      });
    }
    if (currentStep >= 5) {
      Object.assign(payload, {
        has_felony_eviction_bankruptcy: d.has_felony_eviction_bankruptcy,
        is_active_military: d.is_active_military,
        has_housing_assistance: d.has_housing_assistance,
      });
    }

    const utms = getStoredUTMs();
    if (utms.utm_source)   payload.utm_source   = utms.utm_source;
    if (utms.utm_medium)   payload.utm_medium   = utms.utm_medium;
    if (utms.utm_campaign) payload.utm_campaign = utms.utm_campaign;

    fetch(`${API_BASE}/api/v1/leads/apply/save-draft/`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify(payload),
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.draft_id) {
          setDraftId(data.draft_id);
          try { sessionStorage.setItem(DRAFT_ID_KEY, String(data.draft_id)); } catch {}
        }
      }).catch(() => {});
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  function goBack() {
    setServerError(null);
    if (step === REVIEW_STEP) { setStep(user ? 5 : ACCOUNT_STEP); return; }
    if (!user && step === ACCOUNT_STEP) { setStep(5); return; }
    setStep(s => Math.max(0, s - 1));
  }

  async function goNext() {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      trackEvent("application_started", { property_slug: propertySlug ?? "" });
      trackMetaEvent("InitiateCheckout", { content_ids: [propertySlug ?? ""], content_type:"property" });
    }

    if (step === REVIEW_STEP) { await handleSubmit(); return; }
    if (step === ACCOUNT_STEP) return;

    // Validate current step fields
    const stepFields = STEP_FIELDS[step] ?? [];
    let valid = await trigger(stepFields);

    // Extra validation for animals
    if (step === 4 && watch("has_pets")) {
      if (animalFields.length === 0) {
        toast.error("Please add at least one animal");
        return;
      }
      const animalPaths = animalFields.flatMap((_, i) =>
        [`animals.${i}.type`, `animals.${i}.breed`, `animals.${i}.weight`, `animals.${i}.name`]
      ) as (keyof FormData)[];
      const animalsOk = await trigger(animalPaths);
      if (!animalsOk) valid = false;
    }

    if (!valid) return;

    saveDraftToBackend(step);

    if (!user && step === 5) { setStep(ACCOUNT_STEP); return; }
    if (user  && step === 5) { setStep(REVIEW_STEP);  return; }
    setStep(s => s + 1);
  }

  // ── Final Submit ──────────────────────────────────────────────────────────

  async function handleSubmit() {
    const confirmed = getValues("confirmed");
    if (!confirmed) {
      await trigger("confirmed");
      return;
    }

    setSubmitting(true); setServerError(null);
    try {
      const d = getValues();
      const utms = getStoredUTMs();
      const body: Record<string, unknown> = {
        first_name: d.first_name, middle_name: d.middle_name, last_name: d.last_name,
        marital_status: d.marital_status, email: d.email,
        cell_phone: d.cell_phone, home_phone: d.home_phone, phone_type: d.phone_type,
        preferred_contact: d.preferred_contact,
        emergency_contact_name: d.emergency_contact_name,
        emergency_contact_relationship: d.emergency_contact_relationship,
        emergency_contact_phone: d.emergency_contact_phone,
        emergency_contact_phone_type: d.emergency_contact_phone_type,
        date_of_birth: d.date_of_birth, id_type: d.id_type,
        ssn_last4: d.id_type === "ssn" ? (d.ssn ?? "").replace(/\D/g, "").slice(-4) : "",
        ein: d.id_type === "ein" ? d.ein : "",
        has_drivers_license: d.has_drivers_license,
        drivers_license_number: d.has_drivers_license ? d.drivers_license_number : "",
        drivers_license_state:  d.has_drivers_license ? d.drivers_license_state : "",
        gross_monthly_income: d.gross_monthly_income,
        employer_name: d.employer_name, employer_phone: d.employer_phone,
        job_title: d.job_title, employment_start_date: d.employment_start_date || null,
        present_address: d.present_address, city: d.city, state: d.state, zip_code: d.zip_code,
        how_long_at_address: d.how_long_at_address, reason_for_leaving: d.reason_for_leaving,
        current_landlord_name: d.current_landlord_name, current_landlord_phone: d.current_landlord_phone,
        move_in_date: d.move_in_date, intended_stay_duration: d.intended_stay_duration,
        months_rent_upfront: d.months_rent_upfront,
        has_kids: d.has_kids, number_of_kids: d.number_of_kids,
        has_vehicles: d.has_vehicles, number_of_vehicles: d.number_of_vehicles,
        has_pets: d.has_pets, animals: d.animals,
        smokes: d.smokes, drinks: d.drinks,
        has_felony_eviction_bankruptcy: d.has_felony_eviction_bankruptcy,
        is_active_military: d.is_active_military,
        has_housing_assistance: d.has_housing_assistance,
        certification_text: "I certify this information is accurate.",
        ...(d.rental_property ? { rental_property: d.rental_property } : {}),
        ...(utms.utm_source   ? { utm_source:   utms.utm_source }   : {}),
        ...(utms.utm_medium   ? { utm_medium:   utms.utm_medium }   : {}),
        ...(utms.utm_campaign ? { utm_campaign: utms.utm_campaign } : {}),
      };

      const headers: Record<string, string> = { "Content-Type":"application/json" };
      if (user) {
        const token = localStorage.getItem("access_token");
        if (token) headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/api/v1/leads/apply/`, {
        method:"POST", headers, body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const { message, fields } = parseBackendError(data);
        const first = Object.keys(fields)[0] ?? "";
        if (["first_name","last_name","email","cell_phone"].includes(first)) setStep(0);
        else if (["date_of_birth","id_type","gross_monthly_income"].includes(first)) setStep(1);
        else if (["present_address","city","state","zip_code"].includes(first)) setStep(2);
        else if (["move_in_date","intended_stay_duration"].includes(first)) setStep(3);
        else if (["has_felony_eviction_bankruptcy","is_active_military","has_housing_assistance"].includes(first)) setStep(5);
        toast.error("Please fix the errors in the form", { description: message });
        setServerError(message);
        return;
      }

      const data = await res.json();
      const profileToSave = { ...getValues() };
      delete (profileToSave as any).confirmed;
      delete (profileToSave as any).rental_property;
      delete (profileToSave as any).ssn;
      delete (profileToSave as any).ein;
      delete (profileToSave as any).ein_confirm;
      localStorage.setItem(SAVED_PROFILE_KEY, JSON.stringify(profileToSave));

      clearDraftLocal();
      try { sessionStorage.removeItem(DRAFT_ID_KEY); } catch {}
      setDraftId(null);
      isSubmittedRef.current = true;
      trackEvent("submit_application", { application_id: data.id });
      trackMetaEvent("Lead", { content_name:"Rental Application Submitted", content_ids:[d.rental_property ?? ""] });
      toast.success("Application Submitted!");
      router.push(`/apply/success?ref=${data.id}&name=${encodeURIComponent(d.first_name)}`);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Auth handlers (kept from original) ───────────────────────────────────

  async function handleAuth() {
    setAuthError(null);
    const domEmail    = (document.getElementById("auth-email")     as HTMLInputElement)?.value;
    const domPassword = (document.getElementById("auth-password")  as HTMLInputElement)?.value;
    const domConfirm  = (document.getElementById("auth-confirm")   as HTMLInputElement)?.value;
    const emailVal    = (domEmail    || authForm.email   || getValues("email") || "").trim();
    const passVal     = domPassword  || authForm.password || "";
    const confirmVal  = domConfirm   || authForm.confirm  || "";

    if (authMode === "register") {
      const fName = ((document.getElementById("auth-first-name") as HTMLInputElement)?.value || authForm.first_name || getValues("first_name") || "").trim();
      const lName = ((document.getElementById("auth-last-name")  as HTMLInputElement)?.value || authForm.last_name  || getValues("last_name")  || "").trim();
      if (!fName || !lName) { setAuthError("Enter your full name."); return; }
      if (!emailVal) { setAuthError("Enter your email."); return; }
      if (passVal.length < 8) { setAuthError("Password must be at least 8 characters."); return; }
      if (passVal !== confirmVal) { setAuthError("Passwords don't match."); return; }
    } else {
      if (!emailVal || !passVal) { setAuthError("Enter email and password."); return; }
    }

    setAuthLoading(true);
    try {
      if (authMode === "register") {
        await authRegister({ email:emailVal, password:passVal,
          first_name: authForm.first_name || getValues("first_name"),
          last_name:  authForm.last_name  || getValues("last_name"),
          phone:      getValues("cell_phone"),
        });
        setAuthMode("verify"); setResendCooldown(60);
      } else {
        await login(emailVal, passVal);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      setAuthError(msg); toast.error("Authentication failed", { description:msg });
    } finally { setAuthLoading(false); }
  }

  async function handleVerify() {
    const otp = otpCode.join("");
    if (otp.length < 6) { setAuthError("Please enter the 6-digit code."); return; }
    setAuthLoading(true); setAuthError(null);
    try {
      await verifyEmail(authForm.email || getValues("email"), otp);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid code.";
      setAuthError(msg); toast.error("Verification failed", { description:msg });
    } finally { setAuthLoading(false); }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    try {
      await resendOTP((document.getElementById("auth-email") as HTMLInputElement)?.value || authForm.email || getValues("email"));
      setResendCooldown(60); toast.success("Code resent successfully");
    } catch (err) { setAuthError(err instanceof Error ? err.message : "Failed to resend code."); }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split("");
      const newCode = [...otpCode];
      pasted.forEach((c, i) => { if (index + i < 6) newCode[index + i] = c; });
      setOtpCode(newCode);
      document.getElementById(`apply-otp-${Math.min(index + pasted.length, 5)}`)?.focus();
      return;
    }
    const newCode = [...otpCode]; newCode[index] = value; setOtpCode(newCode);
    if (value && index < 5) document.getElementById(`apply-otp-${index + 1}`)?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0)
      document.getElementById(`apply-otp-${index - 1}`)?.focus();
  };

  function startFresh() {
    clearDraftLocal();
    reset({ ...DEFAULT_VALUES, rental_property: propertySlug ?? null });
    setStep(0); setAutofilledFields(new Set());
    toast.info("Form cleared. You can start fresh.");
  }

  const stepLabels = user ? STEP_LABELS_USER : STEP_LABELS_GUEST;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <FormProvider {...methods}>
      <div className="space-y-5">

        {/* Progress indicator */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] px-5 py-5">
          <StepIndicator current={step} total={TOTAL_STEPS} labels={stepLabels} />
        </div>

        {step === 0 && <Step0_Personal />}
        {step === 1 && <Step1_Identity />}
        {step === 2 && <Step2_Address />}
        {step === 3 && <Step3_Rental />}
        {step === 4 && (
          <Step4_Household
            animalFields={animalFields}
            appendAnimal={appendAnimal}
            removeAnimal={removeAnimal}
          />
        )}
        {step === 5 && <Step5_Background />}

        {/* Account gate */}
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
                  <AlertCircle size={14} className="shrink-0 mt-0.5" /> {authError}
                </div>
              )}

              {authMode === "verify" ? (
                <div className="mt-5 space-y-5">
                  <div className="flex justify-between gap-2 max-w-[320px] mx-auto">
                    {otpCode.map((digit, index) => (
                      <input key={index} id={`apply-otp-${index}`} type="text" inputMode="numeric"
                        maxLength={6} value={digit}
                        onChange={e => handleOtpChange(index, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(index, e)}
                        className="w-12 h-14 text-center text-[20px] font-semibold text-[#1D1D1F] bg-[#F5F5F7] rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-brand/30 focus:shadow-[0_0_0_1px_#1A56DB] transition-all"
                      />
                    ))}
                  </div>
                  <button type="button" onClick={handleVerify} disabled={authLoading}
                    className="w-full flex items-center justify-center gap-2 bg-brand text-white text-[13px] font-semibold py-3 rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-50">
                    {authLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Verify & Continue"}
                  </button>
                  <div className="text-center">
                    <button type="button" onClick={handleResend} disabled={resendCooldown > 0}
                      className="text-[12px] text-[#6E6E73] hover:text-[#1D1D1F] transition-colors disabled:opacity-50">
                      {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Didn't receive code? Resend"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {getValues("first_name") && authMode === "register" && (
                    <div className="mt-4 bg-[#F5F5F7] rounded-xl px-4 py-3 flex items-start gap-2">
                      <Check size={14} className="text-[#34C759] mt-0.5 shrink-0" />
                      <p className="text-[12px] text-[#1D1D1F]">
                        Your application details are saved. After creating your account you&apos;ll verify your email and go straight to review.
                      </p>
                    </div>
                  )}
                  <div className="mt-5 space-y-3">
                    {authMode === "register" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <FieldLabel>First Name</FieldLabel>
                          <TextInput id="auth-first-name" defaultValue={getValues("first_name")}
                            onChange={e => setAuthForm(f => ({ ...f, first_name:e.target.value }))} placeholder="Jane" />
                        </div>
                        <div>
                          <FieldLabel>Last Name</FieldLabel>
                          <TextInput id="auth-last-name" defaultValue={getValues("last_name")}
                            onChange={e => setAuthForm(f => ({ ...f, last_name:e.target.value }))} placeholder="Smith" />
                        </div>
                      </div>
                    )}
                    <div>
                      <FieldLabel>Email Address</FieldLabel>
                      <TextInput id="auth-email" type="email" defaultValue={getValues("email")}
                        onChange={e => setAuthForm(f => ({ ...f, email:e.target.value }))} placeholder="you@example.com" />
                    </div>
                    <div>
                      <FieldLabel>Password</FieldLabel>
                      <div className="relative">
                        <TextInput id="auth-password" type={showPass ? "text" : "password"}
                          onChange={e => setAuthForm(f => ({ ...f, password:e.target.value }))}
                          placeholder={authMode === "register" ? "Min. 8 characters" : "Your password"} className="pr-11" />
                        <button type="button" onClick={() => setShowPass(s => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E6E73] hover:text-[#1D1D1F] transition-colors">
                          {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    {authMode === "register" && (
                      <div>
                        <FieldLabel>Confirm Password</FieldLabel>
                        <TextInput id="auth-confirm" type={showPass ? "text" : "password"}
                          onChange={e => setAuthForm(f => ({ ...f, confirm:e.target.value }))} placeholder="Re-enter password" />
                      </div>
                    )}
                    <button type="button" onClick={handleAuth} disabled={authLoading}
                      className="w-full flex items-center justify-center gap-2 bg-brand text-white text-[13px] font-semibold py-3 rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-50">
                      {authLoading
                        ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : authMode === "register" ? "Create Account & Continue" : "Sign In & Continue"}
                    </button>
                    <div className="text-center">
                      <button type="button"
                        onClick={() => { setAuthMode(m => m === "register" ? "login" : "register"); setAuthError(null); }}
                        className="text-[12px] text-brand font-semibold hover:underline">
                        {authMode === "register" ? "Already have an account? Sign in" : "Don't have an account? Create one"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            <button type="button" onClick={
              authMode === "verify"
                ? () => { setAuthMode("login"); setOtpCode(["","","","","",""]); setAuthError(null); }
                : goBack
            }
              className="flex items-center gap-1.5 text-[13px] font-semibold text-[#6E6E73] hover:text-[#1D1D1F] transition-colors px-4 py-3 rounded-xl hover:bg-black/[0.04]">
              <ChevronLeft size={15} strokeWidth={2.5} /> Back
            </button>
          </>
        )}

        {step === REVIEW_STEP && (
          <ReviewStep
            propertyData={propertyData}
            onEdit={setStep}
            serverError={serverError}
            autofilledFields={autofilledFields}
            startFresh={startFresh}
          />
        )}

        {(step !== ACCOUNT_STEP || user) && (
          <NavButtons
            step={step} total={TOTAL_STEPS}
            onBack={goBack} onNext={goNext}
            nextLabel={step === REVIEW_STEP ? "Submit Application" : "Continue"}
            loading={submitting}
          />
        )}

        <p className="text-center text-[11px] text-[#6E6E73]">
          Your information is handled confidentially.{" "}
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </FormProvider>
  );
}
