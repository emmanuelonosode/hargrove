"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/portal/dashboard";

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

  const inputCls = "w-full rounded-xl px-4 py-3 text-[14px] text-[#1D1D1F] bg-[#F5F5F7] outline-none transition-all focus:bg-white focus:ring-2 focus:ring-brand/30 focus:shadow-[0_0_0_1px_#1A56DB]";

  return (
    <>
      {error && (
        <div className="mb-5 bg-red-50 border border-red-200/60 text-red-600 text-[12px] rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-[11px] font-semibold tracking-[0.07em] uppercase text-[#6E6E73] mb-1.5">
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
          <label className="block text-[11px] font-semibold tracking-[0.07em] uppercase text-[#6E6E73] mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputCls} pr-11`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand text-white rounded-xl py-3 text-[13px] font-semibold hover:bg-brand-hover transition-colors disabled:opacity-50 mt-1"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Signing in…
            </span>
          ) : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-[#6E6E73]">
        Don&apos;t have an account?{" "}
        <Link
          href={`/register${next !== "/portal/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="text-brand font-semibold hover:underline"
        >
          Create one
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.08)] p-8">
        <div className="mb-7">
          <h1 className="text-[22px] font-semibold tracking-tight text-[#1D1D1F] mb-1">
            Welcome back
          </h1>
          <p className="text-[13px] text-[#6E6E73]">Sign in to your tenant portal</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
