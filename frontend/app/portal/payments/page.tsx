"use client";

import { useCallback, useEffect, useState } from "react";
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
  allocated_items?: string[];
}

interface PaymentConfig {
  method: string;
  display_name: string;
  handle: string;
  extra_instructions: string;
  recipient_name: string;
  bank_name: string;
  account_type: string;
  account_number: string;
  routing_number: string;
  swift_bic: string;
  bank_address: string;
  recipient_address: string;
}

const STATUS_CONFIG = {
  SENT:  { label: "Due",   icon: Clock,       color: "#FF9F0A" },
  PAID:  { label: "Paid",  icon: CheckCircle, color: "#34C759" },
  VOID:  { label: "Void",  icon: AlertCircle, color: "#8E8E93" },
  DRAFT: { label: "Draft", icon: FileText,    color: "#8E8E93" },
} as const;

const METHOD_LABELS: Record<string, string> = {
  VENMO: "Venmo", PAYPAL: "PayPal", CASHAPP: "Cash App",
  CHIME: "Chime", BANK_TRANSFER: "Zelle",
};

function fmt(v: string | number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    typeof v === "string" ? parseFloat(v) : v
  );
}

function fmtDate(d: string) {
  const [year, month, day] = d.split("T")[0].split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function fmtCompact(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 10_000)    return `$${Math.round(v / 1_000)}K`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(1)}K`;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);
}

// ── Inline SVG logos ──────────────────────────────────────────────────────────
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
  VENMO: <VenmoLogo />, PAYPAL: <PayPalLogo />, CASHAPP: <CashAppLogo />,
  CHIME: <ChimeLogo />, BANK_TRANSFER: <ZelleLogo />,
};

type ModalStep = "items" | "form" | "success";

const EMPTY_BANK: Pick<PaymentConfig, "recipient_name"|"bank_name"|"account_type"|"account_number"|"routing_number"|"swift_bic"|"bank_address"|"recipient_address"> = {
  recipient_name: "", bank_name: "", account_type: "", account_number: "",
  routing_number: "", swift_bic: "", bank_address: "", recipient_address: "",
};

const FALLBACK_METHODS: PaymentConfig[] = [
  { method: "VENMO",         display_name: "Venmo",         handle: "@HaskerRealty",                  extra_instructions: "",                                            ...EMPTY_BANK },
  { method: "CASHAPP",       display_name: "Cash App",      handle: "$HaskerRealty",                  extra_instructions: "",                                            ...EMPTY_BANK },
  { method: "PAYPAL",        display_name: "PayPal",        handle: "payments@haskerrealtygroup.com", extra_instructions: "Use Friends & Family to avoid delays.",        ...EMPTY_BANK },
  { method: "CHIME",         display_name: "Chime",         handle: "@Hasker-Realty",                 extra_instructions: "",                                            ...EMPTY_BANK },
  { method: "BANK_TRANSFER", display_name: "Bank Transfer", handle: "info@haskerrealtygroup.com",     extra_instructions: "Contact us for full wire transfer details.",   ...EMPTY_BANK },
];

// ── Payment Modal ─────────────────────────────────────────────────────────────
function PaymentModal({
  invoice, paymentConfig, onClose, onSuccess,
}: {
  invoice: Invoice;
  paymentConfig: PaymentConfig[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const lineItems = invoice.line_items ?? [];
  const hasMultipleItems = lineItems.length >= 2;

  const [step, setStep] = useState<ModalStep>(hasMultipleItems ? "items" : "form");
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    () => hasMultipleItems ? new Set() : new Set(lineItems.map((_, i) => i))
  );
  const [method, setMethod] = useState<string>("VENMO");
  const [copied, setCopied] = useState<string | null>(null);
  const [refId, setRefId] = useState("");
  const [file, setProofFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const allSelected = lineItems.length > 0 && selectedIndices.size === lineItems.length;
  const selectedAmount = lineItems.length > 0
    ? lineItems.reduce((sum, item, i) => selectedIndices.has(i) ? sum + Number(item.total) : sum, 0)
    : Number(invoice.total);
  const isPartial = hasMultipleItems && selectedIndices.size > 0 && !allSelected;

  const copy = useCallback((value: string, key: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    });
  }, []);

  useEffect(() => {
    if (step !== "success") return;
    const t = setTimeout(() => { onSuccess(); onClose(); }, 2500);
    return () => clearTimeout(t);
  }, [step, onSuccess, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!refId.trim()) return setError("Enter your transaction reference (e.g. username or confirmation ID)");
    if (!file) return setError("Please upload a screenshot of your transfer");
    setLoading(true); setError("");
    try {
      const amountToPay = selectedAmount > 0 ? selectedAmount : Number(invoice.total);
      const formData = new FormData();
      formData.append("invoice", String(invoice.id));
      formData.append("amount", String(amountToPay));
      formData.append("payment_method", method);
      formData.append("reference_id", refId.trim());
      formData.append("proof_file", file);
      if (lineItems.length > 0) {
        const descriptions = lineItems
          .filter((_, i) => selectedIndices.has(i))
          .map(item => item.description);
        formData.append("allocated_items", JSON.stringify(
          descriptions.length > 0 ? descriptions : lineItems.map(item => item.description)
        ));
      }
      const res = await apiFetch(`/api/v1/transactions/my-payments/submit-proof/`, {
        method: "POST", body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data.detail ?? data.proof_file ?? (Object.values(data).flat()[0] as string) ?? "Failed to submit proof.";
        throw new Error(String(msg));
      }
      setStep("success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const methods = (paymentConfig.length > 0 ? paymentConfig : FALLBACK_METHODS);
  const current = methods.find((m) => m.method === method) ?? methods[0];
  const isBankTransfer = current.method === "BANK_TRANSFER";
  const hasBankDetails = !!(current.account_number || current.routing_number || current.recipient_name);

  const bankRows = [
    { label: "Recipient Name",            value: current.recipient_name,    key: "recipient_name" },
    { label: "Bank Name",                 value: current.bank_name,         key: "bank_name" },
    { label: "Account Type",              value: current.account_type,      key: "account_type" },
    { label: "Account Number",            value: current.account_number,    key: "account_number",  copyable: true },
    { label: "Routing Number (Wire/ABA)", value: current.routing_number,    key: "routing_number",  copyable: true },
    { label: "SWIFT / BIC Code",          value: current.swift_bic,         key: "swift_bic",       copyable: true },
    { label: "Bank Address",              value: current.bank_address,      key: "bank_address" },
    { label: "Recipient Address",         value: current.recipient_address, key: "recipient_address" },
    { label: "Zelle / Email",             value: isBankTransfer && !hasBankDetails ? current.handle : "", key: "handle", copyable: true },
  ].filter((r) => r.value);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-[#0B1F3A]/60 backdrop-blur-sm" onClick={loading ? undefined : onClose} />

      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden">
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-black/10" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-black/[0.04] flex items-center gap-3 shrink-0">
          {hasMultipleItems && step === "form" && !loading && (
            <button
              type="button"
              onClick={() => setStep("items")}
              className="w-8 h-8 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#6E6E73] hover:text-[#1D1D1F] transition-colors shrink-0"
              aria-label="Back to item selection"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-[17px] font-bold text-[#1D1D1F]">
              {step === "items" ? "Select Items to Pay" : "Submit Payment Proof"}
            </h3>
            <p className="text-[12px] text-[#6E6E73] truncate">
              {invoice.invoice_number} · {isPartial ? `Paying ${fmt(selectedAmount)} of ${fmt(invoice.total)}` : fmt(invoice.total)}
            </p>
          </div>
          {!loading && step !== "success" && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#6E6E73] hover:text-[#1D1D1F] transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          {step === "items" ? (
            /* ── Item Selector ── */
            <div className="p-5 flex flex-col min-h-full">
              {/* Title row */}
              <div className="flex items-start justify-between gap-3 mb-5">
                <div>
                  <p className="text-[12px] text-[#6E6E73] leading-relaxed">
                    Select the charges you can cover right now.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (allSelected) setSelectedIndices(new Set());
                    else setSelectedIndices(new Set(lineItems.map((_, i) => i)));
                  }}
                  className={cn(
                    "shrink-0 text-[12px] font-bold px-3 py-1.5 rounded-xl border-2 transition-all cursor-pointer",
                    allSelected
                      ? "border-[#34C759] text-[#34C759] bg-[#E6F9ED]"
                      : "border-brand text-brand bg-brand/5 hover:bg-brand/10"
                  )}
                >
                  {allSelected ? "✓ All Selected" : "Pay All"}
                </button>
              </div>

              {/* Line item cards */}
              <div className="space-y-2 flex-1">
                {lineItems.map((item, i) => {
                  const selected = selectedIndices.has(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSelectedIndices(prev => {
                          const next = new Set(prev);
                          if (next.has(i)) next.delete(i); else next.add(i);
                          return next;
                        });
                      }}
                      className={cn(
                        "w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 text-left transition-all cursor-pointer",
                        selected
                          ? "border-brand bg-brand/[0.04] shadow-sm"
                          : "border-[#E5E5EA] bg-white hover:border-[#C7C7CC]"
                      )}
                    >
                      {/* Custom circle checkbox */}
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all",
                        selected ? "border-brand bg-brand" : "border-[#C7C7CC] bg-white"
                      )}>
                        {selected && (
                          <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3" aria-hidden="true">
                            <path d="M3 8l3.5 3.5 6.5-7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>

                      {/* Description */}
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-[14px] font-semibold leading-tight truncate",
                          selected ? "text-brand" : "text-[#1D1D1F]"
                        )}>
                          {item.description}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-[11px] text-[#6E6E73] mt-0.5">× {item.quantity}</p>
                        )}
                      </div>

                      {/* Amount */}
                      <p className={cn(
                        "text-[15px] font-bold tabular-nums shrink-0",
                        selected ? "text-brand" : "text-[#1D1D1F]"
                      )}>
                        {fmt(item.total)}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Running total / CTA bar */}
              <div className="mt-5 bg-[#0B1F3A] rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className={cn(
                    "text-[13px] font-bold leading-tight",
                    selectedIndices.size > 0 ? "text-white" : "text-white/50"
                  )}>
                    {selectedIndices.size === 0
                      ? "Nothing selected yet"
                      : `${selectedIndices.size} item${selectedIndices.size !== 1 ? "s" : ""} selected`}
                  </p>
                  {selectedIndices.size > 0 && (
                    <p className="text-[11px] text-white/50 mt-0.5">
                      {allSelected ? "Full balance" : `of ${fmt(invoice.total)} total`}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  {selectedIndices.size > 0 && (
                    <p className="text-[22px] font-bold text-white tabular-nums leading-tight">
                      {fmt(selectedAmount)}
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={selectedIndices.size === 0}
                    onClick={() => setStep("form")}
                    className="mt-1.5 text-[12px] font-bold bg-white text-[#0B1F3A] px-4 py-2 rounded-xl disabled:opacity-40 transition-all hover:bg-[#F5F5F7] cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {allSelected ? "Pay Full Balance →" : "Continue with Selection →"}
                  </button>
                </div>
              </div>
            </div>
          ) : step === "success" ? (
            <div className="px-6 py-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#E6F9ED] flex items-center justify-center mb-5">
                <CheckCircle size={32} className="text-[#34C759]" strokeWidth={1.8} />
              </div>
              <h4 className="text-[18px] font-bold text-[#1D1D1F] mb-2">Proof Submitted!</h4>
              <p className="text-[13px] text-[#6E6E73] leading-relaxed max-w-xs">
                Our team will verify your payment. You&apos;ll receive an email once it&apos;s confirmed — typically within 1–2 business hours.
              </p>
              <div className="mt-6 w-full bg-[#F5F5F7] rounded-full h-1 overflow-hidden">
                <div className="h-full bg-brand animate-[shrink_2.5s_linear_forwards] rounded-full" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* ── Partial payment summary (when items were selected) ── */}
              {isPartial && (
                <div className="bg-brand/[0.05] border border-brand/20 rounded-2xl px-4 py-3.5">
                  <p className="text-[10px] font-bold text-brand uppercase tracking-[0.1em] mb-2">Paying these items</p>
                  <div className="space-y-1.5">
                    {lineItems
                      .filter((_, i) => selectedIndices.has(i))
                      .map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3">
                          <p className="text-[12px] text-[#1D1D1F] font-medium truncate">{item.description}</p>
                          <p className="text-[12px] font-bold text-[#1D1D1F] tabular-nums shrink-0">{fmt(item.total)}</p>
                        </div>
                      ))}
                  </div>
                  <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-brand/15">
                    <p className="text-[11px] font-bold text-brand">Subtotal</p>
                    <p className="text-[13px] font-bold text-brand tabular-nums">{fmt(selectedAmount)}</p>
                  </div>
                </div>
              )}

              {/* ── Method selector — full-width radio cards ── */}
              <div>
                <p className="text-[10px] font-bold text-[#6E6E73] uppercase tracking-[0.12em] mb-3">Choose payment method</p>
                <div className="space-y-2">
                  {methods.map((m) => {
                    const active = method === m.method;
                    return (
                      <button
                        key={m.method}
                        type="button"
                        onClick={() => setMethod(m.method)}
                        className={cn(
                          "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border-2 transition-all text-left",
                          active
                            ? "border-brand bg-brand/[0.04] shadow-sm"
                            : "border-[#E5E5EA] bg-white hover:border-[#C7C7CC]"
                        )}
                      >
                        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-sm">
                          {PAYMENT_LOGOS[m.method]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-[14px] font-semibold leading-tight", active ? "text-brand" : "text-[#1D1D1F]")}>
                            {m.display_name}
                          </p>
                          {(m.handle || m.recipient_name) && (
                            <p className="text-[12px] text-[#6E6E73] mt-0.5 truncate">
                              {m.handle || m.recipient_name}
                            </p>
                          )}
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all",
                          active ? "border-brand bg-brand" : "border-[#C7C7CC]"
                        )}>
                          {active && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Payment details card ── */}
              {isBankTransfer ? (
                /* Bank Transfer — dark header + stacked rows */
                <div className="rounded-2xl overflow-hidden border border-[#E5E5EA]">
                  {/* Dark header */}
                  <div className="bg-[#1A3557] px-4 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                      {PAYMENT_LOGOS["BANK_TRANSFER"]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                        {hasBankDetails ? "Wire / ACH Transfer" : current.display_name}
                      </p>
                      <p className="text-[15px] font-bold text-white leading-tight truncate">
                        {current.bank_name || "Bank Transfer"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] text-white/50 leading-none mb-0.5">Amount due</p>
                      <p className="text-[18px] font-bold text-white leading-none tabular-nums">{fmt(isPartial ? selectedAmount : invoice.total)}</p>
                    </div>
                  </div>

                  {/* Stacked rows: label on own line, value + copy pill below */}
                  {bankRows.length > 0 && (
                    <div className="bg-white divide-y divide-[#F2F2F7]">
                      {bankRows.map((row) => (
                        <div key={row.key} className="px-4 py-3.5">
                          <p className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-[0.1em] mb-1.5">
                            {row.label}
                          </p>
                          <div className="flex items-start gap-2.5">
                            <p className="flex-1 text-[14px] font-semibold text-[#1D1D1F] leading-snug break-words min-w-0">
                              {row.value}
                            </p>
                            {row.copyable && row.value && (
                              <button
                                type="button"
                                onClick={() => copy(row.value!, row.key)}
                                className={cn(
                                  "shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-lg min-w-[58px] text-center transition-all duration-150",
                                  copied === row.key
                                    ? "bg-[#D1FAE5] text-[#065F46]"
                                    : "bg-[#F0F0F5] text-[#3C3C43] hover:bg-[#E5E5EA]"
                                )}
                                aria-label={`Copy ${row.label}`}
                              >
                                {copied === row.key ? "✓ Done" : "Copy"}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Footer note */}
                  <div className="bg-[#F8F8FA] border-t border-[#E5E5EA] px-4 py-3">
                    {current.extra_instructions && (
                      <p className="text-[12px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-2 leading-relaxed">
                        {current.extra_instructions}
                      </p>
                    )}
                    <p className="text-[12px] text-[#6E6E73]">
                      Include{" "}
                      <span className="font-mono font-semibold text-[#1D1D1F] bg-white px-1.5 py-0.5 rounded border border-black/10">
                        {invoice.invoice_number}
                      </span>{" "}
                      in the memo / reference field
                    </p>
                  </div>
                </div>
              ) : (
                /* P2P — dark send-to card with break-all handle + Copy pill */
                <div className="bg-[#0B1F3A] rounded-2xl p-5 text-white">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Send to</p>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-md mt-0.5">
                      {PAYMENT_LOGOS[current.method]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[20px] font-bold tracking-tight break-all leading-snug">{current.handle}</p>
                      <p className="text-[12px] text-white/50 mt-0.5">{current.display_name}</p>
                    </div>
                    {current.handle && (
                      <button
                        type="button"
                        onClick={() => copy(current.handle, "handle")}
                        className={cn(
                          "shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all mt-0.5",
                          copied === "handle"
                            ? "bg-green-500/20 text-green-300"
                            : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
                        )}
                      >
                        {copied === "handle" ? "Copied!" : "Copy"}
                      </button>
                    )}
                  </div>
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <p className="text-[12px] text-white/50">Amount due</p>
                    <p className="text-[20px] font-bold tabular-nums">{fmt(isPartial ? selectedAmount : invoice.total)}</p>
                  </div>
                  {current.extra_instructions && (
                    <p className="text-[12px] text-white/40 mt-3 leading-relaxed">{current.extra_instructions}</p>
                  )}
                  <p className="text-[12px] text-white/30 mt-2">
                    Include{" "}
                    <span className="font-mono font-semibold text-white/60 bg-white/10 px-1.5 py-0.5 rounded">
                      {invoice.invoice_number}
                    </span>{" "}
                    in the note
                  </p>
                </div>
              )}

              {/* Reference field */}
              <div>
                <label className="block text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wide mb-1.5 px-1">
                  {isBankTransfer ? "Transaction / Confirmation ID *" : `Your ${current.display_name} username / ref *`}
                </label>
                <input
                  value={refId}
                  onChange={(e) => setRefId(e.target.value)}
                  placeholder={
                    method === "CASHAPP"       ? "$Cashtag" :
                    method === "VENMO"         ? "@Username" :
                    method === "BANK_TRANSFER" ? "e.g. Wire confirmation number" :
                    "Confirmation ID or Email"
                  }
                  className="w-full rounded-xl bg-[#F5F5F7] px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white border border-transparent transition-all"
                />
              </div>

              {/* File upload */}
              <div>
                <label className="block text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wide mb-1.5 px-1">
                  Receipt screenshot *
                </label>
                <label className={cn(
                  "flex items-center justify-center gap-3 w-full py-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer",
                  file ? "border-brand bg-brand/5" : "border-black/10 bg-[#F5F5F7] hover:border-black/20"
                )}>
                  <input type="file" accept="image/*" className="sr-only"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)} />
                  {file ? (
                    <>
                      <CheckCircle size={18} className="text-brand shrink-0" />
                      <div>
                        <p className="text-[13px] font-semibold text-brand truncate max-w-[200px]">{file.name}</p>
                        <p className="text-[10px] text-brand/60">{(file.size / 1024 / 1024).toFixed(1)} MB · tap to change</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Camera size={20} className="text-[#6E6E73] opacity-50 shrink-0" />
                      <div>
                        <p className="text-[13px] font-medium text-[#6E6E73]">Upload receipt screenshot</p>
                        <p className="text-[11px] text-[#6E6E73] opacity-60">PNG, JPG — up to 10 MB</p>
                      </div>
                    </>
                  )}
                </label>
              </div>

              {error && (
                <p className="text-[12px] text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>
              )}

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-brand text-white font-bold py-4 rounded-2xl hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Uploading…</span></>
                ) : "Submit Proof of Payment"}
              </button>

              <div className="flex items-center gap-2 justify-center text-[#6E6E73] pb-2">
                <Shield size={12} />
                <p className="text-[11px]">Verification takes 1–2 business hours</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── PaymentRow ─────────────────────────────────────────────────────────────────
function PaymentRow({ payment: pay }: { payment: Payment }) {
  const isVerified = pay.status === "VERIFIED" || pay.status === "SUCCESSFUL";
  const isRejected = pay.status === "REJECTED" || pay.status === "FAILED";
  const logo = PAYMENT_LOGOS[pay.payment_method];
  const label = METHOD_LABELS[pay.payment_method] ?? pay.payment_method;

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0">
        {logo ?? (
          <div className="w-full h-full bg-[#F5F5F7] flex items-center justify-center">
            <CreditCard size={16} className="text-[#6E6E73]" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[13px] font-semibold text-[#1D1D1F]">{label}</p>
          {!isVerified && (
            <span className={cn(
              "text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide shrink-0",
              isRejected ? "bg-[#FFEEEE] text-[#FF3B30]" : "bg-[#FFF3DC] text-[#FF9F0A]"
            )}>
              {pay.status === "PENDING_VERIFICATION" ? "Reviewing" : pay.status}
            </span>
          )}
        </div>
        <p className="text-[11px] text-[#6E6E73]">{fmtDate(pay.created_at)}</p>
      </div>
      <p className={cn("text-[13px] sm:text-[15px] font-bold tabular-nums shrink-0", isVerified ? "text-[#34C759]" : "text-[#1D1D1F]")}>
        {fmt(pay.amount)}
      </p>
    </div>
  );
}

// ── InvoiceCard ────────────────────────────────────────────────────────────────
function InvoiceCard({
  invoice, expanded, onToggle, onPay, hasPendingPayment,
}: {
  invoice: Invoice;
  expanded: boolean;
  onToggle: () => void;
  onPay: (inv: Invoice) => void;
  hasPendingPayment: boolean;
}) {
  const cfg = STATUS_CONFIG[invoice.status] ?? STATUS_CONFIG.SENT;
  const StatusIcon = cfg.icon;
  const overdue = invoice.status === "SENT" && new Date(invoice.due_date) < new Date();
  const accentColor = invoice.status === "PAID" ? "#34C759" : overdue ? "#FF3B30" : cfg.color;

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="flex">
        {/* Status stripe */}
        <div className="w-1 shrink-0 rounded-l-2xl" style={{ backgroundColor: accentColor }} />
        <div className="flex-1 min-w-0">
          <button
            onClick={onToggle}
            className="w-full px-4 py-4 flex items-center gap-3 text-left hover:bg-black/[0.01] transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: accentColor + "1A" }}>
              <StatusIcon size={16} style={{ color: accentColor }} strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] font-bold text-[#1D1D1F]">{invoice.invoice_number}</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                  style={{ backgroundColor: accentColor + "1A", color: accentColor }}>
                  {overdue ? "Overdue" : cfg.label}
                </span>
              </div>
              <p className="text-[12px] text-[#6E6E73] mt-0.5 truncate">
                {invoice.title || invoice.property_title || "Invoice"}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 max-w-[42%] sm:max-w-none">
              <div className="text-right min-w-0">
                <p className="text-[13px] sm:text-[15px] font-bold text-[#1D1D1F] tabular-nums">{fmt(invoice.total)}</p>
                <p className="text-[10px] text-[#6E6E73] whitespace-nowrap">due {fmtDate(invoice.due_date)}</p>
              </div>
              <ChevronDown
                size={14}
                className={cn("text-[#C7C7CC] transition-transform duration-200 shrink-0", expanded && "rotate-180")}
                strokeWidth={2.5}
              />
            </div>
          </button>

          {expanded && (
            <div className="border-t border-black/[0.04] px-4 py-5">
              {invoice.description && (
                <div className="mb-4 bg-[#F5F5F7] p-4 rounded-xl">
                  <p className="text-[10px] font-bold text-[#6E6E73] uppercase tracking-widest mb-1.5">Description</p>
                  <p className="text-[13px] text-[#475569] leading-relaxed whitespace-pre-line">{invoice.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                {[
                  { label: "Issued",   value: fmtDate(invoice.issued_date), danger: false },
                  { label: "Due",      value: fmtDate(invoice.due_date),    danger: overdue },
                  { label: "Property", value: invoice.property_title || "General", danger: false },
                  { label: "Type",     value: invoice.transaction_type?.toLowerCase() || "billing", danger: false },
                ].map(({ label, value, danger }) => (
                  <div key={label}>
                    <p className="text-[10px] text-[#6E6E73] font-medium uppercase tracking-wide mb-1">{label}</p>
                    <p className={cn("text-[13px] font-semibold capitalize", danger ? "text-[#FF3B30]" : "text-[#1D1D1F]")}>{value}</p>
                  </div>
                ))}
              </div>

              {invoice.line_items?.length > 0 && (
                <div className="rounded-xl bg-[#F5F5F7] overflow-hidden mb-4 overflow-x-auto">
                  <table className="w-full text-[13px] min-w-[280px]">
                    <thead>
                      <tr className="border-b border-black/[0.06]">
                        <th className="text-left px-4 py-2.5 text-[10px] font-bold text-[#6E6E73] uppercase tracking-wide">Description</th>
                        <th className="text-right px-4 py-2.5 text-[10px] font-bold text-[#6E6E73] uppercase tracking-wide">Amount</th>
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
                        <td className="px-4 py-3 font-bold text-[#1D1D1F]">Total</td>
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
                      <Clock size={13} /> Proof Under Review
                    </span>
                  ) : (
                    <button
                      onClick={() => onPay(invoice)}
                      className="inline-flex items-center gap-1.5 text-[13px] font-bold text-white bg-brand px-5 py-2.5 rounded-xl hover:bg-brand-hover transition-colors shadow-sm"
                    >
                      <CreditCard size={13} /> Pay Now
                    </button>
                  )
                )}
                {invoice.pdf && (
                  <a
                    href={invoice.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand border border-brand/20 bg-[#EFF4FF] px-4 py-2.5 rounded-xl hover:bg-brand hover:text-white transition-colors"
                  >
                    <Download size={13} /> PDF
                  </a>
                )}
                <a
                  href={`mailto:info@haskerrealtygroup.com?subject=Invoice ${invoice.invoice_number}`}
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#6E6E73] border border-black/[0.1] bg-[#F5F5F7] px-4 py-2.5 rounded-xl hover:bg-black/[0.06] transition-colors"
                >
                  <Mail size={13} /> Contact
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
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
  const totalOutstanding = pending.reduce((s, i) => s + parseFloat(i.total || "0"), 0);
  const totalPaid = paid.reduce((s, i) => s + parseFloat(i.total || "0"), 0);

  const pendingInvoiceIds = new Set(
    payments.filter((p) => p.status === "PENDING_VERIFICATION" && p.invoice != null).map((p) => p.invoice as number)
  );

  const hasData = invoices.length > 0 || payments.length > 0;

  return (
    <div className="min-h-screen bg-[#F5F5F7] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto space-y-5">

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
        <div className="flex items-center gap-3">
          <Link
            href="/portal/profile"
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-[#6E6E73] hover:text-[#1D1D1F] transition-colors shrink-0"
          >
            <ArrowLeft size={16} strokeWidth={2} />
          </Link>
          <div>
            <h1 className="text-[20px] font-bold tracking-tight text-[#1D1D1F]">Invoices & Payments</h1>
            <p className="text-[12px] text-[#6E6E73]">Issued by your property manager</p>
          </div>
        </div>

        {/* Stats row — only shown when data exists */}
        {!loading && !loadError && hasData && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-white rounded-2xl p-3 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
              <p className="text-[9px] sm:text-[10px] font-bold text-[#6E6E73] uppercase tracking-widest mb-1 sm:mb-2 truncate">Due</p>
              <p className={cn(
                "text-[17px] sm:text-[22px] font-bold leading-tight tabular-nums",
                totalOutstanding > 0 ? "text-[#FF9F0A]" : "text-[#34C759]"
              )}>
                {fmtCompact(totalOutstanding)}
              </p>
              <p className="text-[10px] text-[#6E6E73] mt-0.5 sm:mt-1">
                {pending.length} inv.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-3 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
              <p className="text-[9px] sm:text-[10px] font-bold text-[#6E6E73] uppercase tracking-widest mb-1 sm:mb-2 truncate">Paid</p>
              <p className="text-[17px] sm:text-[22px] font-bold text-[#34C759] leading-tight tabular-nums">{fmtCompact(totalPaid)}</p>
              <p className="text-[10px] text-[#6E6E73] mt-0.5 sm:mt-1">
                {paid.length} inv.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-3 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
              <p className="text-[9px] sm:text-[10px] font-bold text-[#6E6E73] uppercase tracking-widest mb-1 sm:mb-2 truncate">Payments</p>
              <p className="text-[17px] sm:text-[22px] font-bold text-[#1D1D1F] leading-tight tabular-nums">{payments.length}</p>
              <p className="text-[10px] text-[#6E6E73] mt-0.5 sm:mt-1">submitted</p>
            </div>
          </div>
        )}

        {/* Info bar */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] px-4 py-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#EFF4FF] flex items-center justify-center shrink-0">
            <Building2 size={15} className="text-brand" strokeWidth={1.8} />
          </div>
          <p className="text-[12px] text-[#6E6E73] flex-1 leading-relaxed">
            Pay via your preferred method using the invoice number as the reference, then submit proof below for manual verification.
          </p>
          <a
            href="mailto:info@haskerrealtygroup.com"
            className="flex items-center gap-1 text-[12px] font-semibold text-brand hover:underline shrink-0"
          >
            <Mail size={12} /> Help
          </a>
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
            <h2 className="text-[15px] font-semibold text-[#1D1D1F] mb-2">Could not load payment data</h2>
            <p className="text-[13px] text-[#6E6E73] max-w-xs leading-relaxed mb-5">
              Check your connection and try again.
            </p>
            <button onClick={fetchData} className="bg-brand text-white text-[12px] font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-hover transition-colors">
              Retry
            </button>
          </div>
        ) : !hasData ? (
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] py-14 flex flex-col items-center text-center px-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/illustrations/spot-tag.png" alt="" width={88} height={88} className="mb-4 opacity-90" />
            <h2 className="text-[15px] font-semibold text-[#1D1D1F] mb-2">No invoices yet</h2>
            <p className="text-[13px] text-[#6E6E73] max-w-xs leading-relaxed">
              When an invoice is issued by your property manager, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {pending.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#6E6E73]">
                    Outstanding ({pending.length})
                  </p>
                  <span className="text-[10px] font-bold bg-[#FF9F0A]/10 text-[#FF9F0A] px-2 py-0.5 rounded-full">
                    Action Required
                  </span>
                </div>
                <div className="space-y-2">
                  {pending.map((inv) => (
                    <InvoiceCard
                      key={inv.id} invoice={inv}
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
                <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#6E6E73] mb-3 px-1">
                  Invoice History ({paid.length})
                </p>
                <div className="space-y-2">
                  {paid.map((inv) => (
                    <InvoiceCard
                      key={inv.id} invoice={inv}
                      expanded={expanded === inv.id}
                      onToggle={() => setExpanded(expanded === inv.id ? null : inv.id)}
                      onPay={(i) => setSelectedInvoice(i)}
                      hasPendingPayment={false}
                    />
                  ))}
                </div>
              </section>
            )}

            {payments.length > 0 && (
              <section>
                <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#6E6E73] mb-3 px-1">
                  My Payments ({payments.length})
                </p>
                <div className="space-y-2">
                  {payments.map((pay) => <PaymentRow key={pay.id} payment={pay} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
