import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Brand & Design Kit — Hasker & Co. Realty Group",
  robots: { index: false, follow: false },
};

const colors = [
  { name: "Brand Blue",  hex: "#1A56DB", use: "CTAs · Links · Accents",        dark: false },
  { name: "Dark Navy",   hex: "#0B1F3A", use: "Headers · Dark backgrounds",     dark: true  },
  { name: "Mid Navy",    hex: "#0D2550", use: "Alt dark sections · Footers",    dark: true  },
  { name: "Pale Blue",   hex: "#EFF4FF", use: "Section backgrounds",            dark: false },
  { name: "Muted Blue",  hex: "#DBEAFE", use: "Badges · Tags · Chips",          dark: false },
  { name: "White",       hex: "#FFFFFF", use: "Text on dark · Card backgrounds", dark: false },
];

const messages = [
  { label: "Tagline",         text: "Comfortable Living, Within Your Budget." },
  { label: "Value prop",      text: "Honest prices. No hidden fees. 24-hour decisions." },
  { label: "Social proof",    text: "2,000+ families housed across 12+ cities since 2012." },
  { label: "Differentiator",  text: "What we quote is what you pay. Full stop." },
  { label: "CTA (primary)",   text: "Apply Now" },
  { label: "CTA (secondary)", text: "Browse Homes" },
  { label: "CTA (soft)",      text: "Talk to Our Team" },
];

const adSizes = [
  { platform: "Facebook / Instagram Feed",  size: "1080 × 1080 px",  ratio: "1:1"   },
  { platform: "Facebook / Instagram Story", size: "1080 × 1920 px",  ratio: "9:16"  },
  { platform: "Facebook Link Preview",      size: "1200 × 630 px",   ratio: "1.91:1"},
  { platform: "Google Display (banner)",    size: "728 × 90 px",     ratio: "—"     },
  { platform: "Google Display (rectangle)", size: "300 × 250 px",    ratio: "—"     },
  { platform: "Twitter/X Card",             size: "1200 × 675 px",   ratio: "16:9"  },
  { platform: "LinkedIn Post",              size: "1200 × 627 px",   ratio: "1.91:1"},
  { platform: "Flyer / Print (portrait)",   size: "2480 × 3508 px",  ratio: "A4"    },
  { platform: "Billboard (landscape)",      size: "3000 × 1000 px",  ratio: "3:1"   },
];

const trust = [
  "4.9 / 5 on Trustpilot · 2,400+ reviews",
  "BBB A+ Accredited (Better Business Bureau)",
  "NAR Member (National Association of Realtors)",
  "Licensed & Insured · All 6 operating states",
  "Equal Housing Opportunity compliant",
  "24-hour application decisions",
];

const doSay = [
  "No hidden fees",
  "What you see is what you pay",
  "24-hour decisions",
  "Apply in 10 minutes",
  "Real families, honest prices",
  "We work for you, not commissions",
  "No games, no runaround",
];

const dontSay = [
  "Luxury / Premium / Exclusive",
  "World-class / Revolutionary",
  "Starting from (without a real number)",
  "Subject to change",
  "Processing fee",
];

export default function DesignHandoffPage() {
  return (
    <div className="pt-20 bg-neutral-50 min-h-screen">

      {/* ── Header ── */}
      <div className="bg-brand-dark text-white pt-14 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-blue-300 text-xs font-semibold tracking-[0.4em] uppercase mb-3">Internal Reference</p>
          <h1 className="font-sans text-4xl font-bold mb-2">Brand & Design Kit</h1>
          <p className="text-blue-100/70 text-sm">
            Everything you need to create ads, posters, social posts, and marketing for Hasker &amp; Co.
            Use the <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">/design-handoff</code> skill in Claude Code to generate copy on demand.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-14 space-y-16">

        {/* ── Logo ── */}
        <section>
          <h2 className="font-sans text-2xl font-bold text-brand-dark mb-6">Logo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-neutral-200 rounded-sm p-10 flex items-center justify-center">
              <Image src="/logo.svg" alt="Logo on white" width={220} height={40} />
            </div>
            <div className="bg-brand-dark border border-neutral-200 rounded-sm p-10 flex items-center justify-center">
              <Image src="/logo.svg" alt="Logo on dark" width={220} height={40} className="brightness-0 invert" />
            </div>
          </div>
          <div className="mt-4 bg-white border border-neutral-200 rounded-sm p-5 text-sm text-neutral-600 space-y-1">
            <p><span className="font-semibold text-brand-dark">File:</span> <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-xs">/public/logo.svg</code></p>
            <p><span className="font-semibold text-brand-dark">On white backgrounds:</span> Use as-is.</p>
            <p><span className="font-semibold text-brand-dark">On dark backgrounds:</span> Apply <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-xs">filter: brightness(0) invert(1)</code> or use the white-inverted version.</p>
            <p><span className="font-semibold text-brand-dark">Minimum size:</span> 120px wide. Never stretch or recolour the mark.</p>
          </div>
        </section>

        {/* ── Colours ── */}
        <section>
          <h2 className="font-sans text-2xl font-bold text-brand-dark mb-6">Colour Palette</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {colors.map((c) => (
              <div key={c.hex} className="rounded-sm overflow-hidden border border-neutral-200">
                <div
                  className="h-24 w-full"
                  style={{ background: c.hex, border: c.hex === "#FFFFFF" ? "1px solid #e5e7eb" : undefined }}
                />
                <div className="bg-white p-3">
                  <p className="font-semibold text-brand-dark text-sm">{c.name}</p>
                  <p className="font-mono text-xs text-neutral-500 mt-0.5">{c.hex}</p>
                  <p className="text-xs text-neutral-400 mt-1 leading-snug">{c.use}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Typography ── */}
        <section>
          <h2 className="font-sans text-2xl font-bold text-brand-dark mb-6">Typography</h2>
          <div className="space-y-4">
            <div className="bg-white border border-neutral-200 rounded-sm p-6">
              <p className="text-xs text-neutral-400 uppercase tracking-widest mb-3">Display / Hero — Playfair Display, 700–900</p>
              <p className="font-serif text-5xl font-bold text-brand-dark leading-tight">Good Homes. Fair Prices.</p>
            </div>
            <div className="bg-white border border-neutral-200 rounded-sm p-6">
              <p className="text-xs text-neutral-400 uppercase tracking-widest mb-3">Section Heading — DM Sans, 700–800</p>
              <p className="font-sans text-4xl font-bold text-brand-dark">Homes Available Now</p>
            </div>
            <div className="bg-white border border-neutral-200 rounded-sm p-6">
              <p className="text-xs text-neutral-400 uppercase tracking-widest mb-3">Subheading — DM Sans, 600</p>
              <p className="font-sans text-xl font-semibold text-brand-dark">No hidden fees. 24-hour application review.</p>
            </div>
            <div className="bg-white border border-neutral-200 rounded-sm p-6">
              <p className="text-xs text-neutral-400 uppercase tracking-widest mb-3">Body — DM Sans, 400</p>
              <p className="font-sans text-base text-neutral-600 leading-relaxed">
                Everyone deserves a quality home they can actually afford. Hasker &amp; Co. Realty Group cuts through the noise — no inflated prices, no hidden admin fees, no bait-and-switch listings. Just honest homes for real families.
              </p>
            </div>
            <div className="bg-white border border-neutral-200 rounded-sm p-6">
              <p className="text-xs text-neutral-400 uppercase tracking-widest mb-3">Eyebrow Label — DM Sans, 600, all-caps, wide tracking</p>
              <p className="font-sans text-xs font-semibold tracking-[0.35em] uppercase text-brand">Move-In Ready</p>
            </div>
          </div>
          <div className="mt-4 bg-brand-light border border-brand-muted rounded-sm p-5 text-sm text-neutral-600">
            <p><span className="font-semibold text-brand-dark">Google Fonts:</span> DM Sans · Playfair Display</p>
            <p className="mt-1"><span className="font-semibold text-brand-dark">Fallback stack:</span> <code className="bg-white px-1.5 py-0.5 rounded text-xs">system-ui, -apple-system, sans-serif</code></p>
            <p className="mt-1"><span className="font-semibold text-brand-dark">Rule:</span> Playfair Display only for large hero moments (&gt;40px). Everything else uses DM Sans.</p>
          </div>
        </section>

        {/* ── Key Messages ── */}
        <section>
          <h2 className="font-sans text-2xl font-bold text-brand-dark mb-6">Key Messages & Copy</h2>
          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.label} className="bg-white border border-neutral-200 rounded-sm p-4 flex items-start gap-4">
                <span className="text-xs font-semibold text-brand bg-brand-light px-2 py-1 rounded-sm shrink-0 mt-0.5 tracking-wide uppercase">{m.label}</span>
                <p className="font-sans text-brand-dark font-medium">{m.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Voice Do / Don't ── */}
        <section>
          <h2 className="font-sans text-2xl font-bold text-brand-dark mb-6">Brand Voice</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white border border-neutral-200 rounded-sm p-6">
              <p className="text-xs font-semibold tracking-widest uppercase text-emerald-600 mb-4">✓ Do say</p>
              <ul className="space-y-2">
                {doSay.map((d) => (
                  <li key={d} className="flex items-center gap-2 text-sm text-neutral-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-neutral-200 rounded-sm p-6">
              <p className="text-xs font-semibold tracking-widest uppercase text-red-500 mb-4">✕ Don't say</p>
              <ul className="space-y-2">
                {dontSay.map((d) => (
                  <li key={d} className="flex items-center gap-2 text-sm text-neutral-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Trust Signals ── */}
        <section>
          <h2 className="font-sans text-2xl font-bold text-brand-dark mb-6">Trust Signals — Use in Ads</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {trust.map((t) => (
              <div key={t} className="bg-white border border-neutral-200 rounded-sm p-4 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-brand shrink-0" />
                <p className="text-sm font-medium text-brand-dark">{t}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Ad Sizes ── */}
        <section>
          <h2 className="font-sans text-2xl font-bold text-brand-dark mb-6">Ad & Poster Sizes</h2>
          <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-brand-light border-b border-brand-muted">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-brand-dark">Platform / Format</th>
                  <th className="text-left px-5 py-3 font-semibold text-brand-dark">Dimensions</th>
                  <th className="text-left px-5 py-3 font-semibold text-brand-dark">Ratio</th>
                </tr>
              </thead>
              <tbody>
                {adSizes.map((a, i) => (
                  <tr key={a.platform} className={i % 2 === 0 ? "bg-white" : "bg-neutral-50"}>
                    <td className="px-5 py-3 text-brand-dark">{a.platform}</td>
                    <td className="px-5 py-3 font-mono text-neutral-500 text-xs">{a.size}</td>
                    <td className="px-5 py-3 text-neutral-400">{a.ratio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Photo Style ── */}
        <section>
          <h2 className="font-sans text-2xl font-bold text-brand-dark mb-6">Photo & Image Style</h2>
          <div className="bg-white border border-neutral-200 rounded-sm p-6 space-y-3 text-sm text-neutral-600">
            <p><span className="font-semibold text-brand-dark">Subject:</span> Real families in real homes. Bright interiors, welcoming front doors, families unpacking or relaxing. Not staged magazine shoots.</p>
            <p><span className="font-semibold text-brand-dark">Mood:</span> Warm, hopeful, attainable. Natural light. Clutter-free but lived-in.</p>
            <p><span className="font-semibold text-brand-dark">Avoid:</span> Luxury penthouses, crystal chandeliers, marble everything. We are affordable — show it.</p>
            <p><span className="font-semibold text-brand-dark">Overlay:</span> On hero images use a dark navy gradient (<code className="bg-neutral-100 px-1.5 py-0.5 rounded text-xs">#0B1F3A at 55–85% opacity</code>) so white text stays readable.</p>
            <p><span className="font-semibold text-brand-dark">Stock sources:</span> Unsplash, Pexels. Search terms: "family home interior", "affordable apartment", "house rental", "moving in family".</p>
          </div>
        </section>

        {/* ── Skill tip ── */}
        <section className="bg-brand-dark rounded-sm p-8 text-white">
          <p className="text-blue-300 text-xs font-semibold tracking-[0.3em] uppercase mb-3">Generate Copy Instantly</p>
          <h2 className="font-sans text-2xl font-bold mb-3">Use the /design-handoff Skill</h2>
          <p className="text-blue-100/80 text-sm leading-relaxed mb-5">
            Open Claude Code in your project and type <code className="bg-white/10 px-2 py-0.5 rounded">/design-handoff</code> followed by what you need.
            Claude will generate complete copy + a creative brief ready to hand to a designer.
          </p>
          <div className="space-y-2">
            {[
              "/design-handoff Facebook ad for 2-bedroom apartments in Atlanta",
              "/design-handoff Instagram Story promoting 24-hour decisions",
              "/design-handoff A4 flyer for Houston rentals",
              "/design-handoff Google Search ad targeting cheap apartments",
              "/design-handoff WhatsApp message for leads who haven't applied yet",
            ].map((ex) => (
              <div key={ex} className="bg-white/5 border border-white/10 rounded-sm px-4 py-2.5">
                <code className="text-blue-200 text-sm">{ex}</code>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
