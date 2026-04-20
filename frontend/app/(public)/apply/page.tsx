import type { Metadata } from "next";
import { RentalApplicationForm } from "@/components/public/RentalApplicationForm";

export const metadata: Metadata = {
  title: "Apply to Rent a Home | Hasker & Co. Realty Group",
  description:
    "Apply to rent an affordable home with Hasker & Co. Realty Group. Simple online application, reviewed within 24 hours. No hidden fees, no pressure. Fast, honest decisions.",
  keywords: [
    "apply to rent a home",
    "rental application",
    "affordable rental application",
    "rent a house",
    "cheap apartments to rent",
    "rental application online",
  ],
  openGraph: {
    title: "Apply to Rent a Home | Hasker & Co. Realty Group",
    description:
      "Simple rental application reviewed in 24 hours. Affordable homes across 12+ cities. No hidden fees.",
    type: "website",
    url: "https://haskerrealtygroup.com/apply",
  },
  alternates: { canonical: "https://haskerrealtygroup.com/apply" },
};

interface Props {
  searchParams: Promise<{ property?: string }>;
}

const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://haskerrealtygroup.com" }, { "@type": "ListItem", position: 2, name: "Apply", item: "https://haskerrealtygroup.com/apply" }] };

export default async function ApplyPage({ searchParams }: Props) {
  const { property } = await searchParams;

  return (
    <div className="pt-20 min-h-screen bg-neutral-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {/* Header */}
      <div className="bg-brand-dark pt-14 pb-12 px-6 text-white text-center">
        <p className="text-blue-300 text-xs font-semibold tracking-[0.4em] uppercase mb-4">
          Simple &amp; Fast
        </p>
        <h1 className="font-serif text-4xl lg:text-5xl font-bold mb-4">Apply to Rent a Home</h1>
        <p className="text-blue-100 max-w-xl mx-auto text-sm leading-relaxed">
          Fill out the form below. It takes less than 5 minutes. Our team reviews every
          application within 24 hours. No hidden fees, no pressure.
        </p>
      </div>

      <div className="max-w-3xl mx-auto py-12">
        <RentalApplicationForm propertySlug={property} />
      </div>
    </div>
  );
}
