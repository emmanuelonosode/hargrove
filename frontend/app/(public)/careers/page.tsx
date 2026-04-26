import Link from "next/link";
import { Mail, MapPin, Clock, TrendingUp, Heart, Users, CheckCircle, ArrowRight } from "lucide-react";
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

      {/* Hero */}
      <section className="bg-brand-dark pt-16 pb-16 px-6 text-white text-center">
        <p className="text-blue-300 text-xs font-semibold tracking-[0.4em] uppercase mb-4">
          Join the Team
        </p>
        <h1 className="font-serif text-4xl lg:text-5xl font-bold mb-5 max-w-2xl mx-auto leading-tight">
          Help Families Find a Place to Call Home
        </h1>
        <p className="text-blue-100 max-w-2xl mx-auto text-base leading-relaxed">
          At Hasker &amp; Co. Realty Group, we believe affordable housing isn&apos;t just a product —
          it&apos;s a mission. We&apos;re a Virginia Beach-based team of real estate professionals who get up
          every day to connect real families with quality, honest-priced homes. If that sounds like
          the work you want to do, read on.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="#open-roles"
            className="inline-flex items-center gap-2 bg-brand px-6 py-3 text-white text-sm font-semibold rounded-sm hover:bg-brand/90 transition-colors"
          >
            View Open Roles <ArrowRight size={15} />
          </a>
          <a
            href="mailto:careers@haskerrealtygroup.com"
            className="inline-flex items-center gap-2 border border-white/30 px-6 py-3 text-white text-sm font-medium rounded-sm hover:border-white/60 transition-colors"
          >
            <Mail size={15} /> careers@haskerrealtygroup.com
          </a>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-brand border-b border-brand/80">
        <div className="max-w-4xl mx-auto px-6 py-5 grid grid-cols-3 divide-x divide-white/20 text-white text-center">
          {[
            { value: "2,000+", label: "Families Housed" },
            { value: "12+", label: "Cities Served" },
            { value: "2012", label: "Founded" },
          ].map((s) => (
            <div key={s.label} className="px-4">
              <p className="font-serif text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-blue-100 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Our Values */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <p className="text-brand text-xs font-semibold tracking-[0.3em] uppercase mb-3">Why Join Us</p>
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-brand-dark">What We Stand For</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((v) => (
            <div key={v.title} className="text-center">
              <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-4">
                <v.icon size={22} className="text-brand" />
              </div>
              <h3 className="font-serif text-lg font-bold text-brand-dark mb-2">{v.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-brand-dark text-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-blue-300 text-xs font-semibold tracking-[0.3em] uppercase mb-3">Compensation & Perks</p>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold">What We Offer</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3">
                <CheckCircle size={16} className="text-brand mt-0.5 shrink-0" />
                <p className="text-blue-100 text-sm leading-relaxed">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section id="open-roles" className="max-w-5xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <p className="text-brand text-xs font-semibold tracking-[0.3em] uppercase mb-3">Now Hiring</p>
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-brand-dark">Open Positions</h2>
          <p className="text-neutral-500 mt-3 max-w-xl mx-auto text-sm">
            All roles are based in Virginia Beach, VA unless noted as hybrid or remote.
            We&apos;re an equal opportunity employer committed to building a diverse team.
          </p>
        </div>

        <div className="space-y-6">
          {openRoles.map((role) => (
            <details
              key={role.id}
              className="group border border-neutral-200 rounded-sm bg-white overflow-hidden"
            >
              <summary className="flex items-start justify-between gap-4 px-7 py-6 cursor-pointer list-none hover:bg-neutral-50 transition-colors">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <span className="text-[10px] font-semibold tracking-widest uppercase bg-brand/10 text-brand px-2.5 py-1 rounded-sm">
                      {role.department}
                    </span>
                    <span className="text-[10px] font-medium text-neutral-400">{role.type}</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-brand-dark group-open:text-brand transition-colors">
                    {role.title}
                  </h3>
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-neutral-400">
                    <MapPin size={12} />
                    {role.location}
                  </div>
                </div>
                <span className="shrink-0 mt-1 text-neutral-400 group-open:rotate-180 transition-transform duration-200">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </summary>

              <div className="px-7 pb-7 pt-2 border-t border-neutral-100">
                <p className="text-sm text-neutral-600 leading-relaxed mb-6">{role.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h4 className="text-xs font-semibold tracking-widest uppercase text-brand-dark mb-3">
                      What You Bring
                    </h4>
                    <ul className="space-y-2">
                      {role.requirements.map((req) => (
                        <li key={req} className="flex items-start gap-2 text-sm text-neutral-600">
                          <CheckCircle size={13} className="text-brand mt-0.5 shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold tracking-widest uppercase text-brand-dark mb-3">
                      What You Get
                    </h4>
                    <ul className="space-y-2">
                      {role.benefits.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-sm text-neutral-600">
                          <CheckCircle size={13} className="text-brand mt-0.5 shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <a
                  href={`mailto:careers@haskerrealtygroup.com?subject=Application: ${encodeURIComponent(role.title)}`}
                  className="inline-flex items-center gap-2 bg-brand-dark text-white text-sm font-semibold px-6 py-3 rounded-sm hover:bg-brand transition-colors"
                >
                  Apply for This Role <ArrowRight size={14} />
                </a>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* How to Apply */}
      <section className="bg-neutral-50 border-y border-neutral-100 py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-brand text-xs font-semibold tracking-[0.3em] uppercase mb-3">Simple Process</p>
          <h2 className="font-serif text-3xl font-bold text-brand-dark mb-5">How to Apply</h2>
          <p className="text-neutral-600 text-sm leading-relaxed mb-10">
            We keep hiring simple. No portals, no 12-page applications. Send your resume and a short
            note about why you want to work with us — that&apos;s it.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
            {[
              { step: "01", title: "Send Your Resume", desc: "Email your resume and a brief note to careers@haskerrealtygroup.com. Put the role title in the subject line." },
              { step: "02", title: "Intro Call", desc: "We'll schedule a 20-minute phone call to learn about you and answer your questions." },
              { step: "03", title: "Interview & Offer", desc: "One or two interviews (depending on role) and a same-week decision. We don't make you wait." },
            ].map((s) => (
              <div key={s.step} className="text-left">
                <span className="font-serif text-4xl font-bold text-brand/20">{s.step}</span>
                <h3 className="font-serif text-base font-bold text-brand-dark mt-1 mb-2">{s.title}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <a
            href="mailto:careers@haskerrealtygroup.com"
            className="inline-flex items-center gap-2 bg-brand-dark text-white text-sm font-semibold px-8 py-4 rounded-sm hover:bg-brand transition-colors"
          >
            <Mail size={15} /> careers@haskerrealtygroup.com
          </a>
        </div>
      </section>

      {/* Location */}
      <section className="max-w-5xl mx-auto px-6 lg:px-8 py-16 flex flex-col md:flex-row gap-10 items-center">
        <div className="flex-1">
          <p className="text-brand text-xs font-semibold tracking-[0.3em] uppercase mb-3">Where We Work</p>
          <h2 className="font-serif text-2xl lg:text-3xl font-bold text-brand-dark mb-4">
            Virginia Beach, VA
          </h2>
          <p className="text-neutral-600 text-sm leading-relaxed mb-4">
            Our main office is located at 213 Bob Ln, Virginia Beach, VA 23454 — right in the heart
            of Hampton Roads. Whether you&apos;re local or considering a move to Virginia Beach, you&apos;ll
            find a great quality of life here: beaches, good schools, and a thriving real estate
            market.
          </p>
          <div className="flex items-start gap-2 text-sm text-neutral-500">
            <MapPin size={14} className="text-brand mt-0.5 shrink-0" />
            213 Bob Ln, Virginia Beach, VA 23454
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-500 mt-2">
            <Clock size={14} className="text-brand shrink-0" />
            Monday – Friday, 9 AM – 6 PM EST
          </div>
        </div>
        <div className="flex-1 bg-brand-dark rounded-sm p-8 text-white text-center">
          <p className="text-blue-200 text-xs font-semibold tracking-widest uppercase mb-3">Don&apos;t See a Fit?</p>
          <h3 className="font-serif text-xl font-bold mb-3">Send a General Application</h3>
          <p className="text-blue-100 text-sm leading-relaxed mb-6">
            If you&apos;re passionate about affordable housing and want to join our team but don&apos;t see
            the right opening, we&apos;d still love to hear from you. Send your resume and tell us what
            you&apos;re looking for.
          </p>
          <a
            href="mailto:careers@haskerrealtygroup.com?subject=General Application"
            className="inline-flex items-center gap-2 bg-brand text-white text-sm font-semibold px-6 py-3 rounded-sm hover:bg-brand/80 transition-colors"
          >
            <Mail size={14} /> Get in Touch
          </a>
        </div>
      </section>
    </main>
  );
}
