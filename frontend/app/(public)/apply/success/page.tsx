"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle, Copy, Building2, Clock, Mail,
  AlertCircle, ArrowRight, Home,
} from "lucide-react";
import { useState } from "react";

// ── Payment account details — update with real bank info ─────────────────────
const PAYMENT_DETAILS = {
  bankName: "Chase Bank",
  accountName: "Hasker & Co. Realty Group LLC",
  accountNumber: "000123456789",
  routingNumber: "021000021",
  amount: "$50.00",
  memo: "Application Fee",
};

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5 bg-[#F5F5F7] rounded-xl">
      <div>
        <p className="text-[10px] font-semibold tracking-[0.07em] uppercase text-[#6E6E73] mb-0.5">{label}</p>
        <p className="text-[15px] font-semibold text-[#1D1D1F] font-mono tracking-tight">{value}</p>
      </div>
      <button
        onClick={handleCopy}
        className="shrink-0 flex items-center gap-1.5 text-[11px] font-semibold text-brand hover:text-brand-hover transition-colors px-3 py-1.5 rounded-lg hover:bg-white"
      >
        {copied ? (
          <>
            <CheckCircle size={13} className="text-[#34C759]" />
            Copied
          </>
        ) : (
          <>
            <Copy size={13} />
            Copy
          </>
        )}
      </button>
    </div>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") ?? "—";
  const name = searchParams.get("name") ?? "Applicant";
  const refId = `APP-${String(ref).padStart(5, "0")}`;
  const memo = `${refId} ${name} Application Fee`;

  const steps = [
    { icon: Building2,   title: "Transfer the application fee", desc: "Use ACH / bank transfer to the account details below. Include the memo exactly as shown.", active: true },
    { icon: Mail,        title: "We confirm receipt",          desc: "Our team will email you within 1 business day confirming payment receipt.", active: false },
    { icon: Clock,       title: "Application reviewed",        desc: "Full review completed within 24–48 hours. We'll contact you with a decision.", active: false },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F7] pt-20 pb-16">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 space-y-4">

        {/* Confirmation card */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#F5F5F7] flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-[#34C759]" strokeWidth={1.8} />
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight text-[#1D1D1F] mb-1">
            Application Received
          </h1>
          <p className="text-[14px] text-[#6E6E73]">
            Thank you, <span className="font-semibold text-[#1D1D1F]">{name}</span>. Your application has been submitted.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-[#F5F5F7] px-4 py-2.5 rounded-xl">
            <p className="text-[11px] text-[#6E6E73] font-medium">Reference</p>
            <p className="text-[14px] font-bold text-[#1D1D1F] font-mono">{refId}</p>
          </div>
          <p className="mt-3 text-[12px] text-[#6E6E73]">
            A copy of your application PDF will be emailed to you shortly.
          </p>
        </div>

        {/* Application fee card */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="px-5 py-4 border-b border-black/[0.04]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#F5F5F7] flex items-center justify-center shrink-0">
                <AlertCircle size={16} className="text-[#6E6E73]" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#1D1D1F] tracking-tight">
                  Pay Application Fee — {PAYMENT_DETAILS.amount}
                </p>
                <p className="text-[12px] text-[#6E6E73]">Required to process your application</p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-3">
            <p className="text-[13px] text-[#6E6E73] leading-relaxed">
              Transfer <strong className="text-[#1D1D1F]">{PAYMENT_DETAILS.amount}</strong> via ACH bank transfer to the account below.
              Include the memo <strong className="text-[#1D1D1F]">exactly as shown</strong> — this is how we match your payment to your application.
            </p>

            <div className="space-y-2">
              <CopyField label="Bank Name" value={PAYMENT_DETAILS.bankName} />
              <CopyField label="Account Name" value={PAYMENT_DETAILS.accountName} />
              <CopyField label="Account Number" value={PAYMENT_DETAILS.accountNumber} />
              <CopyField label="Routing Number (ABA)" value={PAYMENT_DETAILS.routingNumber} />
              <CopyField label="Amount" value={PAYMENT_DETAILS.amount} />
              <div className="bg-brand/5 border border-brand/20 rounded-xl p-3">
                <p className="text-[10px] font-semibold tracking-[0.07em] uppercase text-brand mb-1">
                  Memo / Reference (required)
                </p>
                <p className="text-[13px] font-bold text-[#1D1D1F] font-mono break-all">{memo}</p>
                <button
                  onClick={() => navigator.clipboard.writeText(memo)}
                  className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-brand hover:underline"
                >
                  <Copy size={11} /> Copy memo
                </button>
              </div>
            </div>

            <div className="bg-[#F5F5F7] rounded-xl px-4 py-3">
              <p className="text-[11px] text-[#6E6E73] leading-relaxed">
                <strong className="text-[#1D1D1F]">Note:</strong> Your application fee is non-refundable and must be received before we begin the review process.
                Payment must be submitted within <strong className="text-[#1D1D1F]">5 business days</strong> of submitting your application.
              </p>
            </div>
          </div>
        </div>

        {/* What happens next */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5">
          <p className="text-[11px] font-semibold tracking-[0.07em] uppercase text-[#6E6E73] mb-4">
            What happens next
          </p>
          <div className="space-y-0">
            {steps.map(({ icon: Icon, title, desc, active }, i) => (
              <div key={title} className="flex gap-4">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-xl bg-[#F5F5F7] flex items-center justify-center shrink-0">
                    <Icon size={15} className={active ? "text-[#1D1D1F]" : "text-[#C7C7CC]"} strokeWidth={1.8} />
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-px flex-1 bg-[#E5E5EA] my-1" style={{ minHeight: 20 }} />
                  )}
                </div>
                {/* Content */}
                <div className="pb-5 min-w-0">
                  <p className={`text-[13px] font-semibold mb-0.5 ${active ? "text-[#1D1D1F]" : "text-[#6E6E73]"}`}>
                    {title}
                  </p>
                  <p className="text-[12px] text-[#6E6E73] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Questions */}
        <div className="bg-[#0B1F3A] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-[13px] font-semibold text-white tracking-tight">Questions about your application?</p>
            <p className="text-[12px] text-white/40 mt-0.5">Reference your ID when emailing us.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <a
              href={`mailto:info@haskerrealtygroup.com?subject=Application ${refId}&body=Hi, I'm following up on my application ${refId}.`}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white border border-white/20 px-3.5 py-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Mail size={13} />
              Email Us
            </a>
            <Link
              href="/properties"
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white bg-brand px-3.5 py-2 rounded-xl hover:bg-brand-hover transition-colors"
            >
              <Home size={13} />
              Browse Homes
            </Link>
          </div>
        </div>

        {/* Portal CTA */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[13px] font-semibold text-[#1D1D1F] tracking-tight">Track your application</p>
            <p className="text-[12px] text-[#6E6E73] mt-0.5">Sign in to your tenant portal to view status updates.</p>
          </div>
          <Link
            href="/portal/dashboard"
            className="shrink-0 flex items-center gap-1.5 text-[12px] font-semibold text-brand hover:underline"
          >
            Go to Portal
            <ArrowRight size={13} strokeWidth={2.5} />
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="w-8 h-8 border-[2.5px] border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
