"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, Home, Calendar, ArrowRight, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Transaction {
  id: number;
  transaction_type: string;
  agreed_price: string;
  status: string;
  created_at: string;
  property: { title: string; address: string; city: string; state: string };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`${API_BASE}/api/v1/transactions/`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.results) setTransactions(data.results);
        else if (Array.isArray(data)) setTransactions(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const active = transactions.find(
    (t) => t.status === "IN_PROGRESS" || t.status === "DEPOSIT_PAID"
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-brand-dark">
          Welcome back, {user?.first_name}
        </h1>
        <p className="text-neutral-500 text-sm mt-1">Here&apos;s a summary of your tenancy.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-neutral-100 rounded-lg" />
          ))}
        </div>
      ) : active ? (
        <>
          {/* Active lease card */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6 mb-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-brand mb-1">
                  Active {active.transaction_type === "RENT" ? "Lease" : "Purchase"}
                </p>
                <h2 className="font-serif text-xl font-bold text-brand-dark">
                  {active.property.title}
                </h2>
                <p className="text-sm text-neutral-500 mt-0.5">
                  {active.property.address}, {active.property.city}, {active.property.state}
                </p>
              </div>
              <span className="shrink-0 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckCircle size={12} /> Active
              </span>
            </div>
            <div className="mt-5 flex flex-wrap gap-6">
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-wide mb-0.5">Monthly Rent</p>
                <p className="font-serif text-2xl font-bold text-brand-dark">
                  {formatPrice(parseFloat(active.agreed_price), { perMonth: true })}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-wide mb-0.5">Status</p>
                <p className="text-sm font-medium text-brand-dark capitalize">
                  {active.status.replace("_", " ").toLowerCase()}
                </p>
              </div>
            </div>
            <div className="mt-5">
              <Link
                href="/portal/payments"
                className="inline-flex items-center gap-2 bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-brand-hover transition-colors"
              >
                <CreditCard size={14} />
                Pay Rent
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: CreditCard, label: "Payment History", desc: "View past payments & receipts", href: "/portal/payments" },
              { icon: Home, label: "Properties", desc: "Browse other available homes", href: "/properties" },
              { icon: Calendar, label: "Schedule Maintenance", desc: "Submit a maintenance request", href: "/contact" },
            ].map(({ icon: Icon, label, desc, href }) => (
              <Link
                key={label}
                href={href}
                className="bg-white border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow group"
              >
                <Icon size={20} className="text-brand mb-3" />
                <p className="font-semibold text-brand-dark text-sm group-hover:text-brand transition-colors">{label}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{desc}</p>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-lg p-10 text-center">
          <Clock size={36} className="text-neutral-300 mx-auto mb-4" />
          <h2 className="font-serif text-xl font-bold text-brand-dark mb-2">No active lease found</h2>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto mb-6">
            Your account is set up. Once your lease is linked by our team, your dashboard will show payment details here.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-brand-hover transition-colors"
          >
            Contact Our Team
          </Link>
        </div>
      )}
    </div>
  );
}
