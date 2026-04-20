import Image from "next/image";
import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import { fetchAgents } from "@/lib/agents";
import { formatPrice } from "@/lib/utils";

export const revalidate = 300;

export const metadata = {
  title: "Our Housing Specialists | Hasker & Co. Realty Group",
  description:
    "Meet the housing specialists at Hasker & Co. Realty Group. Real people helping real families find affordable homes to rent and buy across Atlanta, Charlotte, Houston, Dallas, Nashville, Phoenix, and more.",
  keywords: [
    "housing specialists",
    "affordable home rental agents",
    "rental agents Atlanta",
    "housing help near me",
    "affordable homes team",
    "rent a home fast",
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

const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://haskerrealtygroup.com" }, { "@type": "ListItem", position: 2, name: "Our Team", item: "https://haskerrealtygroup.com/agents" }] };

export default async function AgentsPage() {
  const agents = await fetchAgents();

  return (
    <div className="pt-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {/* Header */}
      <div className="bg-brand-dark pt-16 pb-14 px-6 text-white text-center">
        <p className="text-blue-300 text-xs font-semibold tracking-[0.4em] uppercase mb-4">
          Real People, Real Help
        </p>
        <h1 className="font-serif text-4xl lg:text-5xl font-bold mb-4">Meet Our Housing Specialists</h1>
        <p className="text-blue-100 max-w-xl mx-auto">
          Our team knows every neighbourhood, every price point, every shortcut. We work for
          families, not commissions, and we find affordable homes fast.
        </p>
      </div>

      {/* Agents grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {agents.length === 0 ? (
          <div className="text-center py-24 text-neutral-400">
            <p className="font-serif text-xl">Our team profiles are coming soon.</p>
            <p className="text-sm mt-2">
              In the meantime,{" "}
              <Link href="/contact" className="text-brand hover:underline">
                contact us directly
              </Link>
              .
            </p>
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
                  <h2 className="font-serif text-2xl font-bold text-brand-dark">
                    {agent.full_name}
                  </h2>
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

                  {/* Stats */}
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

                  {/* Specialties */}
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

                  {/* Contact */}
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
    </div>
  );
}
