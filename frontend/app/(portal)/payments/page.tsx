"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText, CheckCircle, Clock, AlertCircle,
  ArrowLeft, Download, Mail, Building2, ChevronDown,
} from "lucide-react";
import { apiFetch } from "@/lib/auth";
import { cn } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Invoice {
  id: number;
  invoice_number: string;
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

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    apiFetch(`${API_BASE}/api/v1/transactions/my-invoices/`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setInvoices(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pending = invoices.filter((i) => i.status === "SENT");
  const paid = invoices.filter((i) => i.status === "PAID");

  return (
    <div className="min-h-screen bg-[#F5F5F7] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-3xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3 px-1">
          <Link
            href="/portal/dashboard"
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
        ) : invoices.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] py-16 flex flex-col items-center text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-[#F5F5F7] flex items-center justify-center mb-4">
              <FileText size={26} className="text-[#C7C7CC]" strokeWidth={1.5} />
            </div>
            <h2 className="text-[15px] font-semibold text-[#1D1D1F] tracking-tight mb-2">
              No invoices yet
            </h2>
            <p className="text-[13px] text-[#6E6E73] max-w-xs leading-relaxed">
              When your property manager sends an invoice it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {pending.length > 0 && (
              <section>
                <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6E6E73] px-1 mb-2">
                  Outstanding ({pending.length})
                </p>
                <div className="space-y-2">
                  {pending.map((inv) => (
                    <InvoiceCard
                      key={inv.id}
                      invoice={inv}
                      expanded={expanded === inv.id}
                      onToggle={() => setExpanded(expanded === inv.id ? null : inv.id)}
                    />
                  ))}
                </div>
              </section>
            )}
            {paid.length > 0 && (
              <section>
                <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6E6E73] px-1 mb-2">
                  History ({paid.length})
                </p>
                <div className="space-y-2">
                  {paid.map((inv) => (
                    <InvoiceCard
                      key={inv.id}
                      invoice={inv}
                      expanded={expanded === inv.id}
                      onToggle={() => setExpanded(expanded === inv.id ? null : inv.id)}
                    />
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

function InvoiceCard({
  invoice,
  expanded,
  onToggle,
}: {
  invoice: Invoice;
  expanded: boolean;
  onToggle: () => void;
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
        {/* Status icon */}
        <div className="shrink-0 w-9 h-9 rounded-xl bg-[#F5F5F7] flex items-center justify-center">
          <StatusIcon size={16} className={cfg.text} strokeWidth={1.8} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-semibold text-[#1D1D1F]">
              {invoice.invoice_number}
            </span>
            <span className={cn(
              "text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#F5F5F7]",
              overdue ? "text-[#FF3B30]" : cfg.text
            )}>
              {overdue ? "Overdue" : cfg.label}
            </span>
          </div>
          <p className="text-[12px] text-[#6E6E73] mt-0.5 truncate">{invoice.property_title}</p>
        </div>

        {/* Amount + chevron */}
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

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-black/[0.04] px-5 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            {[
              { label: "Issued", value: fmtDate(invoice.issued_date), danger: false },
              { label: "Due Date", value: fmtDate(invoice.due_date), danger: overdue },
              { label: "Property", value: invoice.property_title, danger: false },
              { label: "Type", value: invoice.transaction_type?.toLowerCase(), danger: false },
            ].map(({ label, value, danger }) => (
              <div key={label}>
                <p className="text-[11px] text-[#6E6E73] font-medium uppercase tracking-wide mb-1">
                  {label}
                </p>
                <p className={cn(
                  "text-[13px] font-semibold",
                  danger ? "text-[#FF3B30]" : "text-[#1D1D1F]"
                )}>
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
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wide">
                      Description
                    </th>
                    <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wide">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.line_items.map((item, i) => (
                    <tr key={i} className="border-b border-black/[0.04] last:border-0">
                      <td className="px-4 py-3 text-[#1D1D1F]">{item.description}</td>
                      <td className="px-4 py-3 text-right font-semibold text-[#1D1D1F]">
                        {fmt(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-black/[0.08]">
                  <tr>
                    <td className="px-4 py-3 font-semibold text-[#1D1D1F]">Total</td>
                    <td className="px-4 py-3 text-right text-[15px] font-bold text-[#1D1D1F]">
                      {fmt(invoice.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
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
