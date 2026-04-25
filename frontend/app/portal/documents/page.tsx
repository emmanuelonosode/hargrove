"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText, Receipt, Shield, FolderOpen, ArrowLeft, Mail, Info,
  ClipboardCheck, Banknote, Download, AlertCircle, CheckCircle,
} from "lucide-react";
import { apiFetch } from "@/lib/auth";

const API_BASE = "";

interface ClientDocument {
  id: number;
  name: string;
  document_type: string;
  is_signed: boolean;
  file_url: string | null;
  uploaded_by_name: string;
  created_at: string;
  expires_at: string | null;
}

interface Invoice {
  id: number;
  invoice_number: string;
  issued_date: string;
  total: string;
  status: string;
  pdf: string | null;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  CONTRACT:       FileText,
  RECEIPT:        Receipt,
  AGREEMENT:      ClipboardCheck,
  ID_DOCUMENT:    Shield,
  PROOF_OF_FUNDS: Banknote,
  OTHER:          FolderOpen,
};

function fmt(v: string | number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    typeof v === "string" ? parseFloat(v) : v
  );
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isExpiringSoon(expires_at: string | null): boolean {
  if (!expires_at) return false;
  const diff = new Date(expires_at).getTime() - Date.now();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
}

function DocumentCard({ doc }: { doc: ClientDocument }) {
  const Icon = TYPE_ICONS[doc.document_type] ?? FolderOpen;
  const expiring = isExpiringSoon(doc.expires_at);

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center shrink-0">
        <Icon size={17} className="text-[#3C3C43]" strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13px] font-semibold text-[#1D1D1F] leading-snug truncate">{doc.name}</p>
          {doc.is_signed && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-[#34C759] bg-[#F0FFF4] px-1.5 py-0.5 rounded-md shrink-0">
              <CheckCircle size={9} />
              Signed
            </span>
          )}
        </div>
        <p className="text-[11px] text-[#6E6E73] mt-0.5">{fmtDate(doc.created_at)}</p>
        {expiring && doc.expires_at && (
          <div className="flex items-center gap-1 mt-1.5 text-[11px] font-medium text-[#FF9F0A]">
            <AlertCircle size={11} />
            Expires {fmtDate(doc.expires_at)}
          </div>
        )}
        {doc.file_url && (
          <a
            href={doc.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-[12px] font-semibold text-brand hover:underline"
          >
            <Download size={12} />
            Download
          </a>
        )}
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch(`${API_BASE}/api/v1/documents/my-documents/`)
        .then((r) => (r.ok ? r.json() : []))
        .then((d) => setDocuments(d?.results ?? (Array.isArray(d) ? d : []))),
      apiFetch(`${API_BASE}/api/v1/transactions/my-invoices/`)
        .then((r) => (r.ok ? r.json() : []))
        .then((d) => setInvoices(d?.results ?? (Array.isArray(d) ? d : []))),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const paidWithPdf = invoices.filter((i) => i.status === "PAID" && i.pdf);

  return (
    <div className="min-h-screen bg-[#F5F5F7] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-3xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3 px-1">
          <Link
            href="/portal/profile"
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
          >
            <ArrowLeft size={15} strokeWidth={2} />
          </Link>
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight text-[#1D1D1F]">My Documents</h1>
            <p className="text-[13px] text-[#6E6E73]">Lease agreements, receipts, and files</p>
          </div>
        </div>

        {/* Info card */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-[#EFF4FF] flex items-center justify-center shrink-0">
            <Info size={17} className="text-brand" strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#1D1D1F] mb-1">Managed by your property team</p>
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

        {/* Documents list */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="px-5 py-4 border-b border-black/[0.04] flex items-center justify-between">
            <p className="text-[14px] font-semibold text-[#1D1D1F] tracking-tight">Your Files</p>
            <span className="text-[11px] text-[#6E6E73] bg-[#F5F5F7] px-2.5 py-1 rounded-lg font-medium">
              {loading ? "…" : `${documents.length} document${documents.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-black/[0.04] animate-pulse" />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="py-14 flex flex-col items-center text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-[#F5F5F7] flex items-center justify-center mb-4">
                <FolderOpen size={28} className="text-[#C7C7CC]" strokeWidth={1.5} />
              </div>
              <h3 className="text-[15px] font-semibold text-[#1D1D1F] tracking-tight mb-2">No documents yet</h3>
              <p className="text-[13px] text-[#6E6E73] max-w-xs leading-relaxed mb-6">
                Your lease agreement and files will appear here once your tenancy is confirmed.
              </p>
              <a
                href="mailto:info@haskerrealtygroup.com?subject=Document Request"
                className="inline-flex items-center gap-1.5 bg-brand text-white text-[12px] font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-hover transition-colors"
              >
                <Mail size={13} strokeWidth={2} />
                Request a Document
              </a>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {documents.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </div>
          )}
        </div>

        {/* Payment Receipts */}
        {(loading || paidWithPdf.length > 0) && (
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="px-5 py-4 border-b border-black/[0.04]">
              <p className="text-[14px] font-semibold text-[#1D1D1F] tracking-tight">Payment Receipts</p>
              <p className="text-[12px] text-[#6E6E73] mt-0.5">Download PDF receipts for your paid invoices</p>
            </div>
            {loading ? (
              <div className="p-5 space-y-2">
                {[1, 2].map((i) => <div key={i} className="h-12 rounded-xl bg-black/[0.04] animate-pulse" />)}
              </div>
            ) : (
              <div className="divide-y divide-black/[0.04]">
                {paidWithPdf.map((inv) => (
                  <div key={inv.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[13px] font-semibold text-[#1D1D1F]">{inv.invoice_number}</p>
                      <p className="text-[11px] text-[#6E6E73]">{fmtDate(inv.issued_date)} · {fmt(inv.total)}</p>
                    </div>
                    <a
                      href={inv.pdf!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand border border-brand/20 bg-[#EFF4FF] px-3.5 py-1.5 rounded-lg hover:bg-brand hover:text-white transition-colors shrink-0"
                    >
                      <Download size={12} />
                      PDF
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Urgent CTA */}
        <div className="bg-[#0B1F3A] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-[13px] font-semibold text-white tracking-tight">Need a document urgently?</p>
            <p className="text-[12px] text-white/40 mt-0.5">Our team responds within 1 business day.</p>
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
