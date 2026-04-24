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
  <div className="w-[300px] h-[200px] shrink-0 rounded-2xl overflow-hidden relative shadow-lg transform transition-transform duration-500 hover:scale-[1.02]">
    <Image src={src} alt="Luxury Real Estate" fill className="object-cover" />
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

          {/* OAuth Provider */}
          <button type="button" className="w-full flex items-center justify-center gap-3 bg-white border border-[#D2D2D7] rounded-xl py-3.5 text-[14px] font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors mb-6 shadow-sm">
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative flex items-center mb-6">
            <div className="flex-grow border-t border-[#E5E5EA]"></div>
            <span className="flex-shrink-0 mx-4 text-[12px] uppercase tracking-wider font-medium text-[#86868B]">Or continue with email</span>
            <div className="flex-grow border-t border-[#E5E5EA]"></div>
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

