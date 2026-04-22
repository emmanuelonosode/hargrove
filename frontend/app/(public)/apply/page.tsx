import type { Metadata } from "next";
import { RentalApplicationForm } from "@/components/public/RentalApplicationForm";
import { Home, Clock, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Apply to Rent a Home | Hasker & Co. Realty Group",
  description:
    "Apply to rent an affordable home with Hasker & Co. Realty Group. Simple online application, reviewed within 24 hours. No hidden fees, no pressure. Fast, honest decisions.",
  keywords: [
    "apply to rent a home", "rental application", "affordable rental application",
    "rent a house", "cheap apartments to rent", "rental application online",
  ],
  openGraph: {
    title: "Apply to Rent a Home | Hasker & Co. Realty Group",
    description: "Simple rental application reviewed in 24 hours. Affordable homes across 12+ cities. No hidden fees.",
    type: "website",
    url: "https://haskerrealtygroup.com/apply",
  },
  alternates: { canonical: "https://haskerrealtygroup.com/apply" },
};

interface Props {
  searchParams: Promise<{ property?: string }>;
}

const breadcrumb = {
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://haskerrealtygroup.com" },
    { "@type": "ListItem", position: 2, name: "Apply", item: "https://haskerrealtygroup.com/apply" },
  ],
};

const TRUST_ITEMS = [
  { icon: Clock, text: "Reviewed within 24 hours" },
  { icon: Shield, text: "Your data is kept confidential" },
  { icon: Home, text: "No hidden fees — ever" },
];

export default async function ApplyPage({ searchParams }: Props) {
  const { property } = await searchParams;

  return (
    <div className="min-h-screen bg-[#F5F5F7] pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* Hero */}
      <div className="bg-[#0B1F3A] pt-12 pb-10 px-6 text-white text-center">
        <p className="text-[10px] tracking-[0.25em] uppercase text-white/40 font-semibold mb-3">
          Simple &amp; Fast
        </p>
        <h1 className="text-[28px] sm:text-[36px] font-semibold tracking-tight mb-3">
          Apply to Rent a Home
        </h1>
        <p className="text-[14px] text-white/50 max-w-md mx-auto leading-relaxed">
          Takes less than 5 minutes. Our team reviews every application within 24 hours.
        </p>

        {/* Trust row */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6">
          {TRUST_ITEMS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-[12px] text-white/50">
              <Icon size={13} className="text-white/30" strokeWidth={2} />
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-16">
        <RentalApplicationForm propertySlug={property} />
      </div>
    </div>
  );
}
