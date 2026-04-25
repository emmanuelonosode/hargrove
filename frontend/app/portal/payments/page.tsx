"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText, CheckCircle, Clock, AlertCircle,
  ArrowLeft, Download, Mail, Building2, ChevronDown,
  Camera, Shield, X, CreditCard,
} from "lucide-react";
import { apiFetch } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const API_BASE = typeof window !== "undefined"
  ? ""
  : (process.env.NEXT_PUBLIC_API_URL ?? "https://admin.haskerrealtygroup.com");

interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Invoice {
  id: number;
  invoice_number: string;
  title: string;
  description: string;
  issued_date: string;
  due_date: string;
  line_items: InvoiceLineItem[];
  subtotal: string;
  tax_rate: string;
  tax_amount: string;
  total: string;
  pdf: string;
  status: "SENT" | "PAID" | "DRAFT" | "VOID";
  created_at: string;
  property_title: string;
  property_address: string;
  transaction_type: string;
}

interface Payment {
  id: number;
  amount: string;
  payment_method: string;
  status: string;
  created_at: string;
  invoice: number | null;
}

interface PaymentConfig {
  method: string;
  display_name: string;
  handle: string;
  extra_instructions: string;
}

const STATUS = {
  SENT:  { label: "Due",   icon: Clock,       text: "text-[#FF9F0A]", bg: "bg-[#F5F5F7]" },
  PAID:  { label: "Paid",  icon: CheckCircle, text: "text-[#34C759]", bg: "bg-[#F5F5F7]" },
  VOID:  { label: "Void",  icon: AlertCircle, text: "text-[#6E6E73]", bg: "bg-[#F5F5F7]" },
  DRAFT: { label: "Draft", icon: FileText,    text: "text-[#6E6E73]", bg: "bg-[#F5F5F7]" },
} as const;

function fmt(v: string | number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    typeof v === "string" ? parseFloat(v) : v
  );
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// ── Payment method inline SVG logos ───────────────────────────────────────────
// Inline SVGs avoid CSP issues and external image dependencies.

function VenmoLogo() {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#3D95CE"/>
      <path d="M22 9c.7 1.2 1 2.6 1 4.3 0 5-4.3 11.5-7.8 15.7H9.1L6.5 9.6l5.6-.5 1.3 10.8c1.2-2.3 2.8-6 2.8-8.5 0-1.4-.2-2.4-.6-3.1L22 9z" fill="white"/>
    </svg>
  );
}

function PayPalLogo() {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#F4F6F8"/>
      <path d="M19.8 8H14a.5.5 0 0 0-.5.4L11 23.6c0 .2.1.4.4.4h2.6c.3 0 .5-.2.5-.5l.6-3.7c.1-.3.3-.5.6-.5H17c3.4 0 5.5-1.7 6-4.9.3-1.4 0-2.6-.6-3.4C21.7 9.7 20.9 8 19.8 8zm.5 5c-.3 2-1.7 2-3 2h-.8l.6-3.6c0-.2.2-.3.3-.3h.4c.9 0 1.8 0 2.2.5.3.4.4.9.3 1.4z" fill="#003087"/>
      <path d="M22.5 13h-2.6c-.2 0-.3.1-.3.3l-.1.5c.5-.7 1.5-1 2.5-1h.2c1.8 0 3 .8 3.4 2.3.7 2.8-1.2 5.2-4 5.2h-.9c-.3 0-.5.2-.6.4l-.6 3.7c0 .2-.2.4-.4.4h-2.4c-.2 0-.4-.2-.3-.4l1.2-7.7" fill="#009CDE"/>
    </svg>
  );
}

function CashAppLogo() {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#00D64F"/>
      <path d="M17.2 9.5V8h-2.4v1.6c-2 .4-3.3 1.8-3.3 3.5 0 2 1.7 2.8 3.3 3.4 1.4.5 2.4.9 2.4 1.8 0 .8-.7 1.3-2 1.3-1.3 0-2.5-.6-3.3-1.4l-1 1.5c.8.9 2 1.5 3.9 1.7V24h2.4v-1.6c2.2-.4 3.5-1.9 3.5-3.7 0-2-1.7-2.9-3.4-3.5-1.4-.5-2.2-.9-2.2-1.6 0-.7.6-1.1 1.5-1.1 1.1 0 2.2.5 2.9 1.2l1-1.5c-.9-.8-2.1-1.3-3.3-1.7z" fill="white"/>
    </svg>
  );
}

function ChimeLogo() {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#1DA462"/>
      <path d="M16 7C10.5 7 6 11.5 6 17s4.5 10 10 10 10-4.5 10-10S21.5 7 16 7zm.5 15.5c-3 0-5.5-2.5-5.5-5.5s2.5-5.5 5.5-5.5c1.5 0 2.8.6 3.8 1.5l-1.8 1.8c-.5-.5-1.2-.8-2-.8-1.7 0-3 1.3-3 3s1.3 3 3 3c.8 0 1.5-.3 2-.8l1.8 1.8c-1 1-2.3 1.5-3.8 1.5z" fill="white"/>
    </svg>
  );
}

function ZelleLogo() {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#6D1ED4"/>
      <path d="M24 9H8v3l9.5 8H8v3h16v-3L14.5 12H24V9z" fill="white"/>
    </svg>
  );
}

const PAYMENT_LOGOS: Record<string, React.ReactNode> = {
  VENMO:         <VenmoLogo />,
  PAYPAL:        <PayPalLogo />,
  CASHAPP:       <CashAppLogo />,
  CHIME:         <ChimeLogo />,
  BANK_TRANSFER: <ZelleLogo />,
};

// ── Payment Modal ─────────────────────────────────────────────────────────────

type ModalStep = "form" | "success";

const FALLBACK_METHODS: PaymentConfig[] = [
  { method: "VENMO",         display_name: "Venmo",    handle: "@HaskerRealty",                    extra_instructions: "" },
  { method: "CASHAPP",       display_name: "Cash App", handle: "$HaskerRealty",                    extra_instructions: "" },
  { method: "PAYPAL",        display_name: "PayPal",   handle: "payments@haskerrealtygroup.com",   extra_instructions: "Use Friends & Family to avoid delays." },
  { method: "CHIME",         display_name: "Chime",    handle: "@Hasker-Realty",                   extra_instructions: "" },
  { method: "BANK_TRANSFER", display_name: "Zelle",    handle: "info@haskerrealtygroup.com",       extra_instructions: "" },
];

function PaymentModal({
  invoice,
  paymentConfig,
  onClose,
  onSuccess,
}: {
  invoice: Invoice;
  paymentConfig: PaymentConfig[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<ModalStep>("form");
  const [method, setMethod] = useState<string>("VENMO");
  const [refId, setRefId] = useState("");
  const [file, setProofFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-close and refresh after showing success screen
  useEffect(() => {
    if (step !== "success") return;
    const t = setTimeout(() => {
      onSuccess();
      onClose();
    }, 2500);
    return () => clearTimeout(t);
  }, [step, onSuccess, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!refId.trim()) return setError("Enter your transaction reference (e.g. username or confirmation ID)");
    if (!file) return setError("Please upload a screenshot of your transfer");

    setLoading(true);
    setError("");

    try {
      // Use FormData so the file is sent as multipart — avoids Django's
      // 2.5 MB JSON body limit that breaks base64-encoded image uploads.
      const formData = new FormData();
      formData.append("invoice", String(invoice.id));
      formData.append("amount", invoice.total);
      formData.append("payment_method", method);
      formData.append("reference_id", refId.trim());
      formData.append("proof_file", file);

      const res = await apiFetch(`/api/v1/transactions/my-payments/submit-proof/`, {
        method: "POST",
        // No Content-Type header — browser sets multipart/form-data + boundary
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg =
          data.detail ??
          data.proof_file ??
          (Object.values(data).flat()[0] as string) ??
          "Failed to submit proof. Please try again.";
        throw new Error(String(msg));
      }

      setStep("success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const methods = (paymentConfig.length > 0 ? paymentConfig : FALLBACK_METHODS).map((c) => ({
    id: c.method,
    label: c.display_name,
    handle: c.handle,
    extra: c.extra_instructions,
  }));

  const current = methods.find((m) => m.id === method) ?? methods[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop — disabled during loading to prevent accidental dismiss */}
      <div
        className="absolute inset-0 bg-[#0B1F3A]/60 backdrop-blur-sm"
        onClick={loading ? undefined : onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-black/[0.04] flex items-center justify-between">
          <div>
            <h3 className="text-[17px] font-bold text-[#1D1D1F]">Submit Payment Proof</h3>
            <p className="text-[12px] text-[#6E6E73]">{invoice.invoice_number} • {fmt(invoice.total)}</p>
          </div>
          {!loading && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* ── Success screen ── */}
        {step === "success" ? (
          <div className="px-6 py-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#E6F9ED] flex items-center justify-center mb-5">
              <CheckCircle size={32} className="text-[#34C759]" strokeWidth={1.8} />
            </div>
            <h4 className="text-[18px] font-bold text-[#1D1D1F] mb-2">Proof Submitted!</h4>
            <p className="text-[13px] text-[#6E6E73] leading-relaxed max-w-xs mb-1">
              We have received your payment proof. Please wait while our team verifies it.
            </p>
            <p className="text-[12px] text-[#6E6E73]">
              A confirmation email is on its way. Verification typically takes 1–2 business hours.
            </p>
            <div className="mt-6 w-full bg-[#F5F5F7] rounded-full h-1 overflow-hidden">
              <div className="h-full bg-brand animate-[shrink_2.5s_linear_forwards] rounded-full" />
            </div>
          </div>
        ) : (
          /* ── Form ── */
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Method Selection */}
            <div className="grid grid-cols-5 gap-2">
              {methods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all",
                    method === m.id
                      ? "border-brand bg-brand/5 shadow-sm"
                      : "border-transparent bg-[#F5F5F7] opacity-55 hover:opacity-80"
                  )}
                >
                  <div className="w-8 h-8 flex items-center justify-center shrink-0 rounded-lg overflow-hidden">
                    {PAYMENT_LOGOS[m.id]}
                  </div>
                  <span className={cn(
                    "text-[9px] font-semibold leading-none",
                    method === m.id ? "text-brand" : "text-[#6E6E73]"
                  )}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Instructions */}
            <div className="bg-[#F5F5F7] rounded-2xl p-5 border border-black/[0.02]">
              <p className="text-[11px] font-bold text-[#6E6E73] uppercase tracking-widest mb-2">
                Send {fmt(invoice.total)} to
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0">
                  {PAYMENT_LOGOS[method]}
                </div>
                <p className="text-[17px] font-bold text-[#1D1D1F] tracking-tight">{current.handle}</p>
              </div>
              {current.extra && (
                <p className="text-[12px] text-[#6E6E73] mt-1">{current.extra}</p>
              )}
              <p className="text-[12px] text-[#6E6E73] mt-2">
                Include invoice{" "}
                <span className="font-mono font-bold text-brand">{invoice.invoice_number}</span>{" "}
                in the notes.
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#6E6E73] uppercase mb-1.5 px-1">
                  Your {current.label} Name / Ref *
                </label>
                <input
                  value={refId}
                  onChange={(e) => setRefId(e.target.value)}
                  placeholder={current.id === "CASHAPP" ? "$Username" : "Confirmation ID"}
                  className="w-full rounded-xl bg-[#F5F5F7] px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-brand/20 border border-transparent"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6E6E73] uppercase mb-1.5 px-1">
                  Upload Receipt Screenshot *
                </label>
                <label
                  className={cn(
                    "flex flex-col items-center justify-center w-full aspect-[16/6] rounded-2xl border-2 border-dashed transition-all cursor-pointer",
                    file ? "border-brand bg-brand/5" : "border-black/10 bg-[#F5F5F7] hover:border-black/20"
                  )}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  />
                  {file ? (
                    <div className="text-center px-4">
                      <CheckCircle size={20} className="text-brand mx-auto mb-1" />
                      <p className="text-[12px] font-semibold text-brand truncate">{file.name}</p>
                      <p className="text-[10px] text-[#6E6E73] mt-0.5">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="text-center text-[#6E6E73]">
                      <Camera size={20} className="mx-auto mb-1 opacity-40" />
                      <p className="text-[12px] font-medium">Click to upload</p>
                      <p className="text-[10px] opacity-60 mt-0.5">PNG, JPG, WEBP up to 10 MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {error && (
              <p className="text-[12px] text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                {error}
              </p>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-brand text-white font-bold py-4 rounded-2xl hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading…</span>
                </>
              ) : (
                "Submit Proof of Payment"
              )}
            </button>

            <div className="flex items-center gap-2 justify-center text-[#6E6E73]">
              <Shield size={12} />
              <p className="text-[11px]">Manual verification takes 1–2 business hours.</p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const [invRes, payRes, configRes] = await Promise.all([
        apiFetch(`${API_BASE}/api/v1/transactions/my-invoices/`),
        apiFetch(`${API_BASE}/api/v1/transactions/my-payments/`),
        fetch(`${API_BASE}/api/v1/transactions/payment-config/`),
      ]);
      if (!invRes.ok || !payRes.ok) throw new Error("API error");
      const [invData, payData] = await Promise.all([invRes.json(), payRes.json()]);
      setInvoices(invData?.results ?? (Array.isArray(invData) ? invData : []));
      setPayments(payData?.results ?? (Array.isArray(payData) ? payData : []));
      if (configRes.ok) {
        const configData = await configRes.json();
        setPaymentConfig(Array.isArray(configData) ? configData : []);
      }
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const pending = invoices.filter((i) => i.status === "SENT");
  const paid    = invoices.filter((i) => i.status === "PAID");

  // Invoice IDs that already have a proof awaiting verification — block re-submission
  const pendingInvoiceIds = new Set(
    payments
      .filter((p) => p.status === "PENDING_VERIFICATION" && p.invoice != null)
      .map((p) => p.invoice as number)
  );

  return (
    <div className="min-h-screen bg-[#F5F5F7] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-3xl mx-auto space-y-4">

        {selectedInvoice && (
          <PaymentModal
            invoice={selectedInvoice}
            paymentConfig={paymentConfig}
            onClose={() => setSelectedInvoice(null)}
            onSuccess={() => {
              fetchData();
              toast.success("Payment proof submitted — we'll email you once it's verified.");
            }}
          />
        )}

        {/* Header */}
        <div className="flex items-center gap-3 px-1">
          <Link
            href="/portal/profile"
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
          >
            <ArrowLeft size={15} strokeWidth={2} />
          </Link>
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight text-[#1D1D1F]">
              Invoices & Payments
            </h1>
            <p className="text-[13px] text-[#6E6E73]">Issued by your property manager</p>
          </div>
        </div>

        {/* Info card */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-[#EFF4FF] flex items-center justify-center shrink-0">
            <Building2 size={18} className="text-brand" strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#1D1D1F] mb-1">How to pay</p>
            <p className="text-[12px] text-[#6E6E73] leading-relaxed">
              When an invoice is issued you&apos;ll receive an email with payment instructions —
              bank details, check payable info, and your reference number. Use the invoice
              number as your payment reference.
            </p>
            <a
              href="mailto:info@haskerrealtygroup.com"
              className="inline-flex items-center gap-1.5 text-[12px] text-brand font-semibold mt-2.5 hover:underline"
            >
              <Mail size={12} />
              info@haskerrealtygroup.com
            </a>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-black/[0.04] animate-pulse" />
            ))}
          </div>
        ) : loadError ? (
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] py-16 flex flex-col items-center text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-[#F5F5F7] flex items-center justify-center mb-4">
              <AlertCircle size={26} className="text-[#FF3B30]" strokeWidth={1.5} />
            </div>
            <h2 className="text-[15px] font-semibold text-[#1D1D1F] tracking-tight mb-2">
              Could not load payment data
            </h2>
            <p className="text-[13px] text-[#6E6E73] max-w-xs leading-relaxed mb-5">
              There was a problem connecting to the server. Please check your connection and try again.
            </p>
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-1.5 bg-brand text-white text-[12px] font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-hover transition-colors"
            >
              Retry
            </button>
          </div>
        ) : invoices.length === 0 && payments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] py-16 flex flex-col items-center text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-[#F5F5F7] flex items-center justify-center mb-4">
              <FileText size={26} className="text-[#C7C7CC]" strokeWidth={1.5} />
            </div>
            <h2 className="text-[15px] font-semibold text-[#1D1D1F] tracking-tight mb-2">
              No invoices or payments yet
            </h2>
            <p className="text-[13px] text-[#6E6E73] max-w-xs leading-relaxed">
              When an invoice is issued or you make a payment, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {invoices.length > 0 && (
              <div className="space-y-5">
                {pending.length > 0 && (
                  <div className="bg-[#FFF8EC] border border-[#FF9F0A]/20 rounded-2xl p-4 flex gap-3 items-start">
                    <AlertCircle size={16} className="text-[#FF9F0A] mt-0.5 shrink-0" strokeWidth={1.8} />
                    <div>
                      <p className="text-[13px] font-semibold text-[#1D1D1F]">
                        {pending.length} outstanding invoice{pending.length > 1 ? "s" : ""}
                      </p>
                      <p className="text-[12px] text-[#6E6E73] mt-0.5">
                        Pay via bank transfer using your invoice number as the reference.
                      </p>
                      <a
                        href="mailto:info@haskerrealtygroup.com?subject=Payment Inquiry"
                        className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand mt-1.5 hover:underline"
                      >
                        <Mail size={11} /> Questions? Email us
                      </a>
                    </div>
                  </div>
                )}
                {pending.length > 0 && (
                  <section>
                    <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6E6E73] px-1 mb-2">
                      Outstanding Invoices ({pending.length})
                    </p>
                    <div className="space-y-2">
                      {pending.map((inv) => (
                        <InvoiceCard
                          key={inv.id}
                          invoice={inv}
                          expanded={expanded === inv.id}
                          onToggle={() => setExpanded(expanded === inv.id ? null : inv.id)}
                          onPay={(i) => setSelectedInvoice(i)}
                          hasPendingPayment={pendingInvoiceIds.has(inv.id)}
                        />
                      ))}
                    </div>
                  </section>
                )}
                {paid.length > 0 && (
                  <section>
                    <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6E6E73] px-1 mb-2">
                      Invoice History ({paid.length})
                    </p>
                    <div className="space-y-2">
                      {paid.map((inv) => (
                        <InvoiceCard
                          key={inv.id}
                          invoice={inv}
                          expanded={expanded === inv.id}
                          onToggle={() => setExpanded(expanded === inv.id ? null : inv.id)}
                          onPay={(i) => setSelectedInvoice(i)}
                          hasPendingPayment={false}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {payments.length > 0 && (
              <section>
                <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6E6E73] px-1 mb-2">
                  My Payments ({payments.length})
                </p>
                <div className="space-y-2">
                  {payments.map((pay) => (
                    <PaymentRow key={pay.id} payment={pay} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Payment Row ───────────────────────────────────────────────────────────────

function PaymentRow({ payment: pay }: { payment: Payment }) {
  const isVerified = pay.status === "VERIFIED" || pay.status === "SUCCESSFUL";
  const isRejected = pay.status === "REJECTED" || pay.status === "FAILED";

  return (
    <div className="flex items-center gap-3 px-5 py-4 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-md transition-shadow">
      <div className="w-9 h-9 rounded-xl bg-[#F5F5F7] flex items-center justify-center shrink-0">
        {isVerified ? (
          <CheckCircle size={15} className="text-[#34C759]" strokeWidth={2} />
        ) : isRejected ? (
          <AlertCircle size={15} className="text-[#FF3B30]" strokeWidth={2} />
        ) : (
          <Clock size={15} className="text-[#FF9F0A]" strokeWidth={2} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[14px] font-semibold text-[#1D1D1F] truncate">{pay.payment_method}</p>
          {!isVerified && (
            <span
              className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide shrink-0",
                isRejected ? "bg-[#FFEEEE] text-[#FF3B30]" : "bg-[#FFF3DC] text-[#FF9F0A]"
              )}
            >
              {pay.status === "PENDING_VERIFICATION" ? "Reviewing" : pay.status}
            </span>
          )}
        </div>
        <p className="text-[12px] text-[#6E6E73] truncate">{fmtDate(pay.created_at)}</p>
      </div>
      <p className={cn("text-[15px] font-semibold shrink-0", isVerified ? "text-[#34C759]" : "text-[#1D1D1F]")}>
        {fmt(pay.amount)}
      </p>
    </div>
  );
}

function InvoiceCard({
  invoice,
  expanded,
  onToggle,
  onPay,
  hasPendingPayment,
}: {
  invoice: Invoice;
  expanded: boolean;
  onToggle: () => void;
  onPay: (inv: Invoice) => void;
  hasPendingPayment: boolean;
}) {
  const cfg = STATUS[invoice.status] ?? STATUS.SENT;
  const StatusIcon = cfg.icon;
  const overdue = invoice.status === "SENT" && new Date(invoice.due_date) < new Date();

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-black/[0.015] transition-colors cursor-pointer"
      >
        <div className="shrink-0 w-9 h-9 rounded-xl bg-[#F5F5F7] flex items-center justify-center">
          <StatusIcon size={16} className={cfg.text} strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-semibold text-[#1D1D1F]">{invoice.invoice_number}</span>
            <span className={cn(
              "text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#F5F5F7]",
              overdue ? "text-[#FF3B30]" : cfg.text
            )}>
              {overdue ? "Overdue" : cfg.label}
            </span>
          </div>
          <p className="text-[12px] text-[#6E6E73] mt-0.5 truncate">
            {invoice.title || invoice.property_title}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-[14px] font-semibold text-[#1D1D1F]">{fmt(invoice.total)}</p>
            <p className="text-[11px] text-[#6E6E73]">Due {fmtDate(invoice.due_date)}</p>
          </div>
          <ChevronDown
            size={15}
            className={cn("text-[#C7C7CC] transition-transform duration-200", expanded && "rotate-180")}
            strokeWidth={2.5}
          />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-black/[0.04] px-5 py-5">
          {invoice.description && (
            <div className="mb-5 bg-[#F5F5F7] p-4 rounded-xl">
              <p className="text-[11px] text-[#6E6E73] font-bold uppercase tracking-widest mb-1.5">Description</p>
              <p className="text-[13px] text-[#475569] leading-relaxed whitespace-pre-line">{invoice.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            {[
              { label: "Issued",   value: fmtDate(invoice.issued_date),                      danger: false },
              { label: "Due Date", value: fmtDate(invoice.due_date),                          danger: overdue },
              { label: "Property", value: invoice.property_title || "General",                danger: false },
              { label: "Type",     value: invoice.transaction_type?.toLowerCase() || "billing", danger: false },
            ].map(({ label, value, danger }) => (
              <div key={label}>
                <p className="text-[11px] text-[#6E6E73] font-medium uppercase tracking-wide mb-1">{label}</p>
                <p className={cn("text-[13px] font-semibold", danger ? "text-[#FF3B30]" : "text-[#1D1D1F]")}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {invoice.line_items?.length > 0 && (
            <div className="rounded-xl bg-[#F5F5F7] overflow-hidden mb-4">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-black/[0.06]">
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wide">Description</th>
                    <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wide">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.line_items.map((item, i) => (
                    <tr key={i} className="border-b border-black/[0.04] last:border-0">
                      <td className="px-4 py-3 text-[#1D1D1F]">{item.description}</td>
                      <td className="px-4 py-3 text-right font-semibold text-[#1D1D1F]">{fmt(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-black/[0.08]">
                  <tr>
                    <td className="px-4 py-3 font-semibold text-[#1D1D1F]">Total</td>
                    <td className="px-4 py-3 text-right text-[15px] font-bold text-[#1D1D1F]">{fmt(invoice.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {invoice.status === "SENT" && (
              hasPendingPayment ? (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#FF9F0A] bg-[#FFF3DC] px-4 py-2 rounded-xl border border-[#FF9F0A]/20">
                  <Clock size={13} />
                  Proof Under Review
                </span>
              ) : (
                <button
                  onClick={() => onPay(invoice)}
                  className="inline-flex items-center gap-1.5 text-[12px] font-bold text-white bg-brand px-5 py-2 rounded-xl hover:bg-brand-hover transition-colors shadow-sm"
                >
                  <CreditCard size={13} />
                  Pay Now
                </button>
              )
            )}
            {invoice.pdf && (
              <a
                href={invoice.pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand border border-brand/20 bg-[#EFF4FF] px-4 py-2 rounded-xl hover:bg-brand hover:text-white transition-colors"
              >
                <Download size={13} />
                Download PDF
              </a>
            )}
            <a
              href={`mailto:info@haskerrealtygroup.com?subject=Invoice ${invoice.invoice_number}`}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#6E6E73] border border-black/[0.1] bg-black/[0.03] px-4 py-2 rounded-xl hover:bg-black/[0.06] transition-colors"
            >
              <Mail size={13} />
              Email About This
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
