import type { Metadata } from "next";
import Image from "next/image";
import { RentalApplicationForm } from "@/components/public/RentalApplicationForm";
import { Clock, Shield, Home } from "lucide-react";

export const metadata: Metadata = {
  title: "Apply to Rent a Home | Hasker & Co. Realty Group",
  description:
    "Apply to rent an affordable home with Hasker & Co. Realty Group. Simple online application, reviewed within 24 hours. No pressure. Fast, honest decisions.",
  keywords: [
    "apply to rent a home", "rental application", "affordable rental application",
    "rent a house", "cheap apartments to rent", "rental application online",
  ],
  openGraph: {
    title: "Apply to Rent a Home | Hasker & Co. Realty Group",
    description: "Simple rental application reviewed in 24 hours. Affordable, move-in ready homes across 12+ cities.",
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

const TRUST = [
  { icon: Clock,  text: "Reviewed in 24 hours" },
  { icon: Shield, text: "Your data is protected" },
  { icon: Home,   text: "Every home is inspected" },
];

export default async function ApplyPage({ searchParams }: Props) {
  const { property } = await searchParams;

  return (
    <div className="min-h-screen bg-white pt-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden bg-[#F0F5FF]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(26,86,219,0.12) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      >
        <div className="relative max-w-5xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-0 md:gap-10">

            {/* Copy */}
            <div className="flex-1 text-center md:text-left pt-10 pb-8 md:pb-14">
              <p className="hero-animate text-[10px] font-bold tracking-[0.22em] uppercase text-brand mb-4" style={{ animationDelay: "0ms" }}>
                Hasker &amp; Co. Realty Group
              </p>
              <h1
                className="hero-animate font-sans font-bold text-[#0B1F3A] leading-[1.12] tracking-tight mb-4"
                style={{
                  fontSize: "clamp(28px, 5vw, 46px)",
                  animationDelay: "60ms",
                }}
              >
                Your next home is<br /> one form away.
              </h1>
              <p className="hero-animate text-[14px] sm:text-[15px] text-[#4B5563] leading-relaxed max-w-[400px] mx-auto md:mx-0 mb-6" style={{ animationDelay: "110ms" }}>
                Takes 5 minutes. We review every application within 24 hours — straightforward decisions, no waiting.
              </p>
              <div className="hero-animate flex flex-wrap gap-2 justify-center md:justify-start" style={{ animationDelay: "160ms" }}>
                {TRUST.map(({ icon: Icon, text }) => (
                  <span
                    key={text}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0B1F3A] bg-white border border-[#DBEAFE] rounded-full px-3.5 py-1.5 shadow-sm"
                  >
                    <Icon size={12} className="text-brand shrink-0" strokeWidth={2.5} />
                    {text}
                  </span>
                ))}
              </div>
            </div>

            {/* Illustration — desktop only */}
            <div className="hidden md:flex w-[360px] xl:w-[400px] shrink-0 items-end justify-center">
              <Image
                src="/illustrations/email-header-welcome.png"
                alt=""
                width={400}
                height={290}
                className="w-full h-auto hero-animate"
                style={{ animationDelay: "200ms" }}
                priority
              />
            </div>

          </div>
        </div>
      </section>

      {/* ── Form ──────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-16">
        <RentalApplicationForm propertySlug={property} />
      </div>
    </div>
  );
}
