import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, Star, Award, Users, MapPin, ArrowRight } from "lucide-react";
import { fetchAgents } from "@/lib/agents";
import { formatPrice } from "@/lib/utils";

export const revalidate = 300;

export const metadata = {
  title: "Our Housing Specialists | Hasker & Co. Realty Group",
  description:
    "Meet the housing specialists at Hasker & Co. Realty Group. Real people helping real families find affordable homes to rent and buy across Virginia Beach, Atlanta, Charlotte, Houston, Dallas, Nashville, Phoenix and more.",
  keywords: [
    "housing specialists Virginia Beach",
    "affordable home rental agents",
    "rental agents Atlanta",
    "housing help near me",
    "affordable homes team",
    "real estate agents Virginia",
    "property specialists Hampton Roads",
    "find a rental agent near me",
  ],
  openGraph: {
    title: "Our Housing Specialists | Hasker & Co. Realty Group",
    description:
      "Real people helping real families find affordable homes. No jargon, no pressure. Just honest, fast service.",
    type: "website",
    url: "https://haskerrealtygroup.com/agents",
  },
  alternates: { canonical: "https://haskerrealtygroup.com/agents" },
};

const teamStats = [
  { value: "35+", label: "Combined Years Experience" },
  { value: "2,000+", label: "Families Housed" },
  { value: "12+", label: "Cities Served" },
  { value: "24hr", label: "Average Response Time" },
];

const teamValues = [
  {
    icon: Star,
    title: "No Commission Pressure",
    description:
      "Our specialists are incentivized to find you the right fit — not the highest-margin unit. We succeed when you&apos;re genuinely happy with your home.",
  },
  {
    icon: Users,
    title: "Local Market Experts",
    description:
      "Our team lives and works in the communities we serve. We know which blocks are quiet, which schools are rated highest, and where you can park.",
  },
  {
    icon: Award,
    title: "Licensed & Accountable",
    description:
      "Every agent is fully licensed with the Virginia Real Estate Board (VREB) and bound by the REALTOR® Code of Ethics.",
  },
  {
    icon: MapPin,
    title: "Multi-City Coverage",
    description:
      "Whether you&apos;re relocating to Atlanta, Charlotte, Houston, or staying local in Virginia Beach — we have a specialist for your market.",
  },
];

const faqs = [
  {
    q: "Do I need to pay an agent fee to use your services?",
    a: "No. Our services are free for renters and buyers. We are compensated through a standard co-brokerage arrangement with the listing owner — you pay nothing out of pocket for working with our team.",
  },
  {
    q: "Can I work with a specific agent I've spoken with before?",
    a: "Absolutely. If you have an existing relationship with one of our specialists, just reference their name when you contact us and we'll make sure they handle your inquiry.",
  },
  {
    q: "What areas do your agents cover?",
    a: "Our main office is in Virginia Beach, VA with active coverage across Hampton Roads. We also help clients relocating to Atlanta, Charlotte, Houston, Dallas, Nashville, Phoenix, and other major markets through our partner network.",
  },
  {
    q: "How quickly can an agent respond to my inquiry?",
    a: "Our standard is within 24 hours on business days — usually much faster. For urgent moves or expiring application deadlines, call us directly and we'll prioritize your case.",
  },
  {
    q: "Can your agents help with both renting and buying?",
    a: "Yes. Most of our specialists handle both rental and purchase transactions. If you're undecided between renting and buying, your agent can walk you through the financial comparison for your specific situation.",
  },
];

const specializations = [
  { title: "Affordable Rentals", description: "Apartments and houses under $1,800/mo across all our markets. We specialize in finding quality units at honest prices." },
  { title: "Family Homes", description: "3+ bedroom homes near top-rated schools with safe neighbourhoods. We know the school district maps better than most principals." },
  { title: "Corporate Relocation", description: "Fast-tracked viewings, virtual tours, and guaranteed move-in timelines for employees relocating on company time." },
  { title: "First-Time Renters", description: "No rental history? We work with first-time renters and help you build the documentation you need for approval." },
  { title: "Section 8 / HCV", description: "Several of our properties accept Housing Choice Vouchers. Our agents know exactly which listings are voucher-friendly." },
  { title: "Pet-Friendly Homes", description: "Over 40% of our listings accept pets. We'll filter your search by pet policy so you only see genuinely pet-welcoming options." },
];

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://haskerrealtygroup.com" },
    { "@type": "ListItem", position: 2, name: "Our Team", item: "https://haskerrealtygroup.com/agents" },
  ],
};

export default async function AgentsPage() {
  const agents = await fetchAgents();

  return (
    <main className="pt-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      {/* Header */}
      <section className="bg-brand-dark pt-16 pb-14 px-6 text-white text-center">
        <p className="text-blue-300 text-xs font-semibold tracking-[0.4em] uppercase mb-4">
          Real People, Real Help
        </p>
        <h1 className="font-serif text-4xl lg:text-5xl font-bold mb-5 max-w-2xl mx-auto">
          Meet Our Housing Specialists
        </h1>
        <p className="text-blue-100 max-w-2xl mx-auto text-base leading-relaxed">
          Our team knows every neighbourhood, every price point, every shortcut. We work for
          families, not commissions, and we find affordable homes fast — in Virginia Beach and
          across 12+ cities nationwide.
        </p>
      </section>

      {/* Stats bar */}
      <div className="bg-brand">
        <div className="max-w-4xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 divide-x divide-white/20 text-white text-center">
          {teamStats.map((s) => (
            <div key={s.label} className="px-4 py-2">
              <p className="font-serif text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-blue-100 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why work with us */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <p className="text-brand text-xs font-semibold tracking-[0.3em] uppercase mb-3">Our Approach</p>
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-brand-dark">
            Why Families Choose Our Team
          </h2>
          <p className="text-neutral-500 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
            There are thousands of real estate agents. Here&apos;s what makes working with ours different.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamValues.map((v) => (
            <div key={v.title} className="text-center">
              <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-4">
                <v.icon size={22} className="text-brand" />
              </div>
              <h3 className="font-serif text-lg font-bold text-brand-dark mb-2">{v.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: v.description }} />
            </div>
          ))}
        </div>
      </section>

      {/* Agents Grid */}
      <section className="bg-neutral-50 border-y border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center mb-12">
            <p className="text-brand text-xs font-semibold tracking-[0.3em] uppercase mb-3">The Team</p>
            <h2 className="font-serif text-3xl font-bold text-brand-dark">Your Housing Specialists</h2>
          </div>

          {agents.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-serif text-xl text-neutral-500">Meet the team soon.</p>
              <p className="text-sm text-neutral-400 mt-2 mb-6">
                Our specialist profiles are being updated. In the meantime, reach us directly.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-brand-dark text-white text-sm font-semibold px-6 py-3 rounded-sm hover:bg-brand transition-colors"
              >
                Contact Us <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="bg-white border border-neutral-100 rounded-sm overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative aspect-[3/2] overflow-hidden bg-brand-muted">
                    {agent.avatar_url ? (
                      <Image
                        src={agent.avatar_url}
                        alt={agent.full_name}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-brand text-white text-5xl font-bold font-serif">
                        {agent.first_name[0]}{agent.last_name[0]}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 to-transparent" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-2xl font-bold text-brand-dark">
                      {agent.full_name}
                    </h3>
                    {agent.agent_profile?.specialties?.[0] && (
                      <p className="text-brand text-xs font-semibold tracking-wide mt-0.5 mb-1">
                        {agent.agent_profile.specialties[0]}
                      </p>
                    )}
                    {agent.agent_profile?.license_number && (
                      <p className="text-xs text-neutral-400 mb-4">
                        Lic# {agent.agent_profile.license_number}
                      </p>
                    )}
                    {agent.agent_profile?.bio && (
                      <p className="text-sm text-neutral-600 leading-relaxed line-clamp-3 mb-5">
                        {agent.agent_profile.bio}
                      </p>
                    )}

                    <div className="grid grid-cols-3 gap-3 mb-5 text-center bg-brand-light rounded-sm p-3">
                      <div>
                        <p className="font-serif text-lg font-bold text-brand-dark">
                          {agent.agent_profile?.years_experience ?? "—"}+
                        </p>
                        <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Years</p>
                      </div>
                      <div>
                        <p className="font-serif text-lg font-bold text-brand-dark">
                          {agent.active_listings}
                        </p>
                        <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Listings</p>
                      </div>
                      <div>
                        <p className="font-serif text-lg font-bold text-brand-dark">
                          {agent.agent_profile?.total_sales
                            ? formatPrice(agent.agent_profile.total_sales, { compact: true })
                            : "—"}
                        </p>
                        <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Volume</p>
                      </div>
                    </div>

                    {(agent.agent_profile?.specialties ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {agent.agent_profile!.specialties.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] tracking-wide bg-brand-light border border-brand-muted text-brand-dark px-2.5 py-1 rounded-sm"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {(agent.agent_profile?.languages ?? []).length > 0 && (
                      <p className="text-xs text-neutral-400 mb-5">
                        Speaks: {agent.agent_profile!.languages.join(", ")}
                      </p>
                    )}

                    <div className="space-y-2 mb-5">
                      {agent.phone && (
                        <a
                          href={`tel:${agent.phone}`}
                          className="flex items-center gap-2 text-sm text-neutral-600 hover:text-brand transition-colors"
                        >
                          <Phone size={13} /> {agent.phone}
                        </a>
                      )}
                      <a
                        href={`mailto:${agent.email}`}
                        className="flex items-center gap-2 text-sm text-neutral-600 hover:text-brand transition-colors"
                      >
                        <Mail size={13} /> {agent.email}
                      </a>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/agents/${agent.id}`}
                        className="flex-1 text-center border border-brand text-brand text-sm font-medium py-3 rounded-sm hover:bg-brand hover:text-white transition-colors"
                      >
                        View Profile
                      </Link>
                      <Link
                        href={`/contact?agent=${agent.id}`}
                        className="flex-1 text-center bg-brand-dark text-white text-sm font-medium py-3 rounded-sm hover:bg-brand transition-colors"
                      >
                        Contact
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Specializations */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <p className="text-brand text-xs font-semibold tracking-[0.3em] uppercase mb-3">Areas of Expertise</p>
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-brand-dark">
            We Specialize In What Matters to You
          </h2>
          <p className="text-neutral-500 mt-4 max-w-lg mx-auto text-sm">
            Not every housing search is the same. Our team is trained in the specific situations
            renters and buyers face most often.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specializations.map((spec) => (
            <div key={spec.title} className="border border-neutral-100 bg-white p-6 rounded-sm hover:border-brand/30 transition-colors">
              <h3 className="font-serif text-lg font-bold text-brand-dark mb-2">{spec.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{spec.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-brand-dark text-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-blue-300 text-xs font-semibold tracking-[0.3em] uppercase mb-3">Common Questions</p>
            <h2 className="font-serif text-3xl font-bold">Working With Our Agents</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="group border border-white/10 rounded-sm overflow-hidden">
                <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none hover:bg-white/5 transition-colors">
                  <span className="font-medium text-sm text-white">{faq.q}</span>
                  <span className="shrink-0 text-blue-300 group-open:rotate-180 transition-transform duration-200">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-5 pt-2 border-t border-white/10">
                  <p className="text-blue-100 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Join the team CTA */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 py-20 text-center">
        <p className="text-brand text-xs font-semibold tracking-[0.3em] uppercase mb-4">Join Us</p>
        <h2 className="font-serif text-3xl lg:text-4xl font-bold text-brand-dark mb-4">
          Are You a Licensed Real Estate Agent?
        </h2>
        <p className="text-neutral-600 text-sm leading-relaxed max-w-xl mx-auto mb-8">
          We&apos;re always looking for motivated specialists who share our commitment to affordable
          housing. If you&apos;re licensed in Virginia or one of our target markets, we&apos;d love to talk.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/careers"
            className="inline-flex items-center gap-2 bg-brand-dark text-white text-sm font-semibold px-7 py-3 rounded-sm hover:bg-brand transition-colors"
          >
            View Careers <ArrowRight size={14} />
          </Link>
          <a
            href="mailto:careers@haskerrealtygroup.com"
            className="inline-flex items-center gap-2 border border-brand-dark text-brand-dark text-sm font-medium px-7 py-3 rounded-sm hover:bg-brand-dark hover:text-white transition-colors"
          >
            <Mail size={14} /> careers@haskerrealtygroup.com
          </a>
        </div>
      </section>
    </main>
  );
}
