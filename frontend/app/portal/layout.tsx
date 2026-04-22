"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, CreditCard, FileText, Wrench, User, LogOut, Home, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { label: "Dashboard",   href: "/portal/dashboard",   icon: LayoutDashboard },
  { label: "Payments",    href: "/portal/payments",    icon: CreditCard },
  { label: "Maintenance", href: "/portal/maintenance", icon: Wrench },
  { label: "Documents",   href: "/portal/documents",   icon: FileText },
  { label: "Profile",     href: "/portal/profile",     icon: User },
];

// Mobile bottom bar only shows 4 items (Profile lives in sidebar user chip)
const mobileNavItems = navItems.slice(0, 4);

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
        <div className="w-8 h-8 border-[2.5px] border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex">

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-60 bg-[#0B1F3A] shrink-0">

        {/* Logo */}
        <div className="px-5 py-7">
          <Link href="/">
            <Image
              src="/logo.svg"
              alt="Hasker & Co. Realty Group"
              width={130}
              height={34}
              className="h-7 w-auto brightness-0 invert"
            />
          </Link>
          <p className="text-[9px] tracking-[0.18em] uppercase text-white/30 mt-2 font-medium">
            Tenant Portal
          </p>
        </div>

        {/* User chip — links to profile */}
        <Link
          href="/portal/profile"
          className="mx-3 mb-4 px-3 py-3 rounded-xl bg-white/[0.06] flex items-center gap-3 hover:bg-white/[0.10] transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-[11px] font-semibold text-white shrink-0 select-none">
            {user.first_name?.[0]}{user.last_name?.[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-white truncate leading-none mb-0.5">
              {user.full_name}
            </p>
            <p className="text-[11px] text-white/40 truncate leading-none">{user.email}</p>
          </div>
          <User size={13} className="text-white/20 group-hover:text-white/50 shrink-0 transition-colors" strokeWidth={1.8} />
        </Link>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== "/portal/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white hover:bg-white/[0.06]"
                )}
              >
                <Icon
                  size={15}
                  className={active ? "text-white" : "text-white/40"}
                  strokeWidth={active ? 2.2 : 1.8}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-5 space-y-0.5 border-t border-white/[0.07] mt-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium text-white/40 hover:text-white hover:bg-white/[0.06] transition-all duration-150"
          >
            <Home size={15} strokeWidth={1.8} />
            Back to Site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium text-white/40 hover:text-red-400 hover:bg-white/[0.06] transition-all duration-150"
          >
            <LogOut size={15} strokeWidth={1.8} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Mobile header ────────────────────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 bg-[#0B1F3A]/95 backdrop-blur-xl px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <Image
            src="/logo.svg"
            alt="Hasker & Co."
            width={100}
            height={26}
            className="h-6 w-auto brightness-0 invert"
          />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/portal/profile"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={15} />
          </Link>
          <span className="text-xs text-white/50 font-medium">{user.first_name}</span>
          <button
            onClick={handleLogout}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {/* ── Mobile bottom nav ────────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/90 backdrop-blur-xl border-t border-black/[0.06] flex">
        {mobileNavItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== "/portal/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 pt-2.5 pb-3 text-[10px] font-semibold tracking-tight transition-colors",
                active ? "text-brand" : "text-[#6E6E73] hover:text-brand"
              )}
            >
              <Icon size={19} strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center gap-1 pt-2.5 pb-3 text-[10px] font-semibold tracking-tight text-[#6E6E73] hover:text-red-500 transition-colors"
        >
          <LogOut size={19} strokeWidth={1.8} />
          Sign Out
        </button>
      </nav>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 pt-16 pb-24 lg:pt-0 lg:pb-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
