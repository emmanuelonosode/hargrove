import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin } from "lucide-react";
import { HaskerLogo } from "@/components/ui/HaskerLogo";


function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M24 12.073C24 5.446 18.627 0 12 0S0 5.446 0 12.073c0 6.001 4.388 10.977 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.05 24 18.074 24 12.073z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.16 8.16 0 0 0 4.77 1.52V6.75a4.84 4.84 0 0 1-1-.06z" />
    </svg>
  );
}

const footerLinks = {
  Properties: [
    { label: "All Available Homes",   href: "/properties" },
    { label: "Studio Apartments",     href: "/properties?beds=0" },
    { label: "1-Bedroom Homes",       href: "/properties?beds=1" },
    { label: "2-Bedroom Homes",       href: "/properties?beds=2" },
    { label: "3+ Bedroom Homes",      href: "/properties?beds=3" },
    { label: "Homes for Sale",        href: "/properties?listing_type=for-sale" },
  ],
  Services: [
    { label: "Submit Application",    href: "/apply" },
    { label: "Schedule a Viewing",    href: "/contact" },
    { label: "Renter's Guide",        href: "/blog" },
    { label: "City Rental Guides",    href: "/properties" },
    { label: "Pet-Friendly Homes",    href: "/properties?q=pet" },
  ],
  Company: [
    { label: "Our Team",            href: "/agents" },
    { label: "Blog & Guides",       href: "/blog" },
    { label: "Contact Us",          href: "/contact" },
    { label: "Careers",             href: "/careers" },
    { label: "Privacy Policy",      href: "/privacy" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-brand-dark text-white">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Link href="/" className="inline-block opacity-90 hover:opacity-100 transition-opacity">
                <HaskerLogo variant="on-dark" height={32} />
              </Link>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">
              Affordable homes to rent and buy. Honest prices, no hidden fees, fast decisions.
              We&apos;ve housed 2,000+ families across 12+ cities since 2012.
            </p>

            <div className="mt-8 space-y-3">
              <a
                href="mailto:info@haskerrealtygroup.com"
                className="flex items-center gap-3 text-sm text-neutral-300 hover:text-brand transition-colors"
              >
                <Mail size={15} className="text-brand shrink-0" />
                info@haskerrealtygroup.com
              </a>
              <div className="flex items-start gap-3 text-sm text-neutral-400">
                <MapPin size={15} className="text-brand mt-0.5 shrink-0" />
                <span>
                  213 Bob Ln
                  <br />
                  Virginia Beach, VA 23454
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <a
                href="https://www.facebook.com/share/1G6G3YcUd3/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:border-brand hover:text-brand transition-colors"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://www.tiktok.com/@haskerrealtygroup"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:border-brand hover:text-brand transition-colors"
              >
                <TikTokIcon />
              </a>
              <a
                href="https://www.instagram.com/haskerrealty"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:border-brand hover:text-brand transition-colors"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://www.linkedin.com/company/haskerrealty"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:border-brand hover:text-brand transition-colors"
              >
                <LinkedinIcon />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-brand mb-5">
                {group}
              </p>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance & Trust Strip */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          {/* Badge row */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* Equal Housing Opportunity — official HUD/NAR logo */}
            <div className="bg-white rounded-md p-2" title="Equal Housing Opportunity">
              <Image
                src="/logos/equal-housing.png"
                alt="Equal Housing Opportunity"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            {/* REALTOR® — replace /public/logos/realtor.svg with official logo from nar.realtor member portal */}
            <div className="rounded-md overflow-hidden" title="REALTOR® Member">
              <Image src="/logos/realtor.svg" alt="REALTOR® Member — National Association of REALTORS®" width={80} height={56} className="object-contain" />
            </div>
            {/* Virginia REALTORS® — replace /public/logos/virginia-realtors.svg with official logo from virginiarealtors.org */}
            <div className="rounded-md overflow-hidden" title="Virginia REALTORS® Member">
              <Image src="/logos/virginia-realtors.svg" alt="Virginia REALTORS®" width={96} height={56} className="object-contain" />
            </div>
            {/* MLS — replace /public/logos/mls.svg with official logo from your MLS provider (REIN) */}
            <div className="rounded-md overflow-hidden" title="MLS Participant">
              <Image src="/logos/mls.svg" alt="MLS Participant" width={80} height={56} className="object-contain" />
            </div>
          </div>
          {/* Legal disclosure */}
          <p className="text-[11px] text-neutral-500 leading-relaxed max-w-4xl">
            <span className="font-semibold text-neutral-400">Hasker &amp; Co. Realty Group</span> is licensed in the Commonwealth of Virginia &mdash; Firm License&nbsp;
            <span className="font-mono text-neutral-400">#[VREB-XXXXXXXX]</span>. Main office: 213 Bob Ln, Virginia Beach, VA 23454.
            We operate in compliance with the Virginia Real Estate Board (VREB) and the Department of Professional and Occupational Regulation (DPOR).
            All advertising conforms to the Fair Housing Act. &ldquo;REALTOR&reg;&rdquo; is a registered collective membership mark identifying real estate professionals
            who are members of the National Association of REALTORS&reg; and subscribe to its Code of Ethics.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} Hasker & Co. Realty Group. All rights reserved.
          </p>
          <div className="flex gap-5 text-xs text-neutral-500">
            <Link href="/privacy" className="hover:text-neutral-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-neutral-300 transition-colors">
              Terms of Service
            </Link>
            <Link href="/accessibility" className="hover:text-neutral-300 transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
