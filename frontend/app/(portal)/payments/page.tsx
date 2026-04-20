"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText, CheckCircle, Clock, AlertCircle,
  ArrowLeft, Download, Mail, Building2,
} from "lucide-react";
import { apiFetch } from "@/lib/auth";

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

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  SENT: { label: "Payment Due", icon: Clock, color: "text-amber-700", bg: "bg-amber-50" },
  PAID: { label: "Paid", icon: CheckCircle, color: "text-green-700", bg: "bg-green-50" },
  VOID: { label: "Voided", icon: AlertCircle, color: "text-neutral-500", bg: "bg-neutral-50" },
  DRAFT: { label: "Draft", icon: FileText, color: "text-neutral-500", bg: "bg-neutral-50" },
};

function fmt(amount: string | number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    typeof amount === "string" ? parseFloat(amount) : amount
  );
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
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
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/portal/dashboard" className="text-neutral-400 hover:text-brand transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-bold text-brand-dark">Invoices & Payments</h1>
          <p className="text-sm text-neutral-500">Invoices sent by your property manager</p>
        </div>
      </div>

      {/* Payment instructions banner */}
      <div className="bg-brand-light border border-brand-muted rounded-lg p-5 mb-8 flex flex-col sm:flex-row gap-4 items-start">
        <div className="shrink-0 w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
          <Building2 size={18} className="text-brand" />
        </div>
        <div>
          <p className="font-semibold text-brand-dark mb-1">How to pay your invoice</p>
          <p className="text-sm text-neutral-600 leading-relaxed">
            When an invoice is issued, you&apos;ll receive an email with full payment instructions —
            bank account details, check payable info, and your reference number.
            Use the invoice number as your payment reference.
          </p>
          <a
            href="mailto:info@haskerrealtygroup.com"
            className="inline-flex items-center gap-1.5 text-sm text-brand font-medium mt-2 hover:underline"
          >
            <Mail size={13} />
            Questions? Email info@haskerrealtygroup.com
          </a>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-neutral-100 rounded-lg" />)}
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center shadow-sm">
          <FileText size={40} className="text-neutral-200 mx-auto mb-4" />
          <h2 className="font-serif text-xl font-bold text-brand-dark mb-2">No invoices yet</h2>
          <p className="text-sm text-neutral-500 max-w-xs mx-auto">
            When your property manager sends an invoice, it will appear here with payment instructions.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending invoices */}
          {pending.length > 0 && (
            <section>
              <h2 className="font-semibold text-brand-dark mb-3 text-sm uppercase tracking-wider">
                Outstanding ({pending.length})
              </h2>
              <div className="space-y-3">
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

          {/* Paid invoices */}
          {paid.length > 0 && (
            <section>
              <h2 className="font-semibold text-brand-dark mb-3 text-sm uppercase tracking-wider">
                Payment History ({paid.length})
              </h2>
              <div className="space-y-3">
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
  const cfg = STATUS_CONFIG[invoice.status] ?? STATUS_CONFIG.SENT;
  const StatusIcon = cfg.icon;
  const isOverdue =
    invoice.status === "SENT" && new Date(invoice.due_date) < new Date();

  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-neutral-50 transition-colors"
      >
        <div className={`shrink-0 w-9 h-9 rounded-full ${cfg.bg} flex items-center justify-center`}>
          <StatusIcon size={16} className={cfg.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-brand-dark text-sm">{invoice.invoice_number}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
              {isOverdue ? "Overdue" : cfg.label}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5 truncate">{invoice.property_title}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-serif font-bold text-brand-dark">{fmt(invoice.total)}</p>
          <p className="text-xs text-neutral-400">Due {fmtDate(invoice.due_date)}</p>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-neutral-100 px-6 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wide mb-0.5">Issued</p>
              <p className="text-sm font-medium text-brand-dark">{fmtDate(invoice.issued_date)}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wide mb-0.5">Due Date</p>
              <p className={`text-sm font-medium ${isOverdue ? "text-red-600" : "text-brand-dark"}`}>
                {fmtDate(invoice.due_date)}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wide mb-0.5">Property</p>
              <p className="text-sm font-medium text-brand-dark">{invoice.property_title}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wide mb-0.5">Type</p>
              <p className="text-sm font-medium text-brand-dark capitalize">
                {invoice.transaction_type?.toLowerCase()}
              </p>
            </div>
          </div>

          {/* Line items */}
          {invoice.line_items?.length > 0 && (
            <div className="border border-neutral-100 rounded-md overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Description</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {invoice.line_items.map((item, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2 text-neutral-700">{item.description}</td>
                      <td className="px-4 py-2 text-right font-medium text-brand-dark">{fmt(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-neutral-50 border-t border-neutral-200">
                  <tr>
                    <td className="px-4 py-2 font-semibold text-brand-dark">Total Due</td>
                    <td className="px-4 py-2 text-right font-bold text-brand-dark font-serif text-base">{fmt(invoice.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {invoice.pdf && (
              <a
                href={invoice.pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-brand border border-brand px-4 py-2 rounded-md hover:bg-brand hover:text-white transition-colors"
              >
                <Download size={14} />
                Download PDF
              </a>
            )}
            <a
              href={`mailto:info@haskerrealtygroup.com?subject=Invoice ${invoice.invoice_number}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 border border-neutral-200 px-4 py-2 rounded-md hover:border-brand hover:text-brand transition-colors"
            >
              <Mail size={14} />
              Email About This Invoice
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
