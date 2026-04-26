import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Clock, TrendingUp, Heart, Users, CheckCircle, ArrowRight, Award } from "lucide-react";
import type { Metadata } from "next";

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
    id: "real-estate-agent",
    title: "Licensed Real Estate Agent",
    type: "Full-Time",
    location: "Virginia Beach, VA",
    department: "Sales",
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
    icon: Heart,
    title: "People First",
    description:
      "We measure success by how many families we house, not how many deals we close. Every decision starts with the question: does this help our tenants?",
  },
  {
    icon: CheckCircle,
    title: "Honest Always",
    description:
      "No hidden fees, no jargon, no runaround. We treat every tenant the way we'd want to be treated — with transparency and respect.",
  },
  {
    icon: TrendingUp,
    title: "Grow With Us",
    description:
      "We invest in our team's development. Whether it's a license sponsorship, a training stipend, or a clear promotion path, we want you to advance.",
  },
  {
    icon: Users,
    title: "Real Community",
    description:
      "We're a small, tight-knit team. No corporate bureaucracy, no anonymous org chart. You'll know your colleagues and your impact.",
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

const lifeImages = [
  { src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80", alt: "Team collaboration at Hasker & Co." },
  { src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80", alt: "Modern office workspace" },
  { src: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80", alt: "Professional real estate team" },
];

// JSON-LD: BreadcrumbList
const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://haskerrealtygroup.com" },
    { "@type": "ListItem", position: 2, name: "Careers", item: "https://haskerrealtygroup.com/careers" },
  ],
};

// JSON-LD: JobPosting entries
const jobPostings = openRoles.map((role) => ({
  "@context": "https://schema.org",
  "@type": "JobPosting",
  title: role.title,
  description: role.description,
  identifier: { "@type": "PropertyValue", name: "Hasker & Co. Realty Group", value: role.id },
  datePosted: "2025-01-01",
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
    <main className="pt-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {jobPostings.map((jp, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jp) }} />
      ))}

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[600px] lg:min-h-[680px] flex items-end overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=80"
          alt="Hasker & Co. Realty Group team at work"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/75 to-brand-dark/30" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 pb-16 pt-32">
          <p className="text-brand text-xs font-semibold tracking-[0.35em] uppercase mb-4">
            Now Hiring · Virginia Beach, VA
          </p>
          <h1 className="font-serif text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.05] mb-6 max-w-3xl">
            Help Families Find&nbsp;a Place to Call Home
          </h1>
          <p className="text-blue-100 text-lg lg:text-xl max-w-xl leading-relaxed mb-10">
            We&apos;re a Virginia Beach real estate team on a mission — affordable homes, honest prices,
            real people. If that&apos;s the work you want to do, we want to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#open-roles"
              className="inline-flex items-center justify-center gap-2 bg-brand px-8 py-4 text-white text-sm font-semibold rounded-sm hover:bg-brand/90 transition-colors"
            >
              View Open Roles <ArrowRight size={15} />
            </a>
            <a
              href="mailto:careers@haskerrealtygroup.com"
              className="inline-flex items-center justify-center gap-2 border border-white/30 px-8 py-4 text-white text-sm font-medium rounded-sm hover:bg-white/10 hover:border-white/60 transition-colors"
            >
              <Mail size={15} /> careers@haskerrealtygroup.com
            </a>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      <div className="bg-brand">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-3 divide-x divide-white/20 text-white text-center">
            {[
              { value: "2,000+", label: "Families Housed" },
              { value: "12+", label: "Cities Served" },
              { value: "Since 2012", label: "Building Trust" },
            ].map((s) => (
              <div key={s.label} className="px-4 py-6">
                <p className="font-serif text-2xl lg:text-3xl font-bold">{s.value}</p>
                <p className="text-xs text-blue-100 mt-1 tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── OUR VALUES ────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
        <div className="max-w-xl mb-16">
          <p className="text-brand text-xs font-semibold tracking-[0.35em] uppercase mb-4">Why Join Us</p>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-brand-dark leading-tight">
            Work That Actually Matters
          </h2>
          <p className="text-neutral-500 mt-5 text-base leading-relaxed">
            Housing is one of the most fundamental human needs. Every home we help someone find
            is a family with stability, safety, and a foundation to build from.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {values.map((v, i) => (
            <div
              key={v.title}
              className="group"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-14 h-14 rounded-sm bg-brand/8 border border-brand/15 flex items-center justify-center mb-5 group-hover:bg-brand group-hover:border-brand transition-colors duration-300">
                <v.icon size={22} className="text-brand group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-serif text-xl font-bold text-brand-dark mb-3">{v.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── LIFE AT HASKER — image gallery strip ─────────────────────────── */}
      <section className="bg-neutral-50 border-y border-neutral-100 py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-10">
          <p className="text-brand text-xs font-semibold tracking-[0.35em] uppercase mb-3">Life at Hasker</p>
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-brand-dark">A Team You&apos;ll Be Proud to Be Part Of</h2>
        </div>
        <div className="flex gap-4 px-6 lg:px-8 overflow-x-auto pb-2 scrollbar-hide">
          {lifeImages.map((img, i) => (
            <div key={i} className="relative flex-shrink-0 w-[320px] lg:w-[420px] aspect-[4/3] rounded-sm overflow-hidden bg-neutral-200">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
                sizes="420px"
              />
            </div>
          ))}
          {/* Warm lifestyle real estate image */}
          <div className="relative flex-shrink-0 w-[320px] lg:w-[420px] aspect-[4/3] rounded-sm overflow-hidden bg-neutral-200">
            <Image
              src="https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&q=80"
              alt="Happy family in their new home"
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
              sizes="420px"
            />
          </div>
        </div>
      </section>

      {/* ── BENEFITS — split layout ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Image */}
          <div className="relative aspect-[4/3] rounded-sm overflow-hidden bg-neutral-100 order-2 lg:order-1">
            <Image
              src="https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=1000&q=80"
              alt="Welcoming office environment at Hasker & Co."
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Award badge overlay */}
            <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-sm px-5 py-4 shadow-xl">
              <div className="flex items-center gap-3">
                <Award size={20} className="text-brand" />
                <div>
                  <p className="text-xs font-bold text-brand-dark">Top Workplace</p>
                  <p className="text-xs text-neutral-500">Hampton Roads 2024</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <p className="text-brand text-xs font-semibold tracking-[0.35em] uppercase mb-4">Compensation & Perks</p>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-brand-dark leading-tight mb-8">
              We Invest in the People Who Invest in Others
            </h2>
            <ul className="space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3.5">
                  <div className="w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle size={12} className="text-brand" />
                  </div>
                  <p className="text-neutral-700 text-sm leading-relaxed">{benefit}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── OPEN ROLES ────────────────────────────────────────────────────── */}
      <section id="open-roles" className="bg-neutral-50 border-y border-neutral-100">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
          <div className="mb-16">
            <p className="text-brand text-xs font-semibold tracking-[0.35em] uppercase mb-4">Now Hiring</p>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-brand-dark leading-tight">Open Positions</h2>
            <p className="text-neutral-500 mt-5 max-w-xl text-sm leading-relaxed">
              All roles are based in Virginia Beach, VA unless noted as hybrid or remote.
              Equal opportunity employer committed to a diverse, inclusive team.
            </p>
          </div>

          <div className="space-y-4">
            {openRoles.map((role) => (
              <details
                key={role.id}
                className="group border border-neutral-200 rounded-sm bg-white overflow-hidden hover:border-brand/40 transition-colors duration-200"
              >
                <summary className="flex items-start justify-between gap-6 px-7 py-6 cursor-pointer list-none hover:bg-neutral-50/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5 mb-2">
                      <span className="text-[9px] font-bold tracking-[0.15em] uppercase bg-brand/10 text-brand px-3 py-1 rounded-sm">
                        {role.department}
                      </span>
                      <span className="text-[10px] font-medium text-neutral-400 tracking-wide">{role.type}</span>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-brand-dark group-open:text-brand transition-colors leading-snug">
                      {role.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-neutral-400">
                      <MapPin size={11} />
                      {role.location}
                    </div>
                  </div>
                  <div className="shrink-0 w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center mt-1 group-open:border-brand group-open:bg-brand transition-colors duration-200">
                    <svg
                      width="12" height="12" viewBox="0 0 12 12" fill="none"
                      className="text-neutral-400 group-open:text-white group-open:rotate-180 transition-all duration-200"
                    >
                      <path d="M2 4.5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </summary>

                <div className="px-7 pb-8 pt-1 border-t border-neutral-100">
                  <p className="text-sm text-neutral-600 leading-relaxed mb-8 mt-4 max-w-2xl">{role.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
                    <div>
                      <h4 className="text-[10px] font-bold tracking-[0.15em] uppercase text-brand-dark mb-4 flex items-center gap-2">
                        <span className="w-4 h-0.5 bg-brand inline-block" />
                        What You Bring
                      </h4>
                      <ul className="space-y-2.5">
                        {role.requirements.map((req) => (
                          <li key={req} className="flex items-start gap-2.5 text-sm text-neutral-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand shrink-0 mt-1.5" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold tracking-[0.15em] uppercase text-brand-dark mb-4 flex items-center gap-2">
                        <span className="w-4 h-0.5 bg-brand inline-block" />
                        What You Get
                      </h4>
                      <ul className="space-y-2.5">
                        {role.benefits.map((b) => (
                          <li key={b} className="flex items-start gap-2.5 text-sm text-neutral-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand shrink-0 mt-1.5" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <a
                    href={`mailto:careers@haskerrealtygroup.com?subject=Application: ${encodeURIComponent(role.title)}`}
                    className="inline-flex items-center gap-2 bg-brand-dark text-white text-sm font-semibold px-7 py-3.5 rounded-sm hover:bg-brand transition-colors duration-200"
                  >
                    Apply for This Role <ArrowRight size={14} />
                  </a>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW TO APPLY ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-brand text-xs font-semibold tracking-[0.35em] uppercase mb-4">Simple Process</p>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-brand-dark leading-tight mb-6">
              Three Steps to Joining Us
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed mb-12">
              No portals, no 12-page forms. Send your resume and a short note about why you want
              to work with us — that&apos;s it. We keep hiring human.
            </p>

            <div className="space-y-10">
              {[
                {
                  step: "01",
                  title: "Send Your Resume",
                  desc: "Email your resume and a brief note to careers@haskerrealtygroup.com. Put the role title in the subject line.",
                },
                {
                  step: "02",
                  title: "Intro Call",
                  desc: "We'll schedule a 20-minute call to learn about you, answer your questions, and tell you more about the role and culture.",
                },
                {
                  step: "03",
                  title: "Interview & Offer",
                  desc: "One or two interviews (depending on role) and a decision within the same week. We don't make you wait.",
                },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-6">
                  <span className="font-serif text-5xl font-bold text-brand/15 leading-none shrink-0 w-14">{s.step}</span>
                  <div className="pt-1">
                    <h3 className="font-serif text-lg font-bold text-brand-dark mb-1.5">{s.title}</h3>
                    <p className="text-sm text-neutral-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA card */}
          <div className="relative rounded-sm overflow-hidden bg-brand-dark text-white p-10 lg:p-12">
            {/* Background image */}
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1000&q=80"
                alt="Welcoming home exterior"
                fill
                className="object-cover opacity-20"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="relative z-10">
              <p className="text-blue-200 text-xs font-semibold tracking-[0.35em] uppercase mb-4">Ready?</p>
              <h3 className="font-serif text-3xl lg:text-4xl font-bold mb-5 leading-tight">
                Let&apos;s Build Something Together
              </h3>
              <p className="text-blue-100 text-sm leading-relaxed mb-8">
                Whether you&apos;re a seasoned real estate professional or just starting out, we&apos;d love
                to have a conversation. Send us your resume — no cover letter required.
              </p>
              <a
                href="mailto:careers@haskerrealtygroup.com"
                className="inline-flex items-center gap-2.5 bg-brand text-white text-sm font-semibold px-7 py-4 rounded-sm hover:bg-brand/90 transition-colors"
              >
                <Mail size={15} />
                careers@haskerrealtygroup.com
              </a>

              <div className="mt-10 pt-8 border-t border-white/15 flex items-center gap-3 text-sm text-blue-200">
                <MapPin size={14} className="text-brand shrink-0" />
                213 Bob Ln, Virginia Beach, VA 23454
              </div>
              <div className="flex items-center gap-3 mt-3 text-sm text-blue-200">
                <Clock size={14} className="text-brand shrink-0" />
                Mon – Fri, 9 AM – 6 PM EST
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DON'T SEE A FIT ───────────────────────────────────────────────── */}
      <section className="border-t border-neutral-100">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-20 text-center">
          <h2 className="font-serif text-3xl font-bold text-brand-dark mb-4">Don&apos;t See the Right Role?</h2>
          <p className="text-neutral-500 text-sm leading-relaxed max-w-lg mx-auto mb-8">
            If you&apos;re passionate about affordable housing and want to be part of our team, send a
            general application. We keep strong resumes on file and reach out when new roles open.
          </p>
          <a
            href="mailto:careers@haskerrealtygroup.com?subject=General Application"
            className="inline-flex items-center gap-2 border border-brand-dark text-brand-dark text-sm font-semibold px-8 py-4 rounded-sm hover:bg-brand-dark hover:text-white transition-colors duration-200"
          >
            <Mail size={15} /> Send a General Application
          </a>
        </div>
      </section>
    </main>
  );
}
