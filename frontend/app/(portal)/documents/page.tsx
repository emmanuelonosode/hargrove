"use client";

import Link from "next/link";
import {
  FileText, Receipt, Shield, FolderOpen,
  ArrowLeft, Mail, Info, Upload,
} from "lucide-react";

const DOC_TYPES = [
  {
    icon: FileText,
    title: "Lease Agreement",
    desc: "Your signed rental or purchase agreement, terms, renewals, and addendums.",
  },
  {
    icon: Receipt,
    title: "Receipts & Invoices",
    desc: "Digital copies of all rent receipts and payment invoices from your manager.",
  },
  {
    icon: Shield,
    title: "ID & Verification",
    desc: "KYC documents, proof of income, and identity files from onboarding.",
  },
  {
    icon: FolderOpen,
    title: "Other Documents",
    desc: "Move-in reports, addendums, pet agreements, and other property paperwork.",
  },
];

export default function DocumentsPage() {
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
              My Documents
            </h1>
            <p className="text-[13px] text-[#6E6E73]">Lease agreements, receipts, and files</p>
          </div>
        </div>

        {/* Info card */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-[#EFF4FF] flex items-center justify-center shrink-0">
            <Info size={17} className="text-brand" strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#1D1D1F] mb-1">
              Managed by your property team
            </p>
            <p className="text-[12px] text-[#6E6E73] leading-relaxed">
              Lease agreements, receipts, and verification documents are uploaded by
              Hasker &amp; Co. staff once your tenancy is set up. Need a specific document?
              Email us and we&apos;ll handle it promptly.
            </p>
            <a
              href="mailto:info@haskerrealtygroup.com?subject=Document Request"
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand mt-2.5 hover:underline"
            >
              <Mail size={12} />
              info@haskerrealtygroup.com
            </a>
          </div>
        </div>

        {/* Empty state */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="px-5 py-4 border-b border-black/[0.04] flex items-center justify-between">
            <p className="text-[14px] font-semibold text-[#1D1D1F] tracking-tight">Your Files</p>
            <span className="text-[11px] text-[#6E6E73] bg-[#F5F5F7] px-2.5 py-1 rounded-lg font-medium">
              0 documents
            </span>
          </div>
          <div className="py-14 flex flex-col items-center text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-[#F5F5F7] flex items-center justify-center mb-4">
              <FolderOpen size={28} className="text-[#C7C7CC]" strokeWidth={1.5} />
            </div>
            <h3 className="text-[15px] font-semibold text-[#1D1D1F] tracking-tight mb-2">
              No documents yet
            </h3>
            <p className="text-[13px] text-[#6E6E73] max-w-xs leading-relaxed mb-6">
              Your lease agreement and files will appear here once your tenancy is confirmed.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href="mailto:info@haskerrealtygroup.com?subject=Document Request"
                className="inline-flex items-center gap-1.5 bg-brand text-white text-[12px] font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-hover transition-colors"
              >
                <Mail size={13} strokeWidth={2} />
                Request a Document
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#6E6E73] border border-black/[0.1] bg-black/[0.02] px-5 py-2.5 rounded-xl hover:bg-black/[0.04] transition-colors"
              >
                <Upload size={13} strokeWidth={2} />
                Submit a File
              </Link>
            </div>
          </div>
        </div>

        {/* Doc types */}
        <div>
          <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6E6E73] px-1 mb-2">
            What you&apos;ll find here
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DOC_TYPES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center shrink-0">
                  <Icon size={17} className="text-[#3C3C43]" strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#1D1D1F] mb-1">{title}</p>
                  <p className="text-[12px] text-[#6E6E73] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Urgent CTA */}
        <div className="bg-[#0B1F3A] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-[13px] font-semibold text-white tracking-tight">
              Need a document urgently?
            </p>
            <p className="text-[12px] text-white/40 mt-0.5">
              Our team responds within 1 business day.
            </p>
          </div>
          <a
            href="mailto:info@haskerrealtygroup.com?subject=Urgent Document Request"
            className="shrink-0 inline-flex items-center gap-1.5 bg-brand text-white text-[12px] font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-hover transition-colors"
          >
            <Mail size={13} strokeWidth={2} />
            Email Our Team
          </a>
        </div>

      </div>
    </div>
  );
}
