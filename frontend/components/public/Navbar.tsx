"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const navLinks = [
  { label: "Browse Homes", href: "/properties" },
  { label: "Our Team", href: "/agents" },
  { label: "Renter's Guide", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

// Pages where the hero fills the full viewport — transparent navbar looks great there.
// All other pages get a solid dark navbar from the start.
const HERO_PAGES = ["/"];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHeroPage = HERO_PAGES.includes(pathname);

  // True if the current URL is on or under this nav link's path
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    // Read the real scroll position immediately on mount (handles browser back-nav)
    setScrolled(window.scrollY > 60);

    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // When scrolled OR on non-hero pages → solid white bar
  // When at the top of a hero page → transparent (dark gradient so text stays visible)
  const solidBg = scrolled || !isHeroPage;

  return (
    <>
      {/* ── Fixed header ─────────────────────────────────────────── */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-[background-color,backdrop-filter,box-shadow,border-color] duration-300",
          solidBg
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-neutral-100"
            : "bg-gradient-to-b from-black/50 to-transparent"
        )}
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo.svg"
              alt="Hasker & Co. Realty Group"
              width={160}
              height={40}
              priority
              className={cn(
                "h-9 w-auto transition-[filter] duration-300",
                !solidBg && "brightness-0 invert"
              )}
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative text-sm font-medium tracking-wide transition-colors hover:text-brand pb-0.5",
                  solidBg ? "text-brand-dark" : "text-white/90",
                  isActive(link.href) && solidBg && "text-brand",
                  isActive(link.href) && !solidBg && "text-white",
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-brand" />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="mailto:info@haskerrealtygroup.com"
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-brand",
                solidBg ? "text-brand-dark" : "text-white/90"
              )}
            >
              <Phone size={14} />
              Email Us
            </a>
            <Button variant="accent" size="sm" asChild>
              <Link href="/apply">Apply Now</Link>
            </Button>
          </div>

          {/* Mobile toggle — 44 px touch target via p-2.5 */}
          <button
            type="button"
            className={cn(
              "md:hidden p-2.5 -mr-2.5 rounded-sm touch-manipulation transition-colors",
              solidBg ? "text-brand-dark" : "text-white"
            )}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
      </header>

      {/* Scrim — always in DOM, visible only when menu is open */}
      <div
        aria-hidden="true"
        onClick={() => setMobileOpen(false)}
        className={cn(
          "fixed inset-0 z-40 md:hidden bg-black/20 transition-opacity duration-200",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Drawer — always in DOM, slides in/out with CSS */}
      <div
        className={cn(
          "fixed inset-x-0 top-20 z-50 md:hidden bg-white shadow-xl border-t border-neutral-100",
          "overflow-y-auto max-h-[calc(100dvh-5rem)]",
          "transition-all duration-200 ease-out",
          mobileOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none"
        )}
      >
        <div className="px-6 py-5 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center justify-between py-3.5 text-base font-medium tracking-wide transition-colors border-b border-neutral-100 last:border-0",
                isActive(link.href)
                  ? "text-brand font-semibold"
                  : "text-brand-dark hover:text-brand"
              )}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand" />
              )}
            </Link>
          ))}

          <div className="pt-5 mt-2 border-t border-neutral-100 flex flex-col gap-3">
            <a
              href="mailto:info@haskerrealtygroup.com"
              className="flex items-center gap-2 text-brand-dark font-medium text-sm py-1"
            >
              <Phone size={15} className="text-brand" />
              Email Us
            </a>
            <Button variant="accent" className="w-full" asChild>
              <Link href="/apply" onClick={() => setMobileOpen(false)}>
                Apply Now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
