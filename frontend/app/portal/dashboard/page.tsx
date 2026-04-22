"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home, CreditCard, AlertCircle, CheckCircle, ArrowRight,
  MapPin, Clock, Download, Wrench, Search,
  FileText, ChevronRight, Building2, Mail, Wallet,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/auth";
import { cn } from "@/lib/utils";

const API_BASE = "";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Transaction {
  id: number;
  transaction_type: "RENT" | "SALE" | "LEASE";
  agreed_price: string;
  status: "PENDING" | "DEPOSIT_PAID" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  created_at: string;
  property: { title: string; address: string; city: string; state: string };
}

interface Invoice {
  id: number;
  invoice_number: string;
  issued_date: string;
  due_date: string;
  total: string;
  status: "SENT" | "PAID" | "DRAFT" | "VOID";
  pdf: string | null;
  property_title: string;
  transaction_type: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function greeting(name: string) {
  const h = new Date().getHours();
  const tod = h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
  return `Good ${tod}, ${name}`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function fmtMoney(v: string | number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 0,
  }).format(typeof v === "string" ? parseFloat(v) : v);
}

function isOverdue(dueDate: string) {
  return new Date(dueDate) < new Date();
}

function todayFormatted() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

function txLabel(type: string) {
  return type === "RENT" ? "Rental" : type === "SALE" ? "Purchase" : "Lease";
}

function statusLabel(s: string) {
  const m: Record<string, string> = {
    PENDING: "Pending", DEPOSIT_PAID: "Deposit Paid",
    IN_PROGRESS: "Active", COMPLETED: "Completed", CANCELLED: "Cancelled",
  };
  return m[s] ?? s;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-2xl bg-black/[0.04]", className)} />
  );
}

// ── Apple Card Shell ──────────────────────────────────────────────────────────

function Card({
  className,
  children,
  href,
}: {
  className?: string;
  children: React.ReactNode;
  href?: string;
}) {
  const base = cn(
    "bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)]",
    href && "cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.10)] hover:scale-[1.01] transition-all duration-200",
    className
  );
  if (href) {
    return (
      <Link href={href} className={base}>
        {children}
      </Link>
    );
  }
  return <div className={base}>{children}</div>;
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch(`${API_BASE}/api/v1/transactions/`).then((r) => (r.ok ? r.json() : null)),
      apiFetch(`${API_BASE}/api/v1/transactions/my-invoices/`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([txData, invData]) => {
        setTransactions(txData?.results ?? (Array.isArray(txData) ? txData : []));
        setInvoices(Array.isArray(invData) ? invData : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const active = transactions.find((t) =>
    ["IN_PROGRESS", "DEPOSIT_PAID", "PENDING"].includes(t.status)
  );
  const outstanding = invoices
    .filter((i) => i.status === "SENT")
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  const recentPaid = invoices.filter((i) => i.status === "PAID").slice(0, 3);
  const totalOutstanding = outstanding.reduce((s, i) => s + parseFloat(i.total), 0);

  return (
    <div className="min-h-screen bg-[#F5F5F7] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-5xl mx-auto space-y-3">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 px-1 pb-2">
          <div>
            <h1 className="text-[22px] sm:text-[26px] font-semibold tracking-tight text-[#1D1D1F] leading-tight">
              {greeting(user?.first_name ?? "there")}
            </h1>
            <p className="text-[13px] text-[#6E6E73] mt-0.5">{todayFormatted()}</p>
          </div>
          <Link
            href="/portal/profile"
            className="shrink-0 w-9 h-9 rounded-full bg-brand flex items-center justify-center text-white text-[13px] font-semibold select-none shadow-sm hover:opacity-80 transition-opacity"
          >
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </Link>
        </div>

        {/* ── KPI Widgets ───────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-[88px]" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiWidget
              icon={Home}
              label="Property"
              value={active ? active.property.city : "None"}
              sub={active?.property.state ?? "No lease yet"}
              color="blue"
            />
            <KpiWidget
              icon={Wallet}
              label="Monthly Rent"
              value={active ? fmtMoney(active.agreed_price) : "—"}
              sub={active ? txLabel(active.transaction_type) : "No active lease"}
              color="blue"
            />
            <KpiWidget
              icon={AlertCircle}
              label="Outstanding"
              value={outstanding.length > 0 ? fmtMoney(totalOutstanding) : "Clear"}
              sub={outstanding.length > 0 ? `${outstanding.length} due` : "All settled"}
              color={outstanding.length > 0 ? "amber" : "green"}
            />
            <KpiWidget
              icon={CheckCircle}
              label="Paid"
              value={String(invoices.filter((i) => i.status === "PAID").length)}
              sub="Invoices paid"
              color="green"
            />
          </div>
        )}

        {/* ── Bento Grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">

          {/* Active Lease — spans 2 cols */}
          <div className="lg:col-span-2">
            {loading ? (
              <Skeleton className="h-80" />
            ) : active ? (
              <LeaseCard transaction={active} />
            ) : (
              <NoLeaseCard />
            )}
          </div>

          {/* Right column */}
          <div className="lg:col-span-3 space-y-3">

            {/* Outstanding invoices */}
            {loading ? (
              <Skeleton className="h-48" />
            ) : (
              <Card>
                <PanelHeader
                  title="Outstanding"
                  badge={outstanding.length > 0 ? String(outstanding.length) : undefined}
                  badgeColor="amber"
                  href="/portal/payments"
                  linkLabel="See all"
                />
                {outstanding.length === 0 ? (
                  <div className="px-5 pb-5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#F5F5F7] flex items-center justify-center shrink-0">
                      <CheckCircle size={15} className="text-[#34C759]" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#1D1D1F]">All paid up</p>
                      <p className="text-[12px] text-[#6E6E73]">No outstanding invoices.</p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-black/[0.04] px-2">
                    {outstanding.slice(0, 3).map((inv) => (
                      <InvoiceRow key={inv.id} invoice={inv} />
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* Recent payments */}
            {loading ? (
              <Skeleton className="h-36" />
            ) : (
              <Card>
                <PanelHeader
                  title="Recent Payments"
                  href="/portal/payments"
                  linkLabel="History"
                />
                {recentPaid.length === 0 ? (
                  <p className="px-5 pb-5 text-[13px] text-[#6E6E73]">No payments recorded yet.</p>
                ) : (
                  <div className="divide-y divide-black/[0.04] px-2">
                    {recentPaid.map((inv) => (
                      <PaymentRow key={inv.id} invoice={inv} />
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>

        {/* ── Quick Actions Bento ────────────────────────────────────────── */}
        <div>
          <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6E6E73] px-1 mb-2">
            Quick Actions
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: CreditCard, label: "Payments",     desc: "Invoices & billing",  href: "/portal/payments" },
              { icon: FileText,   label: "Documents",    desc: "Agreements & files",  href: "/portal/documents" },
              { icon: Wrench,     label: "Maintenance",  desc: "Submit a request",    href: "/portal/maintenance" },
              { icon: Search,     label: "Browse Homes", desc: "Find properties",     href: "/properties" },
            ].map(({ icon: Icon, label, desc, href }) => (
              <Card key={label} href={href} className="p-4 group">
                <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center mb-3">
                  <Icon size={17} className="text-[#3C3C43]" strokeWidth={1.8} />
                </div>
                <p className="text-[13px] font-semibold text-[#1D1D1F] leading-snug group-hover:text-brand transition-colors">
                  {label}
                </p>
                <p className="text-[11px] text-[#6E6E73] mt-0.5 leading-snug">{desc}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* ── Support Strip ──────────────────────────────────────────────── */}
        <Card className="overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 py-5">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#0B1F3A] flex items-center justify-center shrink-0">
                <Building2 size={17} className="text-white" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#1D1D1F] tracking-tight">
                  Hasker &amp; Co. Realty Group
                </p>
                <p className="text-[12px] text-[#6E6E73]">Your dedicated property management team</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <a
                href="mailto:info@haskerrealtygroup.com"
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#6E6E73] border border-black/[0.1] bg-black/[0.03] px-3.5 py-2 rounded-xl hover:bg-black/[0.06] transition-colors"
              >
                <Mail size={12} />
                Email Us
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white bg-brand px-3.5 py-2 rounded-xl hover:bg-brand-hover transition-colors"
              >
                Get Support
              </Link>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}

// ── KPI Widget ────────────────────────────────────────────────────────────────

function KpiWidget({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  color: "blue" | "green" | "amber";
}) {
  // Only the value text changes color — icon container stays neutral
  const valueColor = {
    blue:  "text-[#1D1D1F]",
    green: "text-[#1D1D1F]",
    amber: "text-[#FF9F0A]",
  }[color];

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] px-4 py-4 flex items-start gap-3">
      <div className="w-8 h-8 rounded-xl bg-[#F5F5F7] flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={15} className="text-[#3C3C43]" strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-[#6E6E73] leading-none mb-1.5 truncate">{label}</p>
        <p className={cn("text-[17px] font-semibold tracking-tight leading-none truncate", valueColor)}>
          {value}
        </p>
        <p className="text-[11px] text-[#6E6E73] mt-1 truncate leading-snug">{sub}</p>
      </div>
    </div>
  );
}

// ── Lease Card ────────────────────────────────────────────────────────────────

function LeaseCard({ transaction: t }: { transaction: Transaction }) {
  const statusColor: Record<string, string> = {
    IN_PROGRESS:  "text-[#34C759] bg-[#34C759]/10",
    DEPOSIT_PAID: "text-brand bg-brand/10",
    PENDING:      "text-[#FF9F0A] bg-[#FF9F0A]/10",
  };
  const sc = statusColor[t.status] ?? "text-[#6E6E73] bg-black/[0.06]";

  return (
    <div className="h-full rounded-2xl bg-[#0B1F3A] overflow-hidden flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
      {/* Gradient accent */}
      <div className="h-0.5 bg-gradient-to-r from-brand via-blue-400 to-blue-600" />

      <div className="flex-1 p-5 flex flex-col gap-4">

        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-white/[0.08] text-white/60 uppercase tracking-wider">
            {txLabel(t.transaction_type)}
          </span>
          <span className={cn("text-[10px] font-semibold px-2 py-1 rounded-lg", sc)}>
            {statusLabel(t.status)}
          </span>
        </div>

        {/* Property name */}
        <div>
          <h2 className="text-[17px] font-semibold text-white tracking-tight leading-snug">
            {t.property.title}
          </h2>
          <p className="text-[12px] text-white/40 mt-1.5 flex items-center gap-1">
            <MapPin size={11} className="shrink-0" />
            {t.property.address}, {t.property.city}, {t.property.state}
          </p>
        </div>

        {/* Price block */}
        <div className="rounded-xl bg-white/[0.06] border border-white/[0.07] px-4 py-3.5">
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium mb-1">
            {t.transaction_type === "RENT" ? "Monthly Rent" : "Agreed Price"}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-[28px] font-bold text-white tracking-tight leading-none">
              {fmtMoney(t.agreed_price)}
            </span>
            {t.transaction_type === "RENT" && (
              <span className="text-[13px] text-white/40 font-medium">/mo</span>
            )}
          </div>
        </div>

        {/* Since */}
        <div className="flex items-center gap-1.5 text-[12px] text-white/30">
          <Clock size={11} className="shrink-0" />
          Member since {fmtDate(t.created_at)}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-2 mt-auto">
          <Link
            href="/portal/payments"
            className="flex-1 flex items-center justify-center gap-1.5 bg-brand text-white text-[12px] font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-hover transition-colors"
          >
            <CreditCard size={13} strokeWidth={2} />
            View Invoices
            <ArrowRight size={12} strokeWidth={2} />
          </Link>
          <a
            href="mailto:info@haskerrealtygroup.com"
            className="flex-1 flex items-center justify-center gap-1.5 bg-white/[0.08] text-white text-[12px] font-semibold px-4 py-2.5 rounded-xl hover:bg-white/[0.14] transition-colors border border-white/[0.07]"
          >
            <Mail size={13} strokeWidth={2} />
            Contact
          </a>
        </div>
      </div>
    </div>
  );
}

// ── No Lease Card ─────────────────────────────────────────────────────────────

function NoLeaseCard() {
  return (
    <div className="h-full min-h-[280px] bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6 flex flex-col items-center justify-center text-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-[#F5F5F7] flex items-center justify-center">
        <Home size={24} className="text-[#3C3C43]" strokeWidth={1.6} />
      </div>
      <div>
        <h2 className="text-[15px] font-semibold text-[#1D1D1F] tracking-tight mb-1.5">
          No active lease yet
        </h2>
        <p className="text-[12px] text-[#6E6E73] leading-relaxed max-w-[210px] mx-auto">
          Once our team links your tenancy, everything will appear here.
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <Link
          href="/properties"
          className="flex items-center justify-center gap-1.5 bg-brand text-white text-[12px] font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-hover transition-colors"
        >
          <Search size={13} strokeWidth={2} />
          Browse Available Homes
        </Link>
        <a
          href="mailto:info@haskerrealtygroup.com"
          className="flex items-center justify-center gap-1.5 text-[12px] font-semibold text-[#6E6E73] border border-black/[0.1] bg-black/[0.02] px-4 py-2.5 rounded-xl hover:bg-black/[0.04] transition-colors"
        >
          <Mail size={13} strokeWidth={2} />
          Contact Our Team
        </a>
      </div>
    </div>
  );
}

// ── Panel Header ──────────────────────────────────────────────────────────────

function PanelHeader({
  title,
  badge,
  badgeColor = "blue",
  href,
  linkLabel,
}: {
  title: string;
  badge?: string;
  badgeColor?: "amber" | "blue" | "green";
  href: string;
  linkLabel: string;
}) {
  const bc = {
    amber: "bg-[#FFF3DC] text-[#FF9F0A]",
    blue:  "bg-[#EFF4FF] text-brand",
    green: "bg-[#EDFFF4] text-[#34C759]",
  }[badgeColor];

  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div className="flex items-center gap-2">
        <span className="text-[14px] font-semibold text-[#1D1D1F] tracking-tight">{title}</span>
        {badge && (
          <span className={cn("text-[11px] font-bold px-1.5 py-0.5 rounded-md", bc)}>
            {badge}
          </span>
        )}
      </div>
      <Link
        href={href}
        className="flex items-center gap-0.5 text-[12px] font-semibold text-brand hover:underline"
      >
        {linkLabel}
        <ChevronRight size={13} strokeWidth={2.5} />
      </Link>
    </div>
  );
}

// ── Invoice Row ───────────────────────────────────────────────────────────────

function InvoiceRow({ invoice: inv }: { invoice: Invoice }) {
  const overdue = isOverdue(inv.due_date);
  return (
    <div className="flex items-center gap-3 px-3 py-3.5">
      <div className="w-7 h-7 rounded-lg bg-[#F5F5F7] flex items-center justify-center shrink-0">
        <AlertCircle size={13} className={overdue ? "text-[#FF3B30]" : "text-[#6E6E73]"} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-[13px] font-semibold text-[#1D1D1F] truncate">{inv.invoice_number}</p>
          {overdue && (
            <span className="text-[10px] font-bold bg-[#FFEEEE] text-[#FF3B30] px-1.5 py-0.5 rounded-md uppercase tracking-wide shrink-0">
              Overdue
            </span>
          )}
        </div>
        <p className="text-[11px] text-[#6E6E73] truncate">Due {fmtDate(inv.due_date)}</p>
      </div>
      <p className="text-[13px] font-semibold text-[#1D1D1F] shrink-0">{fmtMoney(inv.total)}</p>
    </div>
  );
}

// ── Payment Row ───────────────────────────────────────────────────────────────

function PaymentRow({ invoice: inv }: { invoice: Invoice }) {
  return (
    <div className="flex items-center gap-3 px-3 py-3.5">
      <div className="w-7 h-7 rounded-lg bg-[#F5F5F7] flex items-center justify-center shrink-0">
        <CheckCircle size={13} className="text-[#34C759]" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#1D1D1F] truncate">{inv.invoice_number}</p>
        <p className="text-[11px] text-[#6E6E73] truncate">{fmtDate(inv.issued_date)}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <p className="text-[13px] font-semibold text-[#34C759]">{fmtMoney(inv.total)}</p>
        {inv.pdf && (
          <a
            href={inv.pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 rounded-lg bg-black/[0.04] hover:bg-brand hover:text-white flex items-center justify-center transition-colors text-[#6E6E73]"
            title="Download PDF"
          >
            <Download size={12} />
          </a>
        )}
      </div>
    </div>
  );
}
