"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle, Copy, Building2, Clock, Mail,
  AlertCircle, ArrowRight, Home,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

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

  const steps = [
    { icon: CheckCircle, title: "Payment Proof Submitted", desc: "Your transfer proof is now being manually verified by our team.", active: true, completed: true },
    { icon: Clock,       title: "Payment Verification",   desc: "Usually takes 1-2 hours. You'll get an email once confirmed.", active: true, completed: false },
    { icon: Mail,        title: "Application Review",     desc: "Once verified, we'll review your details and credit history.", active: false, completed: false },
    { icon: Home,        title: "Lease & Move-In",        desc: "Final steps after your application is approved.", active: false, completed: false },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F7] pt-20 pb-16">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 space-y-4">

        {/* Confirmation card */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-8 text-center border-t-4 border-brand">
          <div className="w-16 h-16 rounded-2xl bg-brand/5 flex items-center justify-center mx-auto mb-6">
            <Clock size={32} className="text-brand" strokeWidth={2} />
          </div>
          <h1 className="text-[26px] font-semibold tracking-tight text-[#1D1D1F] mb-2">
            Proof Received!
          </h1>
          <p className="text-[15px] text-[#6E6E73] leading-relaxed">
            Thank you, <span className="font-semibold text-[#1D1D1F]">{name}</span>. Your application and payment proof have been successfully received.
          </p>
          <div className="mt-6 inline-flex items-center gap-3 bg-[#F5F5F7] px-5 py-3 rounded-2xl border border-black/[0.03]">
            <div>
              <p className="text-[10px] text-[#6E6E73] font-bold uppercase tracking-widest text-left">Application ID</p>
              <p className="text-[16px] font-bold text-[#1D1D1F] font-mono">{refId}</p>
            </div>
            <div className="w-px h-8 bg-black/[0.08]" />
            <div className="text-left">
              <p className="text-[10px] text-[#6E6E73] font-bold uppercase tracking-widest">Status</p>
              <p className="text-[14px] font-bold text-brand">Verifying Payment</p>
            </div>
          </div>
        </div>

        {/* What happens next */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
          <h3 className="text-[16px] font-bold text-[#1D1D1F] mb-6 flex items-center gap-2">
            Your Next Steps
          </h3>
          <div className="space-y-0 relative">
            {steps.map(({ icon: Icon, title, desc, active, completed }, i) => (
              <div key={title} className="flex gap-5">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10 border transition-all duration-500",
                    completed ? "bg-[#34C759] border-[#34C759] text-white shadow-[0_0_15px_rgba(52,199,89,0.3)]" : 
                    active ? "bg-white border-brand text-brand shadow-[0_0_15px_rgba(26,86,219,0.15)]" : 
                    "bg-[#F5F5F7] border-transparent text-[#C7C7CC]"
                  )}>
                    {completed ? <CheckCircle size={18} strokeWidth={2.5} /> : <Icon size={18} strokeWidth={2} />}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={cn(
                      "w-0.5 flex-1 my-1 rounded-full",
                      completed ? "bg-[#34C759]" : "bg-[#E5E5EA]"
                    )} style={{ minHeight: 30 }} />
                  )}
                </div>
                {/* Content */}
                <div className="pb-8 min-w-0">
                  <p className={cn(
                    "text-[15px] font-bold mb-1 transition-colors duration-500",
                    active || completed ? "text-[#1D1D1F]" : "text-[#C7C7CC]"
                  )}>
                    {title}
                  </p>
                  <p className={cn(
                    "text-[13px] leading-relaxed transition-colors duration-500",
                    active || completed ? "text-[#6E6E73]" : "text-[#C7C7CC]"
                  )}>
                    {desc}
                  </p>
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
            href="/portal/profile"
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
