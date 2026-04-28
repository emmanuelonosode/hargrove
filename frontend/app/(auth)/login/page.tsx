"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import Image from "next/image";

// Simulated high-quality images from Unsplash for real estate
const HOUSE_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1600566753086-00f18efc2291?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600",
];

const HouseCard = ({ src }: { src: string }) => (
  <div className="w-[300px] h-[200px] shrink-0 rounded-2xl overflow-hidden relative shadow-lg">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
  </div>
);

function MarqueeRow({ direction = "left", items, speed = "35s" }: { direction?: "left" | "right", items: string[], speed?: string }) {
  // We duplicate the items array twice to create a seamless infinite scroll loop
  const list = [...items, ...items, ...items];
  const animationName = direction === "left" ? "scrollLeft" : "scrollRight";

  return (
    <div className="flex w-max shrink-0 gap-6" style={{ animation: `${animationName} ${speed} linear infinite` }}>
      {list.map((src, idx) => (
        <HouseCard key={idx} src={src} />
      ))}
    </div>
  );
}

function SplitScreenLogin() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/portal/profile";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full rounded-xl px-4 py-3.5 text-[14px] text-[#1D1D1F] bg-[#F5F5F7] border border-transparent outline-none transition-all placeholder:text-[#86868B] focus:bg-white focus:border-[#1A56DB] focus:ring-4 focus:ring-[#1A56DB]/10";

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-full bg-white overflow-hidden font-sans">
      <h1 className="sr-only">Sign In | Hasker &amp; Co. Realty Group</h1>

      {/* Dynamic Keyframes for Marquee */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scrollLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-33.33%); }
        }
        @keyframes scrollRight {
          from { transform: translateX(-33.33%); }
          to { transform: translateX(0); }
        }
      `}} />

      {/* LEFT SIDE: Visual Hook (60%) */}
      <div className="hidden lg:flex w-[60%] flex-col gap-6 justify-center bg-[#0B1F3A] relative overflow-hidden">
        
        {/* Subtle overlay gradients for smooth edge fading */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0B1F3A] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0B1F3A] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1F3A]/60 via-transparent to-[#0B1F3A]/60 z-10 pointer-events-none" />

        {/* Floating Grid */}
        <div className="flex flex-col gap-6 transform rotate-[-4deg] scale-110 opacity-80">
          <MarqueeRow direction="right" items={HOUSE_IMAGES} speed="45s" />
          <MarqueeRow direction="left" items={[...HOUSE_IMAGES].reverse()} speed="40s" />
          <MarqueeRow direction="right" items={HOUSE_IMAGES} speed="50s" />
        </div>

        {/* Branding — logo + tagline only, no glass */}
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center pointer-events-none">
          <Image
            src="/logo.svg"
            alt="Hasker & Co. Realty Group"
            width={180}
            height={48}
            className="brightness-0 invert mb-4"
          />
          <p className="text-white/50 text-[14px] tracking-wide font-medium">
            Comfortable Living, Within Your Budget.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Form (40%) */}
      <div className="w-full lg:w-[40%] h-full flex flex-col relative px-8 sm:px-16 lg:px-20 overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center py-12 max-w-[420px] mx-auto w-full">
          
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-[28px] font-semibold text-[#1D1D1F] tracking-tight mb-2">
              Sign in
            </h2>
            <p className="text-[15px] text-[#6E6E73]">
              Welcome back to your tenant portal
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-[13px] rounded-xl px-4 py-3.5 flex items-start gap-2 shadow-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[12px] font-semibold text-[#1D1D1F] mb-1.5 ml-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 ml-1 mr-1">
                <label className="block text-[12px] font-semibold text-[#1D1D1F]">
                  Password
                </label>
                <Link href="/forgot-password" className="text-[12px] text-[#1A56DB] hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputCls} pr-12`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F] transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A56DB] text-white rounded-xl py-3.5 text-[15px] font-semibold hover:bg-[#1447BF] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-[13px] text-[#6E6E73] font-medium">
            Don&apos;t have an account?{" "}
            <Link
              href={`/register${next !== "/portal/profile" ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="text-[#1A56DB] font-semibold hover:underline"
            >              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <SplitScreenLogin />
    </Suspense>
  );
}

