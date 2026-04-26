import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Phone, Mail, Award, Home, TrendingUp, ArrowLeft } from "lucide-react";
import { fetchAgentById, fetchAgents, fetchAgentListings } from "@/lib/agents";
import { toPropertyCardShape, type PropertyListItemAPI } from "@/lib/properties";
import type { Property } from "@/types";
import { formatPrice } from "@/lib/utils";

export const revalidate = 300;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const agents = await fetchAgents();
  return agents.map((a) => ({ id: String(a.id) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const agent = await fetchAgentById(id);
    return {
      title: `${agent.full_name} — Hasker & Co. Realty Group`,
      description: agent.agent_profile?.bio?.slice(0, 160) ?? `Rental specialist at Hasker & Co. Realty Group.`,
      alternates: { canonical: `https://haskerrealtygroup.com/agents/${id}` },
      openGraph: {
        title: `${agent.full_name} — Hasker & Co. Realty Group`,
        description: agent.agent_profile?.bio?.slice(0, 160) ?? `Rental specialist at Hasker & Co. Realty Group.`,
        type: "profile",
        url: `https://haskerrealtygroup.com/agents/${id}`,
      },
    };
  } catch {
    return { robots: { index: false } };
  }
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

const FALLBACK_IMG = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=75";

export default async function AgentProfilePage({ params }: Props) {
  const { id } = await params;

  let agent;
  try {
    agent = await fetchAgentById(id);
  } catch {
    notFound();
  }

  const listingsRaw: PropertyListItemAPI[] = await fetchAgentListings(agent.id);
  const agentListings: Property[] = listingsRaw.slice(0, 4).map(toPropertyCardShape);

  const profile = agent.agent_profile;

  const stats = [
    { icon: Award, label: "Years Experience", value: profile?.years_experience ? `${profile.years_experience}+` : "—" },
    {
      icon: TrendingUp,
      label: "Total Volume",
      value: profile?.total_sales ? formatPrice(profile.total_sales, { compact: true }) : "—",
    },
    { icon: Home, label: "Active Listings", value: String(agent.active_listings) },
  ];

  const socialLinks = profile?.social_links ?? {};

  return (
    <div className="pt-20">
      {/* Back link + hero */}
      <div className="bg-brand-dark text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-10 pb-16">
          <Link
            href="/agents"
            className="inline-flex items-center gap-2 text-blue-300 text-xs font-medium mb-8 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            All Advisors
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-10 items-start">
            {/* Photo */}
            <div className="relative w-40 h-40 lg:w-52 lg:h-52 rounded-sm overflow-hidden shrink-0 ring-4 ring-white/10 bg-brand">
              {agent.avatar_url ? (
                <Image
                  src={agent.avatar_url}
                  alt={agent.full_name}
                  fill
                  className="object-cover object-top"
                  priority
                  sizes="(max-width: 1024px) 160px, 208px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-5xl font-bold font-serif">
                  {agent.first_name[0]}{agent.last_name[0]}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <h1 className="font-serif text-4xl lg:text-5xl font-bold mb-1">
                {agent.full_name}
              </h1>
              {profile?.specialties?.[0] && (
                <p className="text-brand text-sm font-semibold tracking-wide mb-1">
                  {profile.specialties[0]}
                </p>
              )}
              {profile?.license_number && (
                <p className="text-blue-200 text-xs mb-6">Lic# {profile.license_number}</p>
              )}

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 mb-8 max-w-lg">
                {stats.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-white/5 border border-white/10 rounded-sm p-3 text-center">
                    <Icon size={16} className="text-brand mx-auto mb-1.5" />
                    <p className="font-serif text-2xl font-bold">{value}</p>
                    <p className="text-blue-200 text-[10px] uppercase tracking-wide mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Contact + socials */}
              <div className="flex flex-wrap gap-3">
                {agent.phone && (
                  <a
                    href={`tel:${agent.phone}`}
                    className="inline-flex items-center gap-2 bg-brand text-white text-sm font-medium px-5 py-2.5 rounded-sm hover:bg-brand-hover transition-colors"
                  >
                    <Phone size={14} />
                    {agent.phone}
                  </a>
                )}
                <a
                  href={`mailto:${agent.email}`}
                  className="inline-flex items-center gap-2 border border-white/20 text-white text-sm font-medium px-5 py-2.5 rounded-sm hover:border-white/50 transition-colors"
                >
                  <Mail size={14} />
                  Email
                </a>
                {socialLinks.linkedin && (
                  <a
                    href={socialLinks.linkedin}
                    aria-label={`${agent.full_name} on LinkedIn`}
                    className="inline-flex items-center justify-center w-10 h-10 border border-white/20 rounded-sm text-neutral-300 hover:border-brand hover:text-brand transition-colors"
                  >
                    <LinkedinIcon />
                  </a>
                )}
                {socialLinks.instagram && (
                  <a
                    href={socialLinks.instagram}
                    aria-label={`${agent.full_name} on Instagram`}
                    className="inline-flex items-center justify-center w-10 h-10 border border-white/20 rounded-sm text-neutral-300 hover:border-brand hover:text-brand transition-colors"
                  >
                    <InstagramIcon />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
          {/* Main column */}
          <div>
            {/* Bio */}
            {profile?.bio && (
              <section className="mb-12">
                <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                  About {agent.first_name}
                </h2>
                <p className="text-neutral-600 leading-relaxed">{profile.bio}</p>
              </section>
            )}

            {/* Specialties */}
            {(profile?.specialties ?? []).length > 0 && (
              <section className="mb-12">
                <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">Specialties</h2>
                <div className="flex flex-wrap gap-2">
                  {profile!.specialties.map((s) => (
                    <span
                      key={s}
                      className="text-xs tracking-wide bg-brand-light border border-brand-muted text-brand-dark px-3 py-1.5 rounded-sm font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                {(profile?.languages ?? []).length > 0 && (
                  <p className="text-sm text-neutral-500 mt-4">
                    <span className="font-medium text-neutral-700">Languages:</span>{" "}
                    {profile!.languages.join(", ")}
                  </p>
                )}
              </section>
            )}

            {/* Active listings */}
            {agentListings.length > 0 && (
              <section>
                <div className="flex items-end justify-between mb-6">
                  <h2 className="font-serif text-2xl font-bold text-brand-dark">
                    Current Listings
                  </h2>
                  <Link href="/properties" className="text-sm text-brand hover:underline font-medium">
                    View all
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {agentListings.map((property) => {
                    const primaryImg = property.images[0]?.url ?? FALLBACK_IMG;
                    return (
                      <Link
                        key={property.id}
                        href={`/properties/${property.slug}`}
                        className="group bg-white border border-neutral-100 rounded-sm overflow-hidden hover:shadow-lg transition-shadow duration-300"
                      >
                        <div className="relative aspect-[16/9] overflow-hidden">
                          <Image
                            src={primaryImg}
                            alt={property.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 640px) 100vw, 50vw"
                          />
                        </div>
                        <div className="p-4">
                          <p className="text-brand font-serif font-bold text-lg">
                            {formatPrice(property.price)}
                          </p>
                          <h3 className="font-medium text-brand-dark text-sm leading-snug mt-0.5 line-clamp-1 group-hover:text-brand transition-colors">
                            {property.title}
                          </h3>
                          <p className="text-xs text-neutral-400 mt-1">
                            {property.bedrooms} bd · {property.bathrooms} ba · {property.sqft.toLocaleString()} sqft
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-28 self-start">
            {/* Contact card */}
            <div className="bg-brand-dark text-white rounded-sm p-6">
              <h2 className="font-serif text-xl font-bold mb-2">
                Work with {agent.first_name}
              </h2>
              <p className="text-blue-100 text-sm leading-relaxed mb-5">
                Send a message and {agent.first_name} will be in touch within 24 hours.
              </p>
              <form className="space-y-3">
                <div>
                  <label htmlFor="agent-contact-name" className="sr-only">Your Name</label>
                  <input
                    id="agent-contact-name"
                    type="text"
                    placeholder="Your Name"
                    className="w-full bg-white/10 border border-white/20 rounded-sm px-3 py-2.5 text-sm text-white placeholder:text-white/50 outline-none focus:border-brand transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="agent-contact-email" className="sr-only">Email Address</label>
                  <input
                    id="agent-contact-email"
                    type="email"
                    placeholder="Email Address"
                    className="w-full bg-white/10 border border-white/20 rounded-sm px-3 py-2.5 text-sm text-white placeholder:text-white/50 outline-none focus:border-brand transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="agent-contact-phone" className="sr-only">Phone Number</label>
                  <input
                    id="agent-contact-phone"
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full bg-white/10 border border-white/20 rounded-sm px-3 py-2.5 text-sm text-white placeholder:text-white/50 outline-none focus:border-brand transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="agent-contact-message" className="sr-only">Message</label>
                  <textarea
                    id="agent-contact-message"
                    rows={3}
                    placeholder={`I'd like to speak with ${agent.first_name} about...`}
                    className="w-full bg-white/10 border border-white/20 rounded-sm px-3 py-2.5 text-sm text-white placeholder:text-white/50 outline-none focus:border-brand transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-brand text-white text-sm font-medium py-3 rounded-sm hover:bg-brand-hover transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Direct contact */}
            <div className="bg-brand-light border border-brand-muted rounded-sm p-5 space-y-3">
              <h3 className="font-semibold text-brand-dark text-sm">Direct Contact</h3>
              {agent.phone && (
                <a
                  href={`tel:${agent.phone}`}
                  className="flex items-center gap-3 text-sm text-neutral-600 hover:text-brand transition-colors"
                >
                  <Phone size={14} className="text-brand shrink-0" />
                  {agent.phone}
                </a>
              )}
              <a
                href={`mailto:${agent.email}`}
                className="flex items-center gap-3 text-sm text-neutral-600 hover:text-brand transition-colors"
              >
                <Mail size={14} className="text-brand shrink-0" />
                {agent.email}
              </a>
            </div>

            {/* All agents CTA */}
            <Link
              href="/agents"
              className="block text-center text-sm font-medium text-brand border border-brand-muted rounded-sm py-3 hover:bg-brand hover:text-white transition-colors"
            >
              Meet Our Full Team
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
