"use client";

import { useEffect, useState } from "react";
import { CreditCard, CheckCircle, Clock, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

interface Payment {
  id: number;
  amount: string;
  status: string;
  paid_at: string | null;
  payment_method: string;
  stripe_receipt_url: string;
}

interface Transaction {
  id: number;
  agreed_price: string;
  status: string;
  transaction_type: string;
  property: { title: string; city: string; state: string };
  payments: Payment[];
}

const statusIcon = (s: string) => {
  if (s === "SUCCESSFUL") return <CheckCircle size={14} className="text-green-500" />;
  if (s === "FAILED") return <AlertCircle size={14} className="text-red-500" />;
  return <Clock size={14} className="text-yellow-500" />;
};

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [payStatus, setPayStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [payError, setPayError] = useState("");

  useEffect(() => {
    apiFetch(`${API_BASE}/api/v1/transactions/`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const results: Transaction[] = data?.results ?? (Array.isArray(data) ? data : []);
        setTransactions(results);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handlePay(transactionId: number) {
    setPayingId(transactionId);
    setPayStatus("loading");
    setPayError("");
    try {
      const res = await apiFetch(`${API_BASE}/api/v1/transactions/${transactionId}/pay/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? "Payment failed.");

      if (!STRIPE_PK) {
        setPayStatus("error");
        setPayError("Payment processing is not configured yet. Please contact our team.");
        return;
      }

      const { loadStripe } = await import("@stripe/stripe-js");
      const stripe = await loadStripe(STRIPE_PK);
      if (!stripe) throw new Error("Stripe failed to load.");

      const { error } = await stripe.confirmCardPayment(data.client_secret, {
        payment_method: { card: { token: "tok_visa" } },
      });

      if (error) throw new Error(error.message);
      setPayStatus("success");
    } catch (err: unknown) {
      setPayStatus("error");
      setPayError(err instanceof Error ? err.message : "Payment failed.");
    }
  }

  const activeTransaction = transactions.find(
    (t) => t.status === "IN_PROGRESS" || t.status === "DEPOSIT_PAID"
  );

  const allPayments = transactions.flatMap((t) =>
    (t.payments ?? []).map((p) => ({ ...p, property: t.property }))
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/portal/dashboard" className="text-neutral-400 hover:text-brand transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-bold text-brand-dark">Payments</h1>
          <p className="text-sm text-neutral-500">Pay rent and view your payment history</p>
        </div>
      </div>

      {/* Pay Now card */}
      {activeTransaction && (
        <div className="bg-white border border-neutral-200 rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="font-semibold text-brand-dark mb-4 flex items-center gap-2">
            <CreditCard size={16} className="text-brand" />
            Pay Rent
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wide mb-0.5">Property</p>
              <p className="font-medium text-brand-dark">{activeTransaction.property.title}</p>
              <p className="text-sm text-neutral-500">
                {activeTransaction.property.city}, {activeTransaction.property.state}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-400 uppercase tracking-wide mb-0.5">Amount Due</p>
              <p className="font-serif text-3xl font-bold text-brand-dark">
                {formatPrice(parseFloat(activeTransaction.agreed_price), { perMonth: true })}
              </p>
            </div>
          </div>

          {payStatus === "success" ? (
            <div className="mt-5 flex items-center gap-2 text-green-700 bg-green-50 px-4 py-3 rounded-md text-sm font-medium">
              <CheckCircle size={16} />
              Payment submitted successfully!
            </div>
          ) : payStatus === "error" ? (
            <div className="mt-5 space-y-3">
              <div className="flex items-start gap-2 text-red-700 bg-red-50 px-4 py-3 rounded-md text-sm">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                {payError}
              </div>
              <button
                onClick={() => { setPayStatus("idle"); setPayingId(null); }}
                className="text-sm text-brand hover:underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <button
              onClick={() => handlePay(activeTransaction.id)}
              disabled={payStatus === "loading"}
              className="mt-5 inline-flex items-center gap-2 bg-brand text-white text-sm font-semibold px-6 py-2.5 rounded-md hover:bg-brand-hover transition-colors disabled:opacity-60"
            >
              <CreditCard size={14} />
              {payStatus === "loading" ? "Processing…" : "Pay Now"}
            </button>
          )}
        </div>
      )}

      {/* Payment history */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="font-semibold text-brand-dark">Payment History</h2>
        </div>

        {loading ? (
          <div className="p-6 space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-neutral-100 rounded" />)}
          </div>
        ) : allPayments.length === 0 ? (
          <div className="p-10 text-center text-neutral-400 text-sm">
            No payments recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {allPayments.map((p) => (
              <div key={p.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {statusIcon(p.status)}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-brand-dark truncate">
                      {p.property.title}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {p.paid_at ? new Date(p.paid_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Pending"}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-brand-dark text-sm">
                    {formatPrice(parseFloat(p.amount))}
                  </p>
                  {p.stripe_receipt_url && (
                    <a
                      href={p.stripe_receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand hover:underline"
                    >
                      Receipt
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
