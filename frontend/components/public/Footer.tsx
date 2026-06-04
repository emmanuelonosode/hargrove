import Link from "next/link";
import Image from "next/image";
import { HaskerLogo } from "@/components/ui/HaskerLogo";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
      <path d="M24 12.073C24 5.446 18.627 0 12 0S0 5.446 0 12.073c0 6.001 4.388 10.977 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.05 24 18.074 24 12.073z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.16 8.16 0 0 0 4.77 1.52V6.75a4.84 4.84 0 0 1-1-.06z" />
    </svg>
  );
}

const footerCols = [
  {
    h: "Rent",
    links: [
      { label: "Browse homes",         href: "/houses-for-rent" },
      { label: "By city",              href: "/houses-for-rent" },
      { label: "Pet-friendly",         href: "/houses-for-rent?q=pet" },
      { label: "New listings",         href: "/houses-for-rent" },
    ],
  },
  {
    h: "Apply",
    links: [
      { label: "Start application",    href: "/apply" },
      { label: "Application FAQ",      href: "/apply" },
      { label: "Tenant portal",        href: "/portal" },
      { label: "Maintenance",          href: "/portal/maintenance" },
    ],
  },
  {
    h: "About",
    links: [
      { label: "Our team",             href: "/agents" },
      { label: "Renter's guide",       href: "/blog" },
      { label: "Blog & guides",        href: "/blog" },
      { label: "Careers",              href: "/careers" },
    ],
  },
  {
    h: "Contact",
    links: [
      { label: "Get in touch",         href: "/contact" },
      { label: "Property management",  href: "/property-management" },
      { label: "Accessibility",        href: "/accessibility" },
      { label: "Privacy policy",       href: "/privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer style={{ background: "#1E3A5F", color: "rgba(255,255,255,0.5)" }}>
      {/* Main columns */}
      <div className="max-w-7xl mx-auto px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_repeat(4,1fr)] gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block opacity-90 hover:opacity-100 transition-opacity">
              <HaskerLogo variant="on-dark" height={30} />
            </Link>
            <p className="mt-4 leading-[1.6]" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "rgba(255,255,255,0.45)", maxWidth: 240 }}>
              Good Homes. Fair Prices. No Surprises.<br />Housing 2,400+ families across the U.S. since 2012.
            </p>
            <p className="mt-3" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "rgba(255,255,255,0.45)" }}>
              204 Colonial Hills Rd, Winder GA 30680
            </p>
            <Link
              href="/contact"
              className="inline-block mt-2 transition-colors hover:text-white"
              style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "rgba(255,255,255,0.55)" }}
            >
              Contact us →
            </Link>
            <div className="flex gap-2.5 mt-5">
              {[
                { href: "https://www.facebook.com/share/1G6G3YcUd3/?mibextid=wwXIfr", label: "Facebook",  Icon: FacebookIcon },
                { href: "https://www.tiktok.com/@haskerrealtygroup",                    label: "TikTok",    Icon: TikTokIcon },
                { href: "https://www.instagram.com/haskerrealty",                       label: "Instagram", Icon: InstagramIcon },
                { href: "https://www.linkedin.com/company/haskerrealty",                label: "LinkedIn",  Icon: LinkedinIcon },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors border border-white/10 text-white/40 hover:text-brand hover:border-brand"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerCols.map((col) => (
            <div key={col.h}>
              <div
                className="mb-3.5"
                style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.85)" }}
              >
                {col.h}
              </div>
              {col.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block py-[5px] transition-colors hover:text-white"
                  style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.55)", textDecoration: "none" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Compliance strip */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-7xl mx-auto px-8 py-7">
          <div className="flex flex-wrap items-center gap-4 mb-5">
            <div className="bg-white rounded-sm p-1.5" title="Equal Housing Opportunity">
              <Image src="/logos/equal-housing.png" alt="Equal Housing Opportunity" width={40} height={40} className="object-contain" />
            </div>
            <div className="rounded-sm overflow-hidden" title="REALTOR® Member">
              <Image src="/logos/realtor.svg" alt="REALTOR® Member" width={68} height={48} className="object-contain" />
            </div>
            <div className="rounded-sm overflow-hidden" title="Virginia REALTORS® Member">
              <Image src="/logos/virginia-realtors.svg" alt="Virginia REALTORS®" width={80} height={48} className="object-contain" />
            </div>
            <div className="rounded-sm overflow-hidden" title="MLS Participant">
              <Image src="/logos/mls.svg" alt="MLS Participant" width={68} height={48} className="object-contain" />
            </div>
          </div>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.65, maxWidth: "56rem" }}>
            All advertising conforms to the Fair Housing Act. &ldquo;REALTOR&reg;&rdquo; is a registered collective membership mark identifying real estate professionals who are members of the National Association of REALTORS&reg; and subscribe to its Code of Ethics.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
            © {new Date().getFullYear()} Hasker &amp; Co. Realty Group · Equal Housing Opportunity
          </div>
          <div className="flex gap-[18px]">
            {[
              { label: "Privacy",       href: "/privacy" },
              { label: "Terms",         href: "/terms" },
              { label: "Accessibility", href: "/accessibility" },
            ].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
                className="hover:text-white/70 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
