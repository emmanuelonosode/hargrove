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
  ChevronRight, ChevronLeft, Check, AlertCircle, Building2,
  Lock, Eye, EyeOff, RotateCcw, Trash2, Plus, PawPrint,
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

// Step 0–10 are content steps; 11 = account (guest); review = 11 (user) / 12 (guest)
const STEP_TITLES = [
  "Your Name",           // 0
  "Contact Info",        // 1
  "Emergency Contact",   // 2
  "Identity & License",  // 3
  "Income & Employment", // 4
  "Your Address",        // 5
  "Address History",     // 6
  "Move-In Plans",       // 7
  "Household",           // 8
  "Pets",                // 9
  "Background",          // 10
];

const SHORT_LABELS = ["Name","Contact","Emergency","Identity","Income","Address","History","Move-In","Household","Pets","Background"];
const STEP_LABELS_GUEST = [...SHORT_LABELS, "Account", "Review"];
const STEP_LABELS_USER  = [...SHORT_LABELS, "Review"];

// ── Zod Schema (unchanged) ────────────────────────────────────────────────────

const animalSchema = z.object({
  type:              z.string().min(1, "Required"),
  breed:             z.string().min(1, "Required"),
  weight:            z.string().min(1, "Required"),
  name:              z.string().min(1, "Required"),
  is_service_animal: z.boolean(),
});

const schema = z.object({
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
  date_of_birth:                  z.string().min(1, "Required"),
  id_type:                        z.enum(["ssn", "ein", "neither"], { error: "Required" }),
  ssn:                            z.string().optional(),
  ein:                            z.string().optional(),
  ein_confirm:                    z.string().optional(),
  has_drivers_license:            z.boolean(),
  drivers_license_number:         z.string().optional(),
  drivers_license_state:          z.string().optional(),
  gross_monthly_income:           z.string().min(1, "Required"),
  employer_name:                  z.string().optional(),
  employer_phone:                 z.string().optional(),
  job_title:                      z.string().optional(),
  employment_start_date:          z.string().optional(),
  present_address:                z.string().min(1, "Required"),
  city:                           z.string().min(1, "Required"),
  state:                          z.string().length(2, "Use 2-letter code"),
  zip_code:                       z.string().min(5, "Enter a valid ZIP"),
  how_long_at_address:            z.string().min(1, "Required"),
  reason_for_leaving:             z.string().min(1, "Required"),
  current_landlord_name:          z.string().optional(),
  current_landlord_phone:         z.string().optional(),
  move_in_date:                   z.string().min(1, "Required"),
  intended_stay_duration:         z.string().min(1, "Required"),
  months_rent_upfront:            z.number().min(1),
  has_kids:                       z.boolean(),
  number_of_kids:                 z.number(),
  has_vehicles:                   z.boolean(),
  number_of_vehicles:             z.number(),
  has_pets:                       z.boolean(),
  animals:                        z.array(animalSchema),
  smokes:                         z.boolean(),
  drinks:                         z.boolean(),
  has_felony_eviction_bankruptcy: z.boolean({ error: "Please select Yes or No" }),
  is_active_military:             z.boolean({ error: "Please select Yes or No" }),
  has_housing_assistance:         z.boolean({ error: "Please select Yes or No" }),
  rental_property:                z.string().nullable(),
  confirmed:                      z.boolean(),
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

// Fields validated per step
const STEP_FIELDS: (keyof FormData)[][] = [
  ["first_name", "last_name", "marital_status"],                                               // 0 Name
  ["email", "cell_phone", "phone_type", "preferred_contact"],                                  // 1 Contact
  ["emergency_contact_name", "emergency_contact_relationship",
   "emergency_contact_phone", "emergency_contact_phone_type"],                                 // 2 Emergency
  ["date_of_birth", "id_type", "ssn", "ein", "ein_confirm",
   "has_drivers_license", "drivers_license_number", "drivers_license_state"],                 // 3 Identity
  ["gross_monthly_income"],                                                                    // 4 Income
  ["present_address", "city", "state", "zip_code"],                                           // 5 Address
  ["how_long_at_address", "reason_for_leaving"],                                              // 6 History
  ["move_in_date", "intended_stay_duration", "months_rent_upfront"],                          // 7 Move-In
  ["has_kids", "number_of_kids", "has_vehicles", "number_of_vehicles", "smokes", "drinks"],  // 8 Household
  ["has_pets"],                                                                               // 9 Pets
  ["has_felony_eviction_bankruptcy", "is_active_military", "has_housing_assistance"],        // 10 Background
];

const DEFAULT_VALUES: FormData = {
  first_name: "", middle_name: "", last_name: "", marital_status: "",
  email: "", cell_phone: "", phone_type: "mobile", home_phone: "",
  preferred_contact: "email" as const,
  emergency_contact_name: "", emergency_contact_relationship: "",
  emergency_contact_phone: "", emergency_contact_phone_type: "mobile",
  date_of_birth: "", id_type: "ssn" as const, ssn: "", ein: "", ein_confirm: "",
  has_drivers_license: true, drivers_license_number: "", drivers_license_state: "",
  gross_monthly_income: "", employer_name: "", employer_phone: "",
  job_title: "", employment_start_date: "",
  present_address: "", city: "", state: "", zip_code: "",
  how_long_at_address: "", reason_for_leaving: "",
  current_landlord_name: "", current_landlord_phone: "",
  move_in_date: "", intended_stay_duration: "", months_rent_upfront: 1,
  has_kids: false, number_of_kids: 0,
  has_vehicles: false, number_of_vehicles: 0,
  has_pets: false, animals: [],
  smokes: false, drinks: false,
  has_felony_eviction_bankruptcy: undefined as unknown as boolean,
  is_active_military:             undefined as unknown as boolean,
  has_housing_assistance:         undefined as unknown as boolean,
  rental_property: null, confirmed: false,
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

function FieldGroup({
  label, required, error, hint, children,
}: {
  label?: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      {label && (
        <label className="block text-[17px] font-semibold text-[#101828] mb-2.5">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-2 text-[14px] text-[#667085]">{hint}</p>}
      {error && (
        <p className="mt-2 text-[14px] text-red-600 flex items-center gap-1.5">
          <AlertCircle size={14} className="shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

function BigInput({
  error, className, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <input
      {...props}
      className={cn(
        "w-full h-[62px] px-5 text-[18px] text-[#101828] bg-white rounded-xl outline-none transition-colors",
        "border-2 border-[#D0D5DD] focus:border-brand placeholder:text-[#98A2B3]",
        error && "border-red-400 focus:border-red-400",
        className,
      )}
    />
  );
}

function BigSelect({
  error, children, className, ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  return (
    <select
      {...props}
      className={cn(
        "w-full h-[62px] px-5 text-[18px] text-[#101828] bg-white rounded-xl outline-none transition-colors appearance-none",
        "border-2 border-[#D0D5DD] focus:border-brand",
        error && "border-red-400",
        className,
      )}
    >
      {children}
    </select>
  );
}

// Stacked Yes / No radio — each option is a tall tappable row
function BigYesNo({
  value, onChange, error,
}: { value: boolean | undefined; onChange: (v: boolean) => void; error?: string }) {
  return (
    <div>
      <div className="space-y-3">
        {([true, false] as const).map(v => (
          <button
            key={String(v)}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              "w-full h-[64px] flex items-center gap-4 px-5 rounded-xl border-2 transition-all text-left",
              value === v
                ? "border-brand bg-[#EFF4FF]"
                : "border-[#D0D5DD] bg-white hover:border-[#98A2B3]",
            )}
          >
            <div className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
              value === v ? "border-brand" : "border-[#D0D5DD]",
            )}>
              {value === v && <div className="w-3 h-3 rounded-full bg-brand" />}
            </div>
            <span className="text-[18px] font-semibold text-[#101828]">{v ? "Yes" : "No"}</span>
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-2 text-[14px] text-red-600 flex items-center gap-1.5">
          <AlertCircle size={14} className="shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

// Horizontal pill buttons for 2–3 short choices
function BigRadioGroup({
  options, value, onChange, error,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div>
      <div className="flex gap-3">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 h-[62px] rounded-xl border-2 text-[17px] font-semibold transition-all",
              value === opt.value
                ? "border-brand bg-[#EFF4FF] text-brand"
                : "border-[#D0D5DD] bg-white text-[#344054] hover:border-[#98A2B3]",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-2 text-[14px] text-red-600 flex items-center gap-1.5">
          <AlertCircle size={14} className="shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

// Step header: "STEP X OF Y", large title, thin progress bar
function StepHeader({ step, total, title }: { step: number; total: number; title: string }) {
  return (
    <div className="mb-8">
      <p className="text-[12px] font-bold tracking-[0.12em] uppercase text-brand mb-2">
        Step {step + 1} of {total}
      </p>
      <h1 className="text-[26px] font-bold text-[#101828] leading-tight">{title}</h1>
      <div className="mt-5 h-1.5 bg-[#F2F4F7] rounded-full overflow-hidden">
        <div
          className="h-full bg-brand rounded-full transition-all duration-500"
          style={{ width: `${((step + 1) / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

// Large bottom navigation buttons
function NavButtons({
  step, total, onBack, onNext, nextLabel = "Save & Continue", loading = false,
}: {
  step: number; total: number;
  onBack: () => void; onNext: () => void;
  nextLabel?: string; loading?: boolean;
}) {
  return (
    <div className={cn("flex gap-3 mt-10", step === 0 && "flex-col")}>
      {step > 0 && (
        <button
          type="button" onClick={onBack}
          className="flex-1 h-[62px] flex items-center justify-center gap-2 rounded-xl border-2 border-[#D0D5DD] text-[17px] font-semibold text-[#344054] hover:border-[#98A2B3] hover:bg-[#F9FAFB] transition-colors"
        >
          <ChevronLeft size={20} strokeWidth={2.5} /> Previous
        </button>
      )}
      <button
        type="button" onClick={onNext} disabled={loading}
        className={cn(
          "h-[62px] flex items-center justify-center gap-2 rounded-xl bg-brand text-white text-[17px] font-semibold hover:bg-brand-hover transition-colors disabled:opacity-50",
          step > 0 ? "flex-1" : "w-full",
        )}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </span>
        ) : (
          <>{nextLabel} {step < total - 1 && <ChevronRight size={20} strokeWidth={2.5} />}</>
        )}
      </button>
    </div>
  );
}

// ── Step 0: Name ──────────────────────────────────────────────────────────────

function Step0_Name() {
  const { register, formState: { errors } } = useFormContext<FormData>();
  return (
    <div className="space-y-6">
      <FieldGroup label="First Name" required error={errors.first_name?.message}>
        <BigInput {...register("first_name")} placeholder="Jane" autoFocus />
      </FieldGroup>
      <FieldGroup label="Middle Name">
        <BigInput {...register("middle_name")} placeholder="Optional" />
      </FieldGroup>
      <FieldGroup label="Last Name" required error={errors.last_name?.message}>
        <BigInput {...register("last_name")} placeholder="Smith" />
      </FieldGroup>
      <FieldGroup label="Marital Status" required error={errors.marital_status?.message}>
        <BigSelect {...register("marital_status")}>
          <option value="">Select your status...</option>
          {["Single", "Married", "Divorced", "Separated", "Widowed"].map(s => (
            <option key={s} value={s.toLowerCase()}>{s}</option>
          ))}
        </BigSelect>
      </FieldGroup>
    </div>
  );
}

// ── Step 1: Contact ───────────────────────────────────────────────────────────

function Step1_Contact() {
  const { register, control, formState: { errors } } = useFormContext<FormData>();
  return (
    <div className="space-y-6">
      <FieldGroup label="Email Address" required error={errors.email?.message}>
        <BigInput type="email" {...register("email")} placeholder="you@example.com" />
      </FieldGroup>
      <FieldGroup label="Cell Phone Number" required error={errors.cell_phone?.message}>
        <BigInput type="tel" {...register("cell_phone")} placeholder="(555) 000-0000" />
      </FieldGroup>
      <FieldGroup label="Phone Type" required error={errors.phone_type?.message}>
        <Controller
          control={control} name="phone_type"
          render={({ field }) => (
            <BigRadioGroup
              options={[{ value: "mobile", label: "Mobile" }, { value: "home", label: "Home" }, { value: "work", label: "Work" }]}
              value={field.value} onChange={field.onChange}
            />
          )}
        />
      </FieldGroup>
      <FieldGroup label="Home Phone" hint="Optional">
        <BigInput type="tel" {...register("home_phone")} placeholder="(555) 000-0000" />
      </FieldGroup>
      <FieldGroup label="How would you like us to contact you?" required>
        <Controller
          control={control} name="preferred_contact"
          render={({ field }) => (
            <BigRadioGroup
              options={[{ value: "email", label: "Email" }, { value: "phone", label: "Phone" }]}
              value={field.value} onChange={field.onChange}
              error={errors.preferred_contact?.message}
            />
          )}
        />
      </FieldGroup>
    </div>
  );
}

// ── Step 2: Emergency Contact ─────────────────────────────────────────────────

function Step2_Emergency() {
  const { register, control, formState: { errors } } = useFormContext<FormData>();
  return (
    <div className="space-y-6">
      <p className="text-[16px] text-[#667085]">Who should we contact in case of an emergency?</p>
      <FieldGroup label="Their Full Name" required error={errors.emergency_contact_name?.message}>
        <BigInput {...register("emergency_contact_name")} placeholder="Contact's full name" />
      </FieldGroup>
      <FieldGroup label="Relationship to You" required error={errors.emergency_contact_relationship?.message}>
        <BigSelect {...register("emergency_contact_relationship")}>
          <option value="">Select relationship...</option>
          {["Spouse", "Parent", "Sibling", "Child", "Friend", "Other"].map(r => (
            <option key={r} value={r.toLowerCase()}>{r}</option>
          ))}
        </BigSelect>
      </FieldGroup>
      <FieldGroup label="Their Phone Number" required error={errors.emergency_contact_phone?.message}>
        <BigInput type="tel" {...register("emergency_contact_phone")} placeholder="(555) 000-0000" />
      </FieldGroup>
      <FieldGroup label="Phone Type" required error={errors.emergency_contact_phone_type?.message}>
        <Controller
          control={control} name="emergency_contact_phone_type"
          render={({ field }) => (
            <BigRadioGroup
              options={[{ value: "mobile", label: "Mobile" }, { value: "home", label: "Home" }, { value: "work", label: "Work" }]}
              value={field.value} onChange={field.onChange}
            />
          )}
        />
      </FieldGroup>
    </div>
  );
}

// ── Step 3: Identity ──────────────────────────────────────────────────────────

function Step3_Identity() {
  const { register, control, watch, formState: { errors } } = useFormContext<FormData>();
  const idType = watch("id_type");
  const hasDL  = watch("has_drivers_license");
  const [maxDob, setMaxDob] = useState("");
  useEffect(() => {
    const dobStr = new Date(Date.now() - 18 * 365.25 * 86400000).toISOString().split("T")[0];
    setTimeout(() => setMaxDob(dobStr), 0);
  }, []);

  return (
    <div className="space-y-6">
      <FieldGroup label="Date of Birth" required error={errors.date_of_birth?.message}>
        <BigInput
          type="date" {...register("date_of_birth")}
          max={maxDob || undefined}
        />
      </FieldGroup>

      <FieldGroup label="Type of ID" required error={errors.id_type?.message}>
        <Controller
          control={control} name="id_type"
          render={({ field }) => (
            <BigRadioGroup
              options={[{ value: "ssn", label: "SSN" }, { value: "ein", label: "EIN" }, { value: "neither", label: "Neither" }]}
              value={field.value} onChange={field.onChange}
            />
          )}
        />
      </FieldGroup>

      {idType === "ssn" && (
        <FieldGroup
          label="Social Security Number" required
          error={errors.ssn?.message}
          hint="Only the last 4 digits are stored. Your full SSN is never saved."
        >
          <BigInput
            {...register("ssn")} type="password" inputMode="numeric"
            placeholder="•••-••-••••" maxLength={11} autoComplete="off"
          />
        </FieldGroup>
      )}

      {idType === "ein" && (
        <>
          <FieldGroup label="Employer Identification Number (EIN)" required error={errors.ein?.message}>
            <BigInput {...register("ein")} placeholder="XX-XXXXXXX" />
          </FieldGroup>
          <FieldGroup label="Confirm EIN" required error={errors.ein_confirm?.message}>
            <BigInput {...register("ein_confirm")} placeholder="Re-enter EIN" />
          </FieldGroup>
        </>
      )}

      <div>
        <p className="text-[17px] font-semibold text-[#101828] mb-4">Do you have a driver&apos;s license?</p>
        <Controller
          control={control} name="has_drivers_license"
          render={({ field }) => (
            <BigYesNo value={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      {hasDL && (
        <>
          <FieldGroup label="Driver&apos;s License Number" required error={errors.drivers_license_number?.message}>
            <BigInput {...register("drivers_license_number")} placeholder="License number" />
          </FieldGroup>
          <FieldGroup label="Issuing State" required error={errors.drivers_license_state?.message}>
            <BigSelect {...register("drivers_license_state")}>
              <option value="">Select state...</option>
              {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </BigSelect>
          </FieldGroup>
        </>
      )}
    </div>
  );
}

// ── Step 4: Income ────────────────────────────────────────────────────────────

function Step4_Income() {
  const { register, watch, formState: { errors } } = useFormContext<FormData>();
  const monthly = watch("gross_monthly_income");
  const annual  = monthly
    ? `$${(parseFloat(monthly.replace(/,/g, "")) * 12).toLocaleString("en-US")}`
    : null;
  return (
    <div className="space-y-6">
      <FieldGroup
        label="Gross Monthly Income" required
        error={errors.gross_monthly_income?.message}
        hint={annual ? `Estimated annual: ${annual}` : undefined}
      >
        <BigInput
          {...register("gross_monthly_income")} type="text" inputMode="numeric" placeholder="$0.00"
        />
      </FieldGroup>
      <FieldGroup label="Employer / Company Name" hint="Optional">
        <BigInput {...register("employer_name")} placeholder="Company name" />
      </FieldGroup>
      <FieldGroup label="Employer Phone" hint="Optional">
        <BigInput type="tel" {...register("employer_phone")} placeholder="(555) 000-0000" />
      </FieldGroup>
      <FieldGroup label="Job Title" hint="Optional">
        <BigInput {...register("job_title")} placeholder="e.g. Registered Nurse" />
      </FieldGroup>
      <FieldGroup label="Employment Start Date" hint="Optional">
        <BigInput type="date" {...register("employment_start_date")} />
      </FieldGroup>
    </div>
  );
}

// ── Step 5: Address ───────────────────────────────────────────────────────────

function Step5_Address() {
  const { register, formState: { errors } } = useFormContext<FormData>();
  return (
    <div className="space-y-6">
      <FieldGroup label="Street Address" required error={errors.present_address?.message}>
        <BigInput {...register("present_address")} placeholder="123 Main Street, Apt 4B" />
      </FieldGroup>
      <FieldGroup label="City" required error={errors.city?.message}>
        <BigInput {...register("city")} placeholder="Atlanta" />
      </FieldGroup>
      <FieldGroup label="State" required error={errors.state?.message}>
        <BigSelect {...register("state")}>
          <option value="">Select your state...</option>
          {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </BigSelect>
      </FieldGroup>
      <FieldGroup label="ZIP Code" required error={errors.zip_code?.message}>
        <BigInput {...register("zip_code")} placeholder="30301" inputMode="numeric" maxLength={10} />
      </FieldGroup>
    </div>
  );
}

// ── Step 6: Address History ───────────────────────────────────────────────────

function Step6_History() {
  const { register, formState: { errors } } = useFormContext<FormData>();
  return (
    <div className="space-y-6">
      <FieldGroup label="How long have you lived there?" required error={errors.how_long_at_address?.message}>
        <BigSelect {...register("how_long_at_address")}>
          <option value="">Select...</option>
          {["Less than 6 months", "6–12 months", "1–2 years", "2–5 years", "5+ years"].map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </BigSelect>
      </FieldGroup>
      <FieldGroup label="Why are you leaving?" required error={errors.reason_for_leaving?.message}>
        <BigSelect {...register("reason_for_leaving")}>
          <option value="">Select reason...</option>
          {["End of lease", "Relocation", "Better home", "Price increase", "Building sold", "Buying a home", "Other"].map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </BigSelect>
      </FieldGroup>
      <div className="pt-2 border-t border-[#EAECF0]">
        <p className="text-[17px] font-semibold text-[#101828] mt-4 mb-1">Current Landlord</p>
        <p className="text-[15px] text-[#667085] mb-5">Optional — helps speed up the process</p>
        <div className="space-y-6">
          <FieldGroup label="Landlord or Property Manager Name">
            <BigInput {...register("current_landlord_name")} placeholder="Name or company" />
          </FieldGroup>
          <FieldGroup label="Landlord Phone">
            <BigInput type="tel" {...register("current_landlord_phone")} placeholder="(555) 000-0000" />
          </FieldGroup>
        </div>
      </div>
    </div>
  );
}

// ── Step 7: Move-In ───────────────────────────────────────────────────────────

function Step7_MoveIn() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<FormData>();
  return (
    <div className="space-y-6">
      <FieldGroup label="When do you want to move in?" required error={errors.move_in_date?.message}>
        <BigInput
          type="date" {...register("move_in_date")}
          min={new Date().toISOString().split("T")[0]}
        />
      </FieldGroup>
      <FieldGroup label="How long do you plan to stay?" required error={errors.intended_stay_duration?.message}>
        <BigSelect {...register("intended_stay_duration")}>
          <option value="">Select duration...</option>
          <option value="3 months">3 months</option>
          <option value="6 months">6 months</option>
          <option value="12 months">12 months (1 year)</option>
          <option value="24 months">24 months (2 years)</option>
          <option value="36 months">36 months (3 years)</option>
          <option value="Flexible">Flexible / Month-to-month</option>
        </BigSelect>
      </FieldGroup>
      <FieldGroup
        label="How many months of rent can you pay upfront?"
        hint="First and last month's rent is standard."
      >
        <BigSelect
          value={watch("months_rent_upfront")}
          onChange={e => setValue("months_rent_upfront", Number(e.target.value))}
        >
          {[1, 2, 3, 6, 12].map(n => (
            <option key={n} value={n}>{n} month{n > 1 ? "s" : ""}</option>
          ))}
        </BigSelect>
      </FieldGroup>
    </div>
  );
}

// ── Step 8: Household ─────────────────────────────────────────────────────────

function Step8_Household() {
  const { control, watch, register, formState: { errors } } = useFormContext<FormData>();
  const hasKids     = watch("has_kids");
  const hasVehicles = watch("has_vehicles");
  return (
    <div className="space-y-8">
      <div>
        <p className="text-[17px] font-semibold text-[#101828] mb-4">
          Do you have children or dependents who will live here?
        </p>
        <Controller control={control} name="has_kids"
          render={({ field }) => <BigYesNo value={field.value} onChange={field.onChange} />}
        />
        {hasKids && (
          <div className="mt-5">
            <FieldGroup label="How many dependents?" required error={errors.number_of_kids?.message}>
              <BigInput
                type="number" min={1} placeholder="Number of dependents"
                {...register("number_of_kids", { valueAsNumber: true })}
                className="max-w-[200px]"
              />
            </FieldGroup>
          </div>
        )}
      </div>

      <div className="border-t border-[#EAECF0] pt-8">
        <p className="text-[17px] font-semibold text-[#101828] mb-1">Do you have any motor vehicles?</p>
        <p className="text-[15px] text-[#667085] mb-4">Cars, trucks, or motorcycles</p>
        <Controller control={control} name="has_vehicles"
          render={({ field }) => <BigYesNo value={field.value} onChange={field.onChange} />}
        />
        {hasVehicles && (
          <div className="mt-5">
            <FieldGroup label="How many vehicles?" required error={errors.number_of_vehicles?.message}>
              <BigInput
                type="number" min={1} placeholder="Number of vehicles"
                {...register("number_of_vehicles", { valueAsNumber: true })}
                className="max-w-[200px]"
              />
            </FieldGroup>
          </div>
        )}
      </div>

      <div className="border-t border-[#EAECF0] pt-8">
        <p className="text-[17px] font-semibold text-[#101828] mb-4">Do you smoke?</p>
        <Controller control={control} name="smokes"
          render={({ field }) => <BigYesNo value={field.value} onChange={field.onChange} />}
        />
      </div>

      <div className="border-t border-[#EAECF0] pt-8">
        <p className="text-[17px] font-semibold text-[#101828] mb-4">Do you drink alcohol?</p>
        <Controller control={control} name="drinks"
          render={({ field }) => <BigYesNo value={field.value} onChange={field.onChange} />}
        />
      </div>
    </div>
  );
}

// ── Step 9: Pets ──────────────────────────────────────────────────────────────

function Step9_Pets({
  animalFields, appendAnimal, removeAnimal,
}: {
  animalFields: { id: string }[];
  appendAnimal: (a: FormData["animals"][0]) => void;
  removeAnimal: (i: number) => void;
}) {
  const { register, control, watch, formState: { errors } } = useFormContext<FormData>();
  const hasPets = watch("has_pets");
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[17px] font-semibold text-[#101828] mb-4">
          Do you have pets or service animals?
        </p>
        <Controller control={control} name="has_pets"
          render={({ field }) => <BigYesNo value={field.value} onChange={field.onChange} />}
        />
      </div>

      {hasPets && (
        <div className="space-y-5 pt-2">
          {animalFields.length === 0 && (
            <p className="text-[16px] text-[#667085] bg-[#F9FAFB] rounded-xl px-5 py-4">
              No animals added yet. Tap &quot;Add an animal&quot; below.
            </p>
          )}
          {animalFields.map((field, index) => (
            <div key={field.id} className="rounded-xl border-2 border-[#D0D5DD] p-5 space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-[17px] font-bold text-[#101828] flex items-center gap-2">
                  <PawPrint size={18} className="text-amber-500" />
                  Animal {index + 1}
                </p>
                <button
                  type="button" onClick={() => removeAnimal(index)}
                  className="flex items-center gap-1.5 text-[15px] font-semibold text-red-500 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
              <FieldGroup label="Animal Type" required error={(errors.animals as any)?.[index]?.type?.message}>
                <BigSelect {...register(`animals.${index}.type`)}>
                  <option value="">Select type...</option>
                  {["Dog", "Cat", "Bird", "Reptile", "Fish", "Small Animal", "Other"].map(t => (
                    <option key={t} value={t.toLowerCase()}>{t}</option>
                  ))}
                </BigSelect>
              </FieldGroup>
              <FieldGroup label="Animal Name" required error={(errors.animals as any)?.[index]?.name?.message}>
                <BigInput {...register(`animals.${index}.name`)} placeholder="Pet's name" />
              </FieldGroup>
              <FieldGroup label="Breed" required error={(errors.animals as any)?.[index]?.breed?.message}>
                <BigInput {...register(`animals.${index}.breed`)} placeholder="e.g. Labrador Retriever" />
              </FieldGroup>
              <FieldGroup label="Weight (lbs)" required error={(errors.animals as any)?.[index]?.weight?.message}>
                <BigInput
                  {...register(`animals.${index}.weight`)}
                  type="number" min={1} placeholder="Weight in pounds"
                />
              </FieldGroup>
              <div>
                <p className="text-[17px] font-semibold text-[#101828] mb-4">Is this a service animal?</p>
                <Controller
                  control={control} name={`animals.${index}.is_service_animal`}
                  render={({ field: f }) => <BigYesNo value={f.value} onChange={f.onChange} />}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendAnimal({ type: "", breed: "", weight: "", name: "", is_service_animal: false })}
            className="w-full h-[62px] flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#D0D5DD] text-[17px] font-semibold text-brand hover:border-brand hover:bg-[#EFF4FF] transition-all"
          >
            <Plus size={20} /> Add an animal
          </button>
        </div>
      )}
    </div>
  );
}

// ── Step 10: Background ───────────────────────────────────────────────────────

function Step10_Background() {
  const { control, formState: { errors } } = useFormContext<FormData>();
  const questions = [
    {
      name: "has_felony_eviction_bankruptcy" as const,
      label: "Do you have any past felonies, evictions, bankruptcies, or pending criminal charges?",
    },
    {
      name: "is_active_military" as const,
      label: "Are you currently serving in the active military?",
    },
    {
      name: "has_housing_assistance" as const,
      label: "Will you receive housing assistance such as Section 8?",
    },
  ];
  return (
    <div className="space-y-8">
      <p className="text-[16px] text-[#667085]">
        These disclosures are required for all applicants.
      </p>
      {questions.map(({ name, label }) => (
        <div key={name} className="pt-2">
          <p className="text-[17px] font-semibold text-[#101828] mb-4 leading-snug">{label}</p>
          <Controller
            control={control} name={name}
            render={({ field }) => (
              <BigYesNo
                value={field.value as boolean | undefined}
                onChange={field.onChange}
                error={(errors[name] as any)?.message}
              />
            )}
          />
        </div>
      ))}
    </div>
  );
}

// ── Review Step ───────────────────────────────────────────────────────────────

function ReviewStep({
  propertyData, onEdit, serverError, autofilledFields, startFresh,
}: {
  propertyData: any; onEdit: (step: number) => void;
  serverError: string | null; autofilledFields: Set<string>; startFresh: () => void;
}) {
  const { watch, control, formState: { errors } } = useFormContext<FormData>();
  const f = watch();

  const sections = [
    {
      title: "Name", step: 0,
      rows: [
        ["Full Name", [f.first_name, f.middle_name, f.last_name].filter(Boolean).join(" ")],
        ["Marital Status", f.marital_status],
      ] as [string, string][],
    },
    {
      title: "Contact", step: 1,
      rows: [
        ["Email", f.email],
        ["Cell Phone", `${f.cell_phone} (${f.phone_type})`],
        f.home_phone ? ["Home Phone", f.home_phone] : null,
        ["Preferred Contact", f.preferred_contact],
      ].filter(Boolean) as [string, string][],
    },
    {
      title: "Emergency Contact", step: 2,
      rows: [
        ["Name", f.emergency_contact_name],
        ["Relationship", f.emergency_contact_relationship],
        ["Phone", `${f.emergency_contact_phone} (${f.emergency_contact_phone_type})`],
      ] as [string, string][],
    },
    {
      title: "Identity", step: 3,
      rows: [
        ["Date of Birth", f.date_of_birth],
        ["ID Type", (f.id_type ?? "").toUpperCase()],
        f.id_type === "ssn" ? ["SSN", "•••-••-" + (f.ssn ?? "").replace(/\D/g, "").slice(-4)] : null,
        f.id_type === "ein" ? ["EIN", f.ein ?? ""] : null,
        ["Driver's License", f.has_drivers_license ? `${f.drivers_license_number} (${f.drivers_license_state})` : "None"],
      ].filter(Boolean) as [string, string][],
    },
    {
      title: "Income", step: 4,
      rows: [
        ["Monthly Income", f.gross_monthly_income ? `$${f.gross_monthly_income}` : "—"],
        f.employer_name ? ["Employer", f.employer_name] : null,
        f.job_title ? ["Job Title", f.job_title] : null,
      ].filter(Boolean) as [string, string][],
    },
    {
      title: "Address", step: 5,
      rows: [
        ["Street", f.present_address],
        ["City / State / ZIP", `${f.city}, ${(f.state ?? "").toUpperCase()} ${f.zip_code}`],
      ] as [string, string][],
    },
    {
      title: "History", step: 6,
      rows: [
        ["Time at Address", f.how_long_at_address],
        ["Reason for Leaving", f.reason_for_leaving],
        f.current_landlord_name ? ["Landlord", f.current_landlord_name] : null,
      ].filter(Boolean) as [string, string][],
    },
    {
      title: "Move-In", step: 7,
      rows: [
        ["Move-In Date", f.move_in_date ? new Date(f.move_in_date + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""],
        ["Duration", f.intended_stay_duration],
        ["Months Upfront", `${f.months_rent_upfront} month${f.months_rent_upfront > 1 ? "s" : ""}`],
      ] as [string, string][],
    },
    {
      title: "Household", step: 8,
      rows: [
        ["Children", f.has_kids ? `Yes — ${f.number_of_kids}` : "No"],
        ["Vehicles", f.has_vehicles ? `Yes — ${f.number_of_vehicles}` : "No"],
        ["Smokes", f.smokes ? "Yes" : "No"],
        ["Drinks", f.drinks ? "Yes" : "No"],
      ] as [string, string][],
    },
    {
      title: "Pets", step: 9,
      rows: [
        ["Animals", f.has_pets && f.animals.length
          ? f.animals.map(a => `${a.name} (${a.type}${a.is_service_animal ? ", service" : ""})`).join("; ")
          : "None"],
      ] as [string, string][],
    },
    {
      title: "Background", step: 10,
      rows: [
        ["Felony / Eviction / Bankruptcy", f.has_felony_eviction_bankruptcy === true ? "Yes" : f.has_felony_eviction_bankruptcy === false ? "No" : "—"],
        ["Active Military", f.is_active_military === true ? "Yes" : f.is_active_military === false ? "No" : "—"],
        ["Housing Assistance", f.has_housing_assistance === true ? "Yes" : f.has_housing_assistance === false ? "No" : "—"],
      ] as [string, string][],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Property card */}
      <div className="rounded-xl bg-brand text-white p-5 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-white/60 mb-2">Applying for</p>
          <h4 className="text-[19px] font-bold leading-tight mb-1 line-clamp-2">
            {propertyData?.title || "Rental Property"}
          </h4>
          {propertyData?.address && (
            <p className="text-[13px] text-white/60 mb-4 truncate">{propertyData.address}</p>
          )}
          <div className="flex items-center justify-between pt-4 border-t border-white/20">
            <div>
              <p className="text-[11px] uppercase text-white/50 mb-0.5">Monthly Rent</p>
              <p className="text-[20px] font-bold">${propertyData?.price ?? "—"}/mo</p>
            </div>
            {autofilledFields.size > 0 && (
              <button onClick={startFresh}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-white/50 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10">
                <RotateCcw size={13} /> Start fresh
              </button>
            )}
          </div>
        </div>
        <Building2 className="absolute -right-4 -bottom-4 w-32 h-32 text-white/[0.07] rotate-12" />
      </div>

      {/* Summary */}
      {sections.map(({ title, step, rows }) => (
        <div key={title} className="rounded-xl border-2 border-[#EAECF0] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-[#F9FAFB] border-b border-[#EAECF0]">
            <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#667085]">{title}</p>
            <button type="button" onClick={() => onEdit(step)} className="text-[14px] font-semibold text-brand hover:underline">Edit</button>
          </div>
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-3 px-5 py-3.5 border-b border-[#EAECF0] last:border-0">
              <p className="text-[13px] text-[#667085] shrink-0 max-w-[48%] leading-snug">{label}</p>
              <p className="text-[14px] font-semibold text-[#101828] text-right min-w-0 break-words leading-snug">{value || "—"}</p>
            </div>
          ))}
        </div>
      ))}

      {/* Certification */}
      <div className="rounded-xl border-2 border-brand/20 bg-[#EFF4FF] px-5 py-5">
        <p className="text-[15px] text-[#344054] leading-relaxed italic mb-5">
          I certify that the answers given herein are true and complete to the best of my knowledge.
          I authorize investigation of all statements contained in this application for rental purposes.
          Incomplete or misleading information may result in rejection of this application.
        </p>
        <Controller
          control={control} name="confirmed"
          render={({ field }) => (
            <label className="flex items-start gap-3 cursor-pointer">
              <div
                role="checkbox" aria-checked={field.value}
                onClick={() => field.onChange(!field.value)}
                className={cn(
                  "w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 border-2 transition-all cursor-pointer",
                  field.value ? "bg-brand border-brand" : "bg-white border-[#D0D5DD] hover:border-brand",
                )}
              >
                {field.value && <Check size={14} className="text-white" strokeWidth={3} />}
              </div>
              <span className="text-[16px] font-medium text-[#101828]">
                I confirm all information is accurate and complete.
              </span>
            </label>
          )}
        />
        {errors.confirmed && (
          <p className="mt-3 text-[14px] text-red-600 flex items-center gap-1.5">
            <AlertCircle size={14} /> Please confirm before submitting
          </p>
        )}
      </div>

      {serverError && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 text-[14px] rounded-xl px-5 py-4 flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" /> {serverError}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface Props { propertySlug?: string }

export function RentalApplicationForm({ propertySlug }: Props) {
  const { user, login, register: authRegister, verifyEmail, resendOTP, fetchLatestProfile } = useAuth();
  const router = useRouter();

  const [step, setStep]               = useState(0);
  const [submitting, setSubmitting]   = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [propertyData, setPropertyData] = useState<any>(null);
  const [autofilledFields, setAutofilledFields] = useState<Set<string>>(new Set());
  const [draftId, setDraftId] = useState<number | null>(() => {
    try { const s = sessionStorage.getItem(DRAFT_ID_KEY); return s ? parseInt(s, 10) : null; } catch { return null; }
  });

  const hasStartedRef  = useRef(false);
  const isSubmittedRef = useRef(false);

  const [authMode, setAuthMode]       = useState<"register" | "login" | "verify">("register");
  const [authForm, setAuthForm]       = useState({ email: "", password: "", confirm: "", first_name: "", last_name: "" });
  const [authError, setAuthError]     = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [showPass, setShowPass]       = useState(false);
  const [otpCode, setOtpCode]         = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Content steps 0–10, then account (guest only at 11), then review
  const ACCOUNT_STEP = 11;
  const REVIEW_STEP  = user ? 11 : 12;
  const TOTAL_STEPS  = user ? 12 : 13;

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { ...DEFAULT_VALUES, ...loadDraftLocal(), rental_property: propertySlug ?? null },
    mode: "onTouched",
  });

  const { control, register, watch, trigger, getValues, setValue, reset, formState: { errors } } = methods;

  const { fields: animalFields, append: appendAnimal, remove: removeAnimal } = useFieldArray({ control, name: "animals" });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const nameParam = params.get("name");
    const firstNameParam = params.get("first_name");
    const lastNameParam = params.get("last_name");
    const emailParam = params.get("email");
    const phoneParam = params.get("phone") || params.get("cell_phone");
    const incomeParam = params.get("income") || params.get("gross_monthly_income");

    const updates: Partial<FormData> = {};

    if (firstNameParam) updates.first_name = firstNameParam;
    if (lastNameParam) updates.last_name = lastNameParam;
    
    if (nameParam && !firstNameParam) {
      const parts = nameParam.trim().split(/\s+/);
      updates.first_name = parts[0] || "";
      if (parts.length > 1) {
        updates.last_name = parts.slice(1).join(" ");
      }
    }

    if (emailParam) updates.email = emailParam;
    if (phoneParam) updates.cell_phone = phoneParam;
    if (incomeParam) {
      const cleanIncome = incomeParam.replace(/[^0-9]/g, "");
      updates.gross_monthly_income = cleanIncome;
    }

    let appliedAny = false;
    Object.entries(updates).forEach(([key, val]) => {
      if (val) {
        setValue(key as keyof FormData, val);
        appliedAny = true;
        setAutofilledFields((prev) => {
          const next = new Set(prev);
          next.add(key);
          return next;
        });
      }
    });

    if (appliedAny) {
      toast.info("We've pre-filled the application using your pre-qualification details!");
    }
  }, [setValue]);

  useEffect(() => {
    const sub = methods.watch(data => saveDraftLocal(data as Partial<FormData>));
    return () => sub.unsubscribe();
  }, [methods]);

  useEffect(() => {
    if (!propertySlug) return;
    fetch(`${API_BASE}/api/v1/properties/${propertySlug}/`)
      .then(r => r.json()).then(setPropertyData).catch(() => {});
  }, [propertySlug]);

  useEffect(() => {
    if (user) {
      if (!getValues("first_name")) setValue("first_name", user.first_name);
      if (!getValues("last_name"))  setValue("last_name",  user.last_name);
      if (!getValues("email"))      setValue("email",      user.email);
    }
  }, [user, getValues, setValue]);

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
  }, [user]); // eslint-disable-line

  useEffect(() => {
    if (user && step === ACCOUNT_STEP) setStep(REVIEW_STEP);
  }, [user, step, ACCOUNT_STEP, REVIEW_STEP]);

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
  }, []); // eslint-disable-line

  useEffect(() => {
    if (step === 0) return;
    const fn = () => {
      if (document.hidden && !isSubmittedRef.current)
        toast.info("Your progress is saved — come back any time to finish.", { duration: 4000 });
    };
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, [step]);

  useEffect(() => {
    const fn = () => {
      if (hasStartedRef.current && !isSubmittedRef.current)
        window.dataLayer?.push({ event: "application_abandoned", step_reached: step });
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

    if (currentStep >= 0) Object.assign(payload, {
      first_name: d.first_name, middle_name: d.middle_name, last_name: d.last_name,
      marital_status: d.marital_status,
    });
    if (currentStep >= 1) Object.assign(payload, {
      cell_phone: d.cell_phone, home_phone: d.home_phone,
      phone_type: d.phone_type, preferred_contact: d.preferred_contact,
    });
    if (currentStep >= 2) Object.assign(payload, {
      emergency_contact_name: d.emergency_contact_name,
      emergency_contact_relationship: d.emergency_contact_relationship,
      emergency_contact_phone: d.emergency_contact_phone,
      emergency_contact_phone_type: d.emergency_contact_phone_type,
    });
    if (currentStep >= 3) Object.assign(payload, {
      date_of_birth: d.date_of_birth, id_type: d.id_type,
      ssn_last4: d.id_type === "ssn" ? (d.ssn ?? "").replace(/\D/g, "").slice(-4) : "",
      ein: d.id_type === "ein" ? d.ein : "",
      has_drivers_license: d.has_drivers_license,
      drivers_license_number: d.has_drivers_license ? d.drivers_license_number : "",
      drivers_license_state:  d.has_drivers_license ? d.drivers_license_state  : "",
    });
    if (currentStep >= 4) Object.assign(payload, {
      gross_monthly_income: d.gross_monthly_income,
      employer_name: d.employer_name, employer_phone: d.employer_phone,
      job_title: d.job_title, employment_start_date: d.employment_start_date,
    });
    if (currentStep >= 5) Object.assign(payload, {
      present_address: d.present_address, city: d.city, state: d.state, zip_code: d.zip_code,
    });
    if (currentStep >= 6) Object.assign(payload, {
      how_long_at_address: d.how_long_at_address, reason_for_leaving: d.reason_for_leaving,
      current_landlord_name: d.current_landlord_name, current_landlord_phone: d.current_landlord_phone,
    });
    if (currentStep >= 7) Object.assign(payload, {
      move_in_date: d.move_in_date, intended_stay_duration: d.intended_stay_duration,
      months_rent_upfront: d.months_rent_upfront,
      ...(d.rental_property ? { rental_property: d.rental_property } : {}),
    });
    if (currentStep >= 8) Object.assign(payload, {
      has_kids: d.has_kids, number_of_kids: d.number_of_kids,
      has_vehicles: d.has_vehicles, number_of_vehicles: d.number_of_vehicles,
      smokes: d.smokes, drinks: d.drinks,
    });
    if (currentStep >= 9) Object.assign(payload, {
      has_pets: d.has_pets, animals: d.animals,
    });
    if (currentStep >= 10) Object.assign(payload, {
      has_felony_eviction_bankruptcy: d.has_felony_eviction_bankruptcy,
      is_active_military: d.is_active_military,
      has_housing_assistance: d.has_housing_assistance,
    });

    const utms = getStoredUTMs();
    if (utms.utm_source)   payload.utm_source   = utms.utm_source;
    if (utms.utm_medium)   payload.utm_medium   = utms.utm_medium;
    if (utms.utm_campaign) payload.utm_campaign = utms.utm_campaign;

    fetch(`${API_BASE}/api/v1/leads/apply/save-draft/`, {
      method: "POST", headers: { "Content-Type": "application/json" },
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

  // ── Navigation ─────────────────────────────────────────────────────────────

  function goBack() {
    setServerError(null);
    if (step === REVIEW_STEP)  { setStep(user ? 10 : ACCOUNT_STEP); return; }
    if (!user && step === ACCOUNT_STEP) { setStep(10); return; }
    setStep(s => Math.max(0, s - 1));
  }

  async function goNext() {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      trackEvent("application_started", { property_slug: propertySlug ?? "" });
      trackMetaEvent("InitiateCheckout", { content_ids: [propertySlug ?? ""], content_type: "property" });
    }

    if (step === REVIEW_STEP) { await handleSubmit(); return; }
    if (step === ACCOUNT_STEP) return;

    const stepFields = STEP_FIELDS[step] ?? [];
    let valid = await trigger(stepFields);

    if (step === 9 && watch("has_pets")) {
      if (animalFields.length === 0) { toast.error("Please add at least one animal"); return; }
      const paths = animalFields.flatMap((_, i) =>
        [`animals.${i}.type`, `animals.${i}.breed`, `animals.${i}.weight`, `animals.${i}.name`]
      ) as (keyof FormData)[];
      if (!await trigger(paths)) valid = false;
    }

    if (!valid) return;

    saveDraftToBackend(step);

    if (!user && step === 10) { setStep(ACCOUNT_STEP); return; }
    if (user  && step === 10) { setStep(REVIEW_STEP);  return; }
    setStep(s => s + 1);
  }

  // ── Final Submit ────────────────────────────────────────────────────────────

  async function handleSubmit() {
    const confirmed = getValues("confirmed");
    if (!confirmed) { await trigger("confirmed"); return; }
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
        drivers_license_state:  d.has_drivers_license ? d.drivers_license_state  : "",
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
        ...(d.rental_property  ? { rental_property: d.rental_property } : {}),
        ...(utms.utm_source    ? { utm_source:   utms.utm_source }   : {}),
        ...(utms.utm_medium    ? { utm_medium:   utms.utm_medium }   : {}),
        ...(utms.utm_campaign  ? { utm_campaign: utms.utm_campaign } : {}),
      };

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (user) {
        const token = localStorage.getItem("access_token");
        if (token) headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/api/v1/leads/apply/`, { method: "POST", headers, body: JSON.stringify(body) });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const { message, fields } = parseBackendError(data);
        const first = Object.keys(fields)[0] ?? "";
        if (["first_name", "last_name", "marital_status"].includes(first))             setStep(0);
        else if (["email", "cell_phone", "phone_type"].includes(first))               setStep(1);
        else if (first.startsWith("emergency_contact"))                                setStep(2);
        else if (["date_of_birth", "id_type", "ssn_last4", "ein"].includes(first))    setStep(3);
        else if (first === "gross_monthly_income")                                     setStep(4);
        else if (["present_address", "city", "state", "zip_code"].includes(first))    setStep(5);
        else if (["how_long_at_address", "reason_for_leaving"].includes(first))       setStep(6);
        else if (["move_in_date", "intended_stay_duration"].includes(first))          setStep(7);
        else if (["has_felony_eviction_bankruptcy", "is_active_military", "has_housing_assistance"].includes(first)) setStep(10);
        toast.error("Please fix the errors in the form", { description: message });
        setServerError(message);
        return;
      }

      const data = await res.json();
      const profileToSave = { ...getValues() } as any;
      delete profileToSave.confirmed;
      delete profileToSave.rental_property;
      delete profileToSave.ssn;
      delete profileToSave.ein;
      delete profileToSave.ein_confirm;
      localStorage.setItem(SAVED_PROFILE_KEY, JSON.stringify(profileToSave));

      clearDraftLocal();
      try { sessionStorage.removeItem(DRAFT_ID_KEY); } catch {}
      setDraftId(null);
      isSubmittedRef.current = true;
      trackEvent("submit_application", { application_id: data.id });
      trackMetaEvent("Lead", { content_name: "Rental Application Submitted", content_ids: [d.rental_property ?? ""] });
      toast.success("Application Submitted!");
      router.push(`/apply/success?ref=${data.id}&name=${encodeURIComponent(d.first_name)}`);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Auth handlers ──────────────────────────────────────────────────────────

  async function handleAuth() {
    setAuthError(null);
    const domEmail    = (document.getElementById("auth-email")    as HTMLInputElement)?.value;
    const domPassword = (document.getElementById("auth-password") as HTMLInputElement)?.value;
    const domConfirm  = (document.getElementById("auth-confirm")  as HTMLInputElement)?.value;
    const emailVal    = (domEmail    || authForm.email    || getValues("email") || "").trim();
    const passVal     =  domPassword || authForm.password || "";
    const confirmVal  =  domConfirm  || authForm.confirm  || "";

    if (authMode === "register") {
      const fName = ((document.getElementById("auth-first-name") as HTMLInputElement)?.value || authForm.first_name || getValues("first_name") || "").trim();
      const lName = ((document.getElementById("auth-last-name")  as HTMLInputElement)?.value || authForm.last_name  || getValues("last_name")  || "").trim();
      if (!fName || !lName) { setAuthError("Enter your full name."); return; }
      if (!emailVal)         { setAuthError("Enter your email."); return; }
      if (passVal.length < 8) { setAuthError("Password must be at least 8 characters."); return; }
      if (passVal !== confirmVal) { setAuthError("Passwords don't match."); return; }
    } else {
      if (!emailVal || !passVal) { setAuthError("Enter email and password."); return; }
    }

    setAuthLoading(true);
    try {
      if (authMode === "register") {
        await authRegister({
          email: emailVal, password: passVal,
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
      setAuthError(msg); toast.error("Authentication failed", { description: msg });
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
      setAuthError(msg); toast.error("Verification failed", { description: msg });
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

  const currentTitle = step < STEP_TITLES.length
    ? STEP_TITLES[step]
    : step === ACCOUNT_STEP ? "Create Account"
    : "Review Application";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <FormProvider {...methods}>
      <div className="max-w-lg mx-auto">

        {/* Step header */}
        {step !== ACCOUNT_STEP && (
          <StepHeader step={step} total={TOTAL_STEPS} title={currentTitle} />
        )}

        {/* Step content */}
        {step === 0  && <Step0_Name />}
        {step === 1  && <Step1_Contact />}
        {step === 2  && <Step2_Emergency />}
        {step === 3  && <Step3_Identity />}
        {step === 4  && <Step4_Income />}
        {step === 5  && <Step5_Address />}
        {step === 6  && <Step6_History />}
        {step === 7  && <Step7_MoveIn />}
        {step === 8  && <Step8_Household />}
        {step === 9  && (
          <Step9_Pets
            animalFields={animalFields}
            appendAnimal={appendAnimal}
            removeAnimal={removeAnimal}
          />
        )}
        {step === 10 && <Step10_Background />}

        {/* Account gate */}
        {step === ACCOUNT_STEP && !user && (
          <>
            <StepHeader step={step} total={TOTAL_STEPS} title={
              authMode === "register" ? "Create Your Account"
              : authMode === "verify" ? "Verify Your Email"
              : "Sign In to Continue"
            } />

            {authError && (
              <div className="mb-5 bg-red-50 border-2 border-red-200 text-red-700 text-[15px] rounded-xl px-5 py-4 flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" /> {authError}
              </div>
            )}

            {authMode === "verify" ? (
              <div className="space-y-6">
                <p className="text-[16px] text-[#667085]">Enter the 6-digit code sent to your email.</p>
                <div className="flex justify-between gap-2">
                  {otpCode.map((digit, index) => (
                    <input key={index} id={`apply-otp-${index}`} type="text" inputMode="numeric"
                      maxLength={6} value={digit}
                      onChange={e => handleOtpChange(index, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(index, e)}
                      className="w-full h-[68px] text-center text-[24px] font-bold text-[#101828] bg-white rounded-xl border-2 border-[#D0D5DD] focus:border-brand outline-none transition-colors"
                    />
                  ))}
                </div>
                <button type="button" onClick={handleVerify} disabled={authLoading}
                  className="w-full h-[62px] flex items-center justify-center gap-2 bg-brand text-white text-[17px] font-semibold rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-50">
                  {authLoading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Verify & Continue"}
                </button>
                <div className="text-center">
                  <button type="button" onClick={handleResend} disabled={resendCooldown > 0}
                    className="text-[15px] text-[#667085] hover:text-[#101828] transition-colors disabled:opacity-50">
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Didn't receive the code? Resend"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {authMode === "register" && getValues("first_name") && (
                  <div className="bg-[#F0FDF4] border-2 border-[#BBF7D0] rounded-xl px-5 py-4 flex items-start gap-3">
                    <Check size={18} className="text-[#16a34a] mt-0.5 shrink-0" />
                    <p className="text-[15px] text-[#101828]">
                      Your application details are saved. Create an account to track your application.
                    </p>
                  </div>
                )}
                {authMode === "register" && (
                  <div className="flex gap-3">
                    <FieldGroup label="First Name">
                      <BigInput id="auth-first-name" defaultValue={getValues("first_name")}
                        onChange={e => setAuthForm(f => ({ ...f, first_name: e.target.value }))} placeholder="Jane" />
                    </FieldGroup>
                    <FieldGroup label="Last Name">
                      <BigInput id="auth-last-name" defaultValue={getValues("last_name")}
                        onChange={e => setAuthForm(f => ({ ...f, last_name: e.target.value }))} placeholder="Smith" />
                    </FieldGroup>
                  </div>
                )}
                <FieldGroup label="Email Address">
                  <BigInput id="auth-email" type="email" defaultValue={getValues("email")}
                    onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" />
                </FieldGroup>
                <FieldGroup label="Password">
                  <div className="relative">
                    <BigInput id="auth-password" type={showPass ? "text" : "password"}
                      onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))}
                      placeholder={authMode === "register" ? "At least 8 characters" : "Your password"}
                      className="pr-14" />
                    <button type="button" onClick={() => setShowPass(s => !s)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#101828] transition-colors">
                      {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </FieldGroup>
                {authMode === "register" && (
                  <FieldGroup label="Confirm Password">
                    <BigInput id="auth-confirm" type={showPass ? "text" : "password"}
                      onChange={e => setAuthForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Re-enter password" />
                  </FieldGroup>
                )}
                <button type="button" onClick={handleAuth} disabled={authLoading}
                  className="w-full h-[62px] flex items-center justify-center gap-2 bg-brand text-white text-[17px] font-semibold rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-50">
                  {authLoading
                    ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : authMode === "register" ? "Create Account & Continue" : "Sign In & Continue"}
                </button>
                <div className="text-center">
                  <button type="button"
                    onClick={() => { setAuthMode(m => m === "register" ? "login" : "register"); setAuthError(null); }}
                    className="text-[16px] text-brand font-semibold hover:underline">
                    {authMode === "register" ? "Already have an account? Sign in" : "Don't have an account? Create one"}
                  </button>
                </div>
              </div>
            )}

            <button type="button" onClick={
              authMode === "verify"
                ? () => { setAuthMode("login"); setOtpCode(["", "", "", "", "", ""]); setAuthError(null); }
                : goBack
            }
              className="mt-6 flex items-center gap-1.5 text-[16px] font-semibold text-[#667085] hover:text-[#101828] transition-colors">
              <ChevronLeft size={18} strokeWidth={2.5} /> Back
            </button>
          </>
        )}

        {/* Review */}
        {step === REVIEW_STEP && (
          <ReviewStep
            propertyData={propertyData}
            onEdit={setStep}
            serverError={serverError}
            autofilledFields={autofilledFields}
            startFresh={startFresh}
          />
        )}

        {/* Nav buttons — hidden on account step */}
        {(step !== ACCOUNT_STEP || user) && (
          <NavButtons
            step={step} total={TOTAL_STEPS}
            onBack={goBack} onNext={goNext}
            nextLabel={step === REVIEW_STEP ? "Submit Application" : "Save & Continue"}
            loading={submitting}
          />
        )}

        <p className="text-center text-[14px] text-[#98A2B3] mt-6">
          Your information is handled confidentially.{" "}
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </FormProvider>
  );
}
