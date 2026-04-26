import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, Star, Award, Users, MapPin, ArrowRight, Quote } from "lucide-react";
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
  { value: "24 hr", label: "Average Response Time" },
];

const teamValues = [
  {
    icon: Star,
    title: "No Commission Pressure",
    description:
      "Our specialists are incentivized to find you the right fit — not the highest-margin unit. We succeed when you're genuinely happy with your home.",
  },
  {
    icon: Users,
    title: "Local Market Experts",
    description:
      "Our team lives and works in the communities we serve. We know which blocks are quiet, which schools are top-rated, and where you can park.",
  },
  {
    icon: Award,
    title: "Licensed & Accountable",
    description:
      "Every agent is fully licensed with the Virginia Real Estate Board and bound by the REALTOR® Code of Ethics.",
  },
  {
    icon: MapPin,
    title: "Multi-City Coverage",
    description:
      "Whether you're relocating to Atlanta, Charlotte, Houston, or staying local in Virginia Beach — we have a specialist for your market.",
  },
];

const testimonials = [
  {
    quote: "Our specialist found us a 3-bedroom in Katy under $1,400 within two weeks. I kept waiting for the hidden fees — there weren't any.",
    name: "Deja M.",
    city: "Houston, TX",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=80",
  },
  {
    quote: "I had bad rental history and no one would work with me. The team here took the time to understand my situation and found a landlord willing to give me a chance.",
    name: "Marcus T.",
    city: "Atlanta, GA",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  },
  {
    quote: "We relocated from Seattle with two kids and a dog. Our specialist handled everything remotely — virtual tour, digital lease, the works. We moved in before our furniture arrived.",
    name: "Priya & Arun K.",
    city: "Charlotte, NC",
    image: "https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=200&q=80",
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
  { title: "Affordable Rentals", description: "Apartments and houses under $1,800/mo across all our markets. We specialize in quality units at honest prices.", tag: "Most Popular" },
  { title: "Family Homes", description: "3+ bedroom homes near top-rated schools with safe neighbourhoods. We know the school district maps better than most principals.", tag: "" },
  { title: "Corporate Relocation", description: "Fast-tracked viewings, virtual tours, and guaranteed move-in timelines for employees relocating on company time.", tag: "" },
  { title: "First-Time Renters", description: "No rental history? We work with first-time renters and help you build the documentation you need for approval.", tag: "No Credit OK" },
  { title: "Section 8 / HCV", description: "Several of our properties accept Housing Choice Vouchers. Our agents know exactly which listings are voucher-friendly.", tag: "" },
  { title: "Pet-Friendly Homes", description: "Over 40% of our listings accept pets. We filter your search by pet policy so you only see genuinely pet-welcoming options.", tag: "" },
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

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[560px] lg:min-h-[620px] flex items-end overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1582407947304-fd86f28f1a2a?w=1600&q=80"
          alt="Housing specialists at Hasker & Co. Realty Group"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-brand-dark/25" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 pb-16 pt-32">
          <p className="text-brand text-xs font-semibold tracking-[0.35em] uppercase mb-4">Real People, Real Help</p>
          <h1 className="font-serif text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.05] mb-5 max-w-3xl">
            Meet Your Housing Specialists
          </h1>
          <p className="text-blue-100 text-lg max-w-xl leading-relaxed mb-10">
            Our team knows every neighbourhood, every price point, every shortcut. We work for
            families — not commissions — and we find affordable homes fast.
          </p>

          {/* Inline stats */}
          <div className="flex flex-wrap gap-8">
            {teamStats.map((s) => (
              <div key={s.label}>
                <p className="font-serif text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-blue-200 mt-0.5 tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY OUR TEAM ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
        <div className="max-w-xl mb-16">
          <p className="text-brand text-xs font-semibold tracking-[0.35em] uppercase mb-4">Our Approach</p>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-brand-dark leading-tight">
            Why Families Choose to Work With Us
          </h2>
          <p className="text-neutral-500 mt-5 text-base leading-relaxed">
            There are thousands of real estate agents. Here&apos;s what makes working with ours different.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamValues.map((v, i) => (
            <div key={v.title} className="group" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="w-14 h-14 rounded-sm bg-brand/8 border border-brand/15 flex items-center justify-center mb-5 group-hover:bg-brand group-hover:border-brand transition-colors duration-300">
                <v.icon size={22} className="text-brand group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-serif text-xl font-bold text-brand-dark mb-3">{v.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── AGENT GRID ───────────────────────────────────────────────────── */}
      <section className="bg-neutral-50 border-y border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-24">
          <div className="mb-14">
            <p className="text-brand text-xs font-semibold tracking-[0.35em] uppercase mb-4">The Team</p>
            <h2 className="font-serif text-4xl font-bold text-brand-dark">Your Specialists</h2>
          </div>

          {agents.length === 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Placeholder cards for warmth when API is empty */}
              {[
                { name: "Sarah Mitchell", role: "Senior Leasing Specialist", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80", years: "8", listings: "24" },
                { name: "James Okafor", role: "Residential Sales Agent", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80", years: "12", listings: "31" },
                { name: "Tanya Reeves", role: "Relocation Specialist", img: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=600&q=80", years: "6", listings: "18" },
              ].map((p) => (
                <div key={p.name} className="bg-white border border-neutral-100 rounded-sm overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 group cursor-pointer">
                  <div className="relative aspect-[3/2] overflow-hidden">
                    <Image src={p.img} alt={p.name} fill className="object-cover object-top group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 to-transparent" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-xl font-bold text-brand-dark">{p.name}</h3>
                    <p className="text-brand text-xs font-semibold tracking-wide mt-0.5 mb-4">{p.role}</p>
                    <div className="grid grid-cols-2 gap-3 mb-5 text-center bg-neutral-50 rounded-sm p-3">
                      <div>
                        <p className="font-serif text-lg font-bold text-brand-dark">{p.years}+ yrs</p>
                        <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Experience</p>
                      </div>
                      <div>
                        <p className="font-serif text-lg font-bold text-brand-dark">{p.listings}</p>
                        <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Active Listings</p>
                      </div>
                    </div>
                    <Link href="/contact" className="flex items-center justify-center gap-2 bg-brand-dark text-white text-sm font-medium py-3 rounded-sm hover:bg-brand transition-colors">
                      Contact This Specialist
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {agents.map((agent) => (
                <div key={agent.id} className="bg-white border border-neutral-100 rounded-sm overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 group">
                  <div className="relative aspect-[3/2] overflow-hidden bg-brand-muted">
                    {agent.avatar_url ? (
                      <Image src={agent.avatar_url} alt={agent.full_name} fill className="object-cover object-top group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-brand text-white text-5xl font-bold font-serif">
                        {agent.first_name[0]}{agent.last_name[0]}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 to-transparent" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-2xl font-bold text-brand-dark">{agent.full_name}</h3>
                    {agent.agent_profile?.specialties?.[0] && (
                      <p className="text-brand text-xs font-semibold tracking-wide mt-0.5 mb-1">{agent.agent_profile.specialties[0]}</p>
                    )}
                    {agent.agent_profile?.license_number && (
                      <p className="text-xs text-neutral-400 mb-4">Lic# {agent.agent_profile.license_number}</p>
                    )}
                    {agent.agent_profile?.bio && (
                      <p className="text-sm text-neutral-600 leading-relaxed line-clamp-3 mb-5">{agent.agent_profile.bio}</p>
                    )}
                    <div className="grid grid-cols-3 gap-3 mb-5 text-center bg-neutral-50 rounded-sm p-3">
                      <div>
                        <p className="font-serif text-lg font-bold text-brand-dark">{agent.agent_profile?.years_experience ?? "—"}+</p>
                        <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Years</p>
                      </div>
                      <div>
                        <p className="font-serif text-lg font-bold text-brand-dark">{agent.active_listings}</p>
                        <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Listings</p>
                      </div>
                      <div>
                        <p className="font-serif text-lg font-bold text-brand-dark">
                          {agent.agent_profile?.total_sales ? formatPrice(agent.agent_profile.total_sales, { compact: true }) : "—"}
                        </p>
                        <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Volume</p>
                      </div>
                    </div>
                    {(agent.agent_profile?.specialties ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {agent.agent_profile!.specialties.map((s) => (
                          <span key={s} className="text-[10px] tracking-wide bg-brand/8 border border-brand/15 text-brand-dark px-2.5 py-1 rounded-sm">{s}</span>
                        ))}
                      </div>
                    )}
                    {(agent.agent_profile?.languages ?? []).length > 0 && (
                      <p className="text-xs text-neutral-400 mb-4">Speaks: {agent.agent_profile!.languages.join(", ")}</p>
                    )}
                    <div className="space-y-2 mb-5">
                      {agent.phone && (
                        <a href={`tel:${agent.phone}`} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-brand transition-colors">
                          <Phone size={13} /> {agent.phone}
                        </a>
                      )}
                      <a href={`mailto:${agent.email}`} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-brand transition-colors">
                        <Mail size={13} /> {agent.email}
                      </a>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/agents/${agent.id}`} className="flex-1 text-center border border-brand text-brand text-sm font-medium py-3 rounded-sm hover:bg-brand hover:text-white transition-colors">View Profile</Link>
                      <Link href={`/contact?agent=${agent.id}`} className="flex-1 text-center bg-brand-dark text-white text-sm font-medium py-3 rounded-sm hover:bg-brand transition-colors">Contact</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="bg-brand-dark text-white py-24 lg:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <p className="text-blue-300 text-xs font-semibold tracking-[0.35em] uppercase mb-4">What Renters Say</p>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold leading-tight max-w-xl">
              Real Words From Real Families
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="border border-white/10 rounded-sm p-7 bg-white/5 hover:bg-white/8 transition-colors duration-200">
                <Quote size={28} className="text-brand mb-5 opacity-80" />
                <p className="text-blue-100 text-sm leading-relaxed mb-7 italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 border-t border-white/10 pt-5">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-brand/20 shrink-0">
                    <Image src={t.image} alt={t.name} fill className="object-cover" sizes="40px" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-blue-300">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPECIALIZATIONS ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
        <div className="max-w-xl mb-16">
          <p className="text-brand text-xs font-semibold tracking-[0.35em] uppercase mb-4">Areas of Expertise</p>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-brand-dark leading-tight">
            We Specialize In What Matters to You
          </h2>
          <p className="text-neutral-500 mt-5 text-sm leading-relaxed">
            Not every housing search is the same. Our team is trained in the specific situations
            renters and buyers face most often.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {specializations.map((spec) => (
            <div key={spec.title} className="group border border-neutral-200 bg-white p-7 rounded-sm hover:border-brand/40 hover:shadow-lg transition-all duration-300 cursor-default">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-serif text-lg font-bold text-brand-dark group-hover:text-brand transition-colors">{spec.title}</h3>
                {spec.tag && (
                  <span className="text-[9px] font-bold tracking-widest uppercase bg-brand/10 text-brand px-2.5 py-1 rounded-sm shrink-0 ml-3">{spec.tag}</span>
                )}
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed">{spec.description}</p>
              <div className="mt-5 w-8 h-0.5 bg-brand/30 group-hover:w-full transition-all duration-500" />
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="bg-neutral-50 border-y border-neutral-100 py-24 lg:py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-14">
            <p className="text-brand text-xs font-semibold tracking-[0.35em] uppercase mb-4">Common Questions</p>
            <h2 className="font-serif text-4xl font-bold text-brand-dark">Working With Our Agents</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="group border border-neutral-200 rounded-sm bg-white overflow-hidden hover:border-brand/30 transition-colors">
                <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none hover:bg-neutral-50 transition-colors">
                  <span className="font-medium text-sm text-brand-dark leading-snug">{faq.q}</span>
                  <div className="shrink-0 w-7 h-7 rounded-full border border-neutral-200 flex items-center justify-center group-open:border-brand group-open:bg-brand transition-colors duration-200">
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="text-neutral-400 group-open:text-white group-open:rotate-180 transition-all duration-200">
                      <path d="M1.5 4L5.5 8L9.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </summary>
                <div className="px-6 pb-5 pt-2 border-t border-neutral-100">
                  <p className="text-neutral-600 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOIN CTA ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative aspect-[4/3] rounded-sm overflow-hidden bg-neutral-100">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&q=80"
              alt="Beautiful sunlit living room in an affordable home"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-sm px-5 py-4 shadow-xl">
              <p className="text-xs font-bold text-brand-dark">Licensed REALTORS®</p>
              <p className="text-xs text-neutral-500 mt-0.5">Virginia Real Estate Board</p>
            </div>
          </div>
          <div>
            <p className="text-brand text-xs font-semibold tracking-[0.35em] uppercase mb-4">Join the Team</p>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-brand-dark leading-tight mb-5">
              Are You a Licensed Real Estate Agent?
            </h2>
            <p className="text-neutral-600 text-sm leading-relaxed mb-8">
              We&apos;re always looking for motivated specialists who share our commitment to affordable
              housing. If you&apos;re licensed in Virginia or one of our target markets, we&apos;d love to talk.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/careers" className="inline-flex items-center justify-center gap-2 bg-brand-dark text-white text-sm font-semibold px-7 py-4 rounded-sm hover:bg-brand transition-colors">
                View Careers <ArrowRight size={14} />
              </Link>
              <a href="mailto:careers@haskerrealtygroup.com" className="inline-flex items-center justify-center gap-2 border border-brand-dark text-brand-dark text-sm font-medium px-7 py-4 rounded-sm hover:bg-brand-dark hover:text-white transition-colors">
                <Mail size={14} /> careers@haskerrealtygroup.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
