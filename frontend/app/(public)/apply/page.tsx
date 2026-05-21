import type { Metadata } from "next";
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
              <HouseIllustration />
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

function HouseIllustration() {
  return (
    <svg
      viewBox="0 0 400 290"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="w-full h-auto hero-animate"
      style={{ animationDelay: "200ms" }}
    >
      {/* Ground shadow */}
      <ellipse cx="200" cy="285" rx="178" ry="7" fill="#DBEAFE" opacity="0.8" />

      {/* House body */}
      <rect x="72" y="148" width="256" height="137" fill="white" stroke="#0B1F3A" strokeWidth="2" rx="2" />

      {/* Roof fill */}
      <polygon points="52,148 200,56 348,148" fill="#EFF4FF" />
      {/* Roof edges */}
      <polyline points="52,148 200,56 348,148" stroke="#0B1F3A" strokeWidth="2.5" strokeLinejoin="round" />
      <line x1="50" y1="148" x2="350" y2="148" stroke="#0B1F3A" strokeWidth="2.5" />

      {/* Chimney */}
      <rect x="128" y="80" width="24" height="70" fill="white" stroke="#0B1F3A" strokeWidth="1.8" />
      <rect x="123" y="76" width="34" height="7" fill="#0B1F3A" rx="1" />
      {/* Smoke */}
      <path d="M 137 68 C 132 57 141 47 135 35" stroke="#1A56DB" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
      <path d="M 148 68 C 143 55 152 45 146 31" stroke="#1A56DB" strokeWidth="1.5" strokeLinecap="round" opacity="0.22" />

      {/* Left window */}
      <rect x="92" y="173" width="70" height="52" fill="#EFF4FF" stroke="#1A56DB" strokeWidth="1.8" rx="3" />
      <line x1="127" y1="173" x2="127" y2="225" stroke="#1A56DB" strokeWidth="1" opacity="0.55" />
      <line x1="92" y1="199" x2="162" y2="199" stroke="#1A56DB" strokeWidth="1" opacity="0.55" />

      {/* Right window */}
      <rect x="238" y="173" width="70" height="52" fill="#EFF4FF" stroke="#1A56DB" strokeWidth="1.8" rx="3" />
      <line x1="273" y1="173" x2="273" y2="225" stroke="#1A56DB" strokeWidth="1" opacity="0.55" />
      <line x1="238" y1="199" x2="308" y2="199" stroke="#1A56DB" strokeWidth="1" opacity="0.55" />

      {/* Gable circle window */}
      <circle cx="200" cy="103" r="19" fill="#EFF4FF" stroke="#1A56DB" strokeWidth="1.8" />
      <circle cx="200" cy="103" r="8" fill="white" stroke="#1A56DB" strokeWidth="1" />

      {/* Arched door */}
      <path d="M 178 285 L 178 228 Q 178 204 200 204 Q 222 204 222 228 L 222 285 Z"
        fill="#EFF4FF" stroke="#0B1F3A" strokeWidth="1.8" />
      <line x1="200" y1="205" x2="200" y2="285" stroke="#0B1F3A" strokeWidth="1" opacity="0.4" />
      <circle cx="213" cy="252" r="3.5" fill="#1A56DB" />
      <circle cx="187" cy="252" r="3.5" fill="#1A56DB" />

      {/* Steps */}
      <rect x="168" y="280" width="64" height="5" fill="#DBEAFE" stroke="#1A56DB" strokeWidth="1" rx="1" />

      {/* Left tree */}
      <rect x="26" y="218" width="7" height="67" fill="#0B1F3A" opacity="0.18" rx="2" />
      <ellipse cx="30" cy="212" rx="24" ry="22" fill="#EFF4FF" stroke="#1A56DB" strokeWidth="1.5" />
      <ellipse cx="16" cy="228" rx="15" ry="13" fill="#EFF4FF" stroke="#1A56DB" strokeWidth="1" />

      {/* Right tree */}
      <rect x="367" y="218" width="7" height="67" fill="#0B1F3A" opacity="0.18" rx="2" />
      <ellipse cx="371" cy="212" rx="24" ry="22" fill="#EFF4FF" stroke="#1A56DB" strokeWidth="1.5" />
      <ellipse cx="385" cy="228" rx="15" ry="13" fill="#EFF4FF" stroke="#1A56DB" strokeWidth="1" />

      {/* Left bushes */}
      <circle cx="84" cy="283" r="15" fill="#EFF4FF" stroke="#1A56DB" strokeWidth="1.5" />
      <circle cx="63" cy="287" r="11" fill="#EFF4FF" stroke="#1A56DB" strokeWidth="1.2" />

      {/* Right bushes */}
      <circle cx="316" cy="283" r="15" fill="#EFF4FF" stroke="#1A56DB" strokeWidth="1.5" />
      <circle cx="337" cy="287" r="11" fill="#EFF4FF" stroke="#1A56DB" strokeWidth="1.2" />

      {/* Small "FOR RENT" sign in yard */}
      <rect x="240" y="258" width="36" height="22" rx="2" fill="white" stroke="#1A56DB" strokeWidth="1.5" />
      <text x="258" y="267" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="#1A56DB" fontFamily="system-ui">FOR</text>
      <text x="258" y="275" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="#1A56DB" fontFamily="system-ui">RENT</text>
      <line x1="258" y1="280" x2="258" y2="285" stroke="#1A56DB" strokeWidth="1.5" />
    </svg>
  );
}
