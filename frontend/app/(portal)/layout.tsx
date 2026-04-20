"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  LogOut,
  Home,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { label: "Dashboard", href: "/portal/dashboard", icon: LayoutDashboard },
  { label: "Payments", href: "/portal/payments", icon: CreditCard },
  { label: "Documents", href: "/portal/documents", icon: FileText },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-brand-dark text-white shrink-0">
        <div className="px-6 py-6 border-b border-white/10">
          <Link href="/">
            <Image
              src="/logo.svg"
              alt="Hasker & Co. Realty Group"
              width={140}
              height={36}
              className="h-8 w-auto brightness-0 invert"
            />
          </Link>
          <p className="text-[10px] tracking-widest uppercase text-blue-300 mt-1">Tenant Portal</p>
        </div>

        <div className="px-4 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-sm font-bold shrink-0">
              {user.first_name[0]}{user.last_name[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user.full_name}</p>
              <p className="text-xs text-blue-300 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-brand text-white"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Home size={16} />
            Back to Site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-white/70 hover:text-red-400 hover:bg-white/10 transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 bg-brand-dark text-white px-4 py-3 flex items-center justify-between shadow-md">
        <Link href="/">
          <Image src="/logo.svg" alt="Hasker & Co." width={110} height={28} className="h-7 w-auto brightness-0 invert" />
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-blue-300">{user.first_name}</span>
          <button onClick={handleLogout} className="p-1.5 rounded-md hover:bg-white/10 transition-colors" aria-label="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-neutral-200 flex">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
              pathname === href ? "text-brand" : "text-neutral-400 hover:text-brand"
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium text-neutral-400 hover:text-red-500 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </nav>

      {/* Main content */}
      <main className="flex-1 min-w-0 pt-16 pb-20 lg:pt-0 lg:pb-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
