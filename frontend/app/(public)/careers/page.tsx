import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Clock, ArrowRight, CheckCircle } from "lucide-react";
import type { Metadata } from "next";
import { CareerApplicationForm } from "@/components/public/CareerApplicationForm";

export const metadata: Metadata = {
  title: "Careers at Hasker & Co. Realty Group | Join Our Team",
  description:
    "Build a meaningful career helping families find affordable homes. Join Hasker & Co. Realty Group — we're hiring real estate agents, leasing consultants, property managers, and more across Virginia Beach and beyond.",
  keywords: [
    "real estate careers Virginia Beach",
    "real estate agent jobs Virginia Beach",
    "property management careers",
    "leasing consultant jobs",
    "affordable housing jobs",
    "real estate jobs Virginia",
    "join realty group",
    "real estate employment",
  ],
  openGraph: {
    title: "Careers at Hasker & Co. Realty Group",
    description:
      "Join a team that helps real families find affordable homes. View open positions and apply today.",
    type: "website",
    url: "https://haskerrealtygroup.com/careers",
  },
  alternates: { canonical: "https://haskerrealtygroup.com/careers" },
};

const openRoles = [
  {
    id: "remote-listing-specialist",
    title: "Remote Listing & Client Communication Specialist",
    type: "Full-Time · Remote",
    location: "Remote — US (all time zones)",
    department: "Client Services",
    featured: true,
    urgent: true,
    description:
      "We are actively hiring for this role and need someone who can start quickly. You will manage property listings across all 12 of our markets — writing descriptions, updating availability, coordinating photos — while handling all inbound client and tenant inquiries via email, phone, and our portal. This is a high-autonomy, fully remote position that sits at the center of everything we do. If you are organized, a strong communicator, and comfortable working independently without micromanagement, this role was built for you.",
    requirements: [
      "2+ years in a remote client-facing role (real estate, property management, or customer success preferred)",
      "Excellent written communication — you write clearly and respond quickly",
      "Comfortable managing a high volume of inbound inquiries across multiple channels",
      "Experience with CRM software or property management platforms",
      "Highly organized with strong attention to listing accuracy and detail",
      "Reliable internet connection and a dedicated home workspace",
    ],
    benefits: [
      "Fully remote, flexible schedule",
      "Competitive base salary + performance bonuses",
      "Full health and dental benefits",
      "Home office equipment stipend",
      "Direct access to senior leadership — no corporate layers",
    ],
  },
  {
    id: "real-estate-agent",
    title: "Licensed Real Estate Agent",
    type: "Full-Time",
    location: "Virginia Beach, VA",
    department: "Sales",
    urgent: true,
    description:
      "Represent buyers and renters in finding their perfect affordable home. You'll manage client relationships from first inquiry through move-in, conduct property showings, and close transactions with integrity.",
    requirements: [
      "Active Virginia real estate license (or willing to obtain within 90 days)",
      "Strong local market knowledge in Hampton Roads or willingness to learn",
      "Excellent written and verbal communication skills",
      "Self-motivated with ability to manage your own pipeline",
      "CRM experience a plus",
    ],
    benefits: ["Competitive commission splits", "Health benefits after 90 days", "Marketing support & leads provided", "Flexible schedule"],
  },
  {
    id: "leasing-consultant",
    title: "Leasing Consultant",
    type: "Full-Time",
    location: "Virginia Beach, VA",
    department: "Leasing",
    urgent: true,
    description:
      "Be the first impression for prospective tenants. You'll conduct showings, qualify applicants, process rental applications, and guide tenants through move-in. This role is perfect for a people-person who loves matching families with their next home.",
    requirements: [
      "1+ year of customer service, sales, or leasing experience",
      "Strong interpersonal skills and patience",
      "Basic proficiency with property management software (training provided)",
      "Virginia driver's license and reliable transportation",
      "Real estate license preferred but not required",
    ],
    benefits: ["Base salary + leasing bonuses", "Health & dental benefits", "Paid time off", "Real estate license sponsorship available"],
  },
  {
    id: "property-manager",
    title: "Property Manager",
    type: "Full-Time",
    location: "Virginia Beach, VA",
    department: "Operations",
    description:
      "Oversee a portfolio of residential rental properties from day-to-day operations to tenant relations. You'll handle maintenance coordination, lease renewals, rent collection, and inspections while ensuring our tenants have a great experience.",
    requirements: [
      "3+ years in residential property management",
      "Experience with lease administration and tenant relations",
      "Familiarity with Virginia landlord-tenant law",
      "Organized, detail-oriented, and calm under pressure",
      "Virginia real estate license preferred",
    ],
    benefits: ["Competitive salary", "Performance bonuses", "Company vehicle allowance", "Full health benefits package"],
  },
  {
    id: "marketing-coordinator",
    title: "Marketing Coordinator",
    type: "Full-Time",
    location: "Virginia Beach, VA (Hybrid)",
    department: "Marketing",
    description:
      "Drive our online presence and tenant acquisition through content, SEO, social media, and digital campaigns. You'll write property descriptions, manage our blog, create social content, and track what's working.",
    requirements: [
      "2+ years of digital marketing experience",
      "Strong copywriting skills — you can write for real people, not robots",
      "Experience with SEO fundamentals and content strategy",
      "Proficiency with social media platforms and scheduling tools",
      "Real estate or property management experience is a big plus",
    ],
    benefits: ["Salary commensurate with experience", "Remote flexibility", "Health benefits", "Creative autonomy"],
  },
  {
    id: "maintenance-technician",
    title: "Maintenance Technician",
    type: "Full-Time",
    location: "Virginia Beach, VA",
    department: "Maintenance",
    description:
      "Keep our properties in top condition for the families who call them home. You'll handle work orders, preventive maintenance, unit turns, and emergency repairs across our residential portfolio.",
    requirements: [
      "3+ years of residential maintenance experience",
      "Skills in plumbing, electrical, HVAC, and general carpentry",
      "Ability to troubleshoot and resolve issues independently",
      "Valid Virginia driver's license",
      "EPA 608 certification preferred",
    ],
    benefits: ["Competitive hourly rate + overtime", "Company van & tools provided", "Health benefits", "On-call rotation with pay premium"],
  },
  {
    id: "tenant-relations-specialist",
    title: "Tenant Relations Specialist",
    type: "Full-Time",
    location: "Virginia Beach, VA",
    department: "Operations",
    description:
      "Be the voice our tenants trust. You'll handle inbound tenant inquiries, coordinate maintenance requests, manage lease renewals, and resolve disputes with empathy and professionalism.",
    requirements: [
      "2+ years in a customer-facing role",
      "Experience with conflict resolution",
      "Comfortable working in a fast-paced, multi-tasking environment",
      "Strong written communication — email and tenant portal responses",
      "Property management software experience a plus",
    ],
    benefits: ["Competitive salary", "Monday–Friday schedule", "Health benefits after 60 days", "Paid training"],
  },
];

const values = [
  {
    num: "01",
    title: "People First",
    description:
      "We measure success by how many families we house, not how many deals we close. Every decision starts with: does this help our tenants?",
  },
  {
    num: "02",
    title: "Honest Always",
    description:
      "No hidden fees, no jargon, no runaround. We treat every tenant the way we'd want to be treated — with transparency and respect.",
  },
  {
    num: "03",
    title: "Grow With Us",
    description:
      "We invest in our team's development. License sponsorship, training stipends, clear promotion paths — we want you to advance.",
  },
  {
    num: "04",
    title: "Real Community",
    description:
      "A small, tight-knit team. No corporate bureaucracy, no anonymous org chart. You'll know your colleagues and your impact.",
  },
];

const benefits = [
  "Competitive compensation (salary or commission depending on role)",
  "Health, dental, and vision insurance",
  "Paid time off + holidays",
  "Flexible / hybrid schedules for applicable roles",
  "Real estate license sponsorship (exam fees covered)",
  "Continuing education reimbursement",
  "Company vehicle or mileage reimbursement for field roles",
  "Monthly team lunches and quarterly outings",
];

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://haskerrealtygroup.com" },
    { "@type": "ListItem", position: 2, name: "Careers", item: "https://haskerrealtygroup.com/careers" },
  ],
};

const jobPostings = openRoles.map((role) => ({
  "@context": "https://schema.org",
  "@type": "JobPosting",
  title: role.title,
  description: role.description,
  identifier: { "@type": "PropertyValue", name: "Hasker & Co. Realty Group", value: role.id },
  datePosted: new Date().toISOString().split("T")[0],
  employmentType: role.type === "Full-Time" ? "FULL_TIME" : "PART_TIME",
  hiringOrganization: {
    "@type": "Organization",
    name: "Hasker & Co. Realty Group",
    sameAs: "https://haskerrealtygroup.com",
    logo: "https://haskerrealtygroup.com/icon.png",
  },
  jobLocation: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      streetAddress: "213 Bob Ln",
      addressLocality: "Virginia Beach",
      addressRegion: "VA",
      postalCode: "23454",
      addressCountry: "US",
    },
  },
  applicantLocationRequirements: { "@type": "Country", name: "US" },
  jobBenefits: role.benefits.join(", "),
  skills: role.requirements.join("; "),
}));

export default function CareersPage() {
  return (
    <main className="pt-20 bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {jobPostings.map((jp, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jp) }} />
      ))}

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex flex-col justify-end overflow-hidden bg-brand-dark">
        <Image
          src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=80"
          alt="Hasker & Co. Realty Group team at work"
          fill
          priority
          className="object-cover object-center opacity-30"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-brand-dark/30" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-16 lg:pb-24 pt-16 w-full">
          <p className="text-brand text-xs font-semibold tracking-[0.35em] uppercase mb-4">
            Now Hiring · Virginia Beach
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-5 max-w-3xl">
            Help Families Find a Place to Call Home
          </h1>
          <p className="text-white/60 text-base max-w-xl leading-relaxed mb-8">
            Affordable homes, honest prices, real people. If that&apos;s the work you want to do,
            we want to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <a
              href="#open-roles"
              className="inline-flex items-center gap-2.5 bg-brand text-white text-sm font-semibold px-7 py-3.5 rounded-sm hover:bg-brand/90 transition-colors duration-200"
            >
              View Open Roles
              <ArrowRight size={15} />
            </a>
            <a
              href="mailto:careers@haskerrealtygroup.com"
              className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors duration-200"
            >
              <Mail size={14} />
              careers@haskerrealtygroup.com
            </a>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative z-10 border-t border-white/10 bg-white/[0.04]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-3 divide-x divide-white/10">
              {[
                { value: "2,000+", label: "Families Housed" },
                { value: "12+", label: "Cities Served" },
                { value: "Since 2012", label: "Building Trust" },
              ].map((s) => (
                <div key={s.label} className="px-4 sm:px-8 py-5 text-center">
                  <p className="font-serif text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-[11px] text-white/40 mt-1 tracking-widest uppercase">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── OUR VALUES ───────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14 pb-8 border-b border-neutral-100">
          <div>
            <p className="text-brand text-xs font-semibold tracking-[0.35em] uppercase mb-3">Why Join Us</p>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-brand-dark leading-tight max-w-lg">
              Work That Actually Matters
            </h2>
          </div>
          <p className="text-neutral-500 text-sm leading-relaxed max-w-sm">
            Housing is one of the most fundamental human needs. Every home we help someone find is
            a family with stability, safety, and a foundation to build from.
          </p>
        </div>

        <div className="divide-y divide-neutral-100">
          {values.map((v) => (
            <div
              key={v.title}
              className="group grid grid-cols-[4rem_1fr] lg:grid-cols-[5rem_1fr_2fr] gap-6 lg:gap-12 py-8 hover:bg-neutral-50/60 transition-colors duration-200 -mx-3 px-3 cursor-default"
            >
              <span className="font-serif text-3xl font-bold text-neutral-200 group-hover:text-brand/25 transition-colors duration-200 leading-none pt-1 select-none">
                {v.num}
              </span>
              <h3 className="font-serif text-xl font-bold text-brand-dark leading-snug self-start pt-0.5">
                {v.title}
              </h3>
              <p className="text-sm text-neutral-500 leading-relaxed hidden lg:block self-start pt-1">
                {v.description}
              </p>
              <p className="text-sm text-neutral-500 leading-relaxed col-span-2 lg:hidden mt-2">
                {v.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BENEFITS ─────────────────────────────────────────────────────── */}
      <section className="bg-[#F5F5F7] border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            {/* Left */}
            <div className="lg:sticky lg:top-28">
              <p className="text-brand text-xs font-semibold tracking-[0.35em] uppercase mb-3">
                Compensation & Perks
              </p>
              <h2 className="font-serif text-4xl lg:text-5xl font-bold text-brand-dark leading-tight mb-8">
                We Invest in the People Who Invest in Others
              </h2>
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-neutral-200">
                <Image
                  src="https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=1000&q=80"
                  alt="Welcoming office environment at Hasker & Co."
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-brand text-white px-6 py-3.5 flex items-center justify-between">
                  <p className="text-xs font-bold tracking-wide">Top Workplace · Hampton Roads</p>
                  <p className="text-xs text-white/70 font-medium">2024</p>
                </div>
              </div>
            </div>

            {/* Right: benefits list */}
            <div className="pt-0 lg:pt-14">
              <ul className="divide-y divide-neutral-200">
                {benefits.map((benefit, i) => (
                  <li key={benefit} className="flex items-start gap-4 py-5 group">
                    <CheckCircle
                      size={16}
                      className="text-brand shrink-0 mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
                    />
                    <p className="text-sm text-neutral-700 leading-relaxed group-hover:text-brand-dark transition-colors duration-150">
                      {benefit}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── OPEN ROLES ───────────────────────────────────────────────────── */}
      <section id="open-roles" className="bg-brand-dark">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14 pb-8 border-b border-white/10">
            <div>
              <p className="text-brand text-xs font-semibold tracking-[0.35em] uppercase mb-3">Now Hiring</p>
              <h2 className="font-serif text-4xl lg:text-5xl font-bold text-white leading-tight">
                Open Positions
              </h2>
            </div>
            <p className="text-white/30 text-xs leading-relaxed max-w-xs sm:text-right">
              Virginia Beach, VA · Equal opportunity employer committed to a diverse, inclusive team.
            </p>
          </div>

          <div className="divide-y divide-white/[0.08]">
            {openRoles.map((role) => (
              <details
                key={role.id}
                className={`group overflow-hidden ${"featured" in role && role.featured ? "bg-brand/[0.06] -mx-4 px-4 rounded-sm" : ""}`}
              >
                <summary className="flex items-center justify-between gap-6 py-6 cursor-pointer list-none hover:opacity-90 transition-opacity">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-brand border border-brand/30 px-2.5 py-0.5 rounded-sm">
                        {role.department}
                      </span>
                      {"featured" in role && role.featured && (
                        <span className="text-[9px] font-bold tracking-[0.2em] uppercase bg-amber-500 text-white px-2.5 py-0.5 rounded-sm">
                          Featured
                        </span>
                      )}
                      {"urgent" in role && role.urgent && (
                        <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-red-400 border border-red-400/30 px-2.5 py-0.5 rounded-sm">
                          Urgently Hiring
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-lg lg:text-xl font-bold text-white group-open:text-brand transition-colors leading-snug">
                      {role.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-white/30">
                      <span className="flex items-center gap-1">
                        <MapPin size={10} />
                        {role.location}
                      </span>
                      <span className="text-white/20">·</span>
                      <span>{role.type}</span>
                    </div>
                  </div>

                  <div className="shrink-0 w-8 h-8 border border-white/15 rounded-sm flex items-center justify-center group-open:border-brand group-open:bg-brand transition-colors duration-200">
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M6 1v10M1 6h10"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        className="text-white/40 group-open:opacity-0 transition-opacity duration-200"
                      />
                      <path
                        d="M1 6h10"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        className="text-white opacity-0 group-open:opacity-100 transition-opacity duration-200"
                      />
                    </svg>
                  </div>
                </summary>

                <div className="pb-10 border-t border-white/[0.07]">
                  <p className="text-sm text-white/50 leading-relaxed mb-8 mt-6 max-w-2xl">
                    {role.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand mb-4">
                        What You Bring
                      </h4>
                      <ul className="space-y-3">
                        {role.requirements.map((req) => (
                          <li key={req} className="flex items-start gap-3 text-sm text-white/50">
                            <span className="w-1 h-1 rounded-full bg-brand/50 shrink-0 mt-2" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand mb-4">
                        What You Get
                      </h4>
                      <ul className="space-y-3">
                        {role.benefits.map((b) => (
                          <li key={b} className="flex items-start gap-3 text-sm text-white/50">
                            <span className="w-1 h-1 rounded-full bg-brand/50 shrink-0 mt-2" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <CareerApplicationForm roleId={role.id} roleTitle={role.title} />
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW TO APPLY ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-brand text-xs font-semibold tracking-[0.35em] uppercase mb-3">Simple Process</p>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-brand-dark leading-tight mb-5">
              Three Steps to Joining Us
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed mb-14 max-w-sm">
              No portals, no 12-page forms. Send your resume and a short note about why you want to
              work with us — that&apos;s it. We keep hiring human.
            </p>

            <div className="divide-y divide-neutral-100">
              {[
                {
                  step: "01",
                  title: "Fill In the Form",
                  desc: "Open any role, hit Apply, fill in a short form — name, contact, a few questions, and a brief note. No cover letter required.",
                },
                {
                  step: "02",
                  title: "Intro Call",
                  desc: "We'll schedule a 20-minute call to learn about you, answer your questions, and tell you more about the role and culture.",
                },
                {
                  step: "03",
                  title: "Interview & Offer",
                  desc: "One or two interviews and a decision within the same week. We review every application within 2–3 business days.",
                },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-7 py-7 group">
                  <span className="font-serif text-4xl font-bold text-neutral-150 group-hover:text-brand/20 transition-colors duration-200 leading-none shrink-0 w-12 select-none text-neutral-200">
                    {s.step}
                  </span>
                  <div className="pt-1">
                    <h3 className="font-serif text-lg font-bold text-brand-dark mb-1.5">{s.title}</h3>
                    <p className="text-sm text-neutral-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA card */}
          <div className="relative overflow-hidden bg-brand-dark rounded-sm lg:sticky lg:top-28">
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1000&q=80"
                alt="Welcoming home exterior"
                fill
                className="object-cover opacity-10"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="relative z-10 p-10 lg:p-12">
              <p className="text-brand text-xs font-semibold tracking-[0.35em] uppercase mb-4">Ready?</p>
              <h3 className="font-serif text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                Let&apos;s Build Something Together
              </h3>
              <p className="text-white/50 text-sm leading-relaxed mb-8">
                Whether you&apos;re a seasoned real estate professional or just starting out, we&apos;d love
                a conversation. Send us your resume — no cover letter required.
              </p>
              <a
                href="mailto:careers@haskerrealtygroup.com"
                className="inline-flex items-center gap-2.5 bg-brand text-white text-sm font-semibold px-7 py-3.5 rounded-sm hover:bg-brand/90 transition-colors duration-200"
              >
                <Mail size={14} />
                careers@haskerrealtygroup.com
              </a>

              <div className="mt-10 pt-8 border-t border-white/10 space-y-3">
                <div className="flex items-center gap-3 text-sm text-white/30">
                  <MapPin size={12} className="text-brand shrink-0" />
                  213 Bob Ln, Virginia Beach, VA 23454
                </div>
                <div className="flex items-center gap-3 text-sm text-white/30">
                  <Clock size={12} className="text-brand shrink-0" />
                  Mon – Fri, 9 AM – 6 PM EST
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DON'T SEE A FIT ──────────────────────────────────────────────── */}
      <section className="border-t border-neutral-100 bg-[#F5F5F7]">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 py-20 lg:py-28 text-center">
          <p className="text-brand text-xs font-semibold tracking-[0.35em] uppercase mb-4">Open Application</p>
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-brand-dark mb-4 leading-tight">
            Don&apos;t See the Right Role?
          </h2>
          <p className="text-neutral-500 text-sm leading-relaxed max-w-md mx-auto mb-2">
            If you&apos;re passionate about affordable housing and want to be part of our team,
            send a general application. We keep strong candidates on file and reach out when new
            roles open.
          </p>
          <CareerApplicationForm roleId="general" roleTitle="General Application" />
        </div>
      </section>
    </main>
  );
}
