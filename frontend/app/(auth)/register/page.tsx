"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/portal/dashboard";

  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "",
    phone: "", password: "", confirm_password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone || undefined,
      });
      router.push(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full rounded-xl px-4 py-3 text-[14px] text-[#1D1D1F] bg-[#F5F5F7] outline-none transition-all focus:bg-white focus:ring-2 focus:ring-brand/30 focus:shadow-[0_0_0_1px_#1A56DB]";

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.08)] p-8">
        <div className="mb-7">
          <h1 className="text-[22px] font-semibold tracking-tight text-[#1D1D1F] mb-1">
            Create your account
          </h1>
          <p className="text-[13px] text-[#6E6E73]">
            Access your tenant portal and manage payments
          </p>
        </div>

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200/60 text-red-600 text-[12px] rounded-xl px-4 py-3 flex items-start gap-2">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.07em] uppercase text-[#6E6E73] mb-1.5">
                First Name
              </label>
              <input
                type="text"
                required
                value={form.first_name}
                onChange={(e) => update("first_name", e.target.value)}
                placeholder="Jane"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.07em] uppercase text-[#6E6E73] mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                required
                value={form.last_name}
                onChange={(e) => update("last_name", e.target.value)}
                placeholder="Smith"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold tracking-[0.07em] uppercase text-[#6E6E73] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@example.com"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold tracking-[0.07em] uppercase text-[#6E6E73] mb-1.5">
              Phone <span className="normal-case font-normal text-[#C7C7CC]">(optional)</span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+1 555-000-0000"
              className={inputCls}
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
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Min. 8 characters"
                className={`${inputCls} pr-11`}
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

          <div>
            <label className="block text-[11px] font-semibold tracking-[0.07em] uppercase text-[#6E6E73] mb-1.5">
              Confirm Password
            </label>
            <input
              type={showPass ? "text" : "password"}
              required
              value={form.confirm_password}
              onChange={(e) => update("confirm_password", e.target.value)}
              placeholder="Re-enter password"
              className={inputCls}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-white rounded-xl py-3 text-[13px] font-semibold hover:bg-brand-hover transition-colors disabled:opacity-50 mt-1"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating account…
              </span>
            ) : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-[#6E6E73]">
          Already have an account?{" "}
          <Link
            href={`/login${next !== "/portal/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="text-brand font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.08)] p-8 h-[500px] animate-pulse" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
