"use client";

import { FileText } from "lucide-react";
import Link from "next/link";

export default function DocumentsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-brand-dark">Documents</h1>
        <p className="text-sm text-neutral-500">Lease agreements and important documents</p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg p-10 text-center shadow-sm">
        <FileText size={36} className="text-neutral-300 mx-auto mb-4" />
        <h2 className="font-serif text-xl font-bold text-brand-dark mb-2">No documents yet</h2>
        <p className="text-sm text-neutral-500 max-w-sm mx-auto mb-6">
          Your lease agreement and other documents will appear here once your tenancy is set up.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-brand-hover transition-colors"
        >
          Contact Our Team
        </Link>
      </div>
    </div>
  );
}
