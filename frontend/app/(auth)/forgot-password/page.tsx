"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const inputCls =
    "w-full rounded-xl px-4 py-3 text-[14px] text-[#1D1D1F] bg-[#F5F5F7] outline-none transition-all focus:bg-white focus:ring-2 focus:ring-brand/30 focus:shadow-[0_0_0_1px_#1A56DB]";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/v1/auth/password-reset/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Whether or not the email exists, we always show success for security
      if (res.ok || res.status === 400) {
        setStatus("success");
      } else {
        throw new Error("Request failed");
      }
    } catch {
      // Show success anyway — never confirm/deny if email exists
      setStatus("success");
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.08)] p-8">
        {status === "success" ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="text-[22px] font-semibold tracking-tight text-[#1D1D1F] mb-2">
              Check your email
            </h1>
            <p className="text-[14px] text-[#6E6E73] leading-relaxed mb-6 px-2">
              If an account exists for{" "}
              <span className="font-medium text-[#1D1D1F]">{email}</span>, you
              will receive a password reset link shortly.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-brand hover:underline"
            >
              <ArrowLeft size={14} />
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-7">
              <h1 className="text-[22px] font-semibold tracking-tight text-[#1D1D1F] mb-1">
                Forgot your password?
              </h1>
              <p className="text-[13px] text-[#6E6E73]">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            {message && status === "error" && (
              <div className="mb-5 bg-red-50 border border-red-200/60 text-red-600 text-[12px] rounded-xl px-4 py-3 flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold tracking-[0.07em] uppercase text-[#6E6E73] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === "loading" || !email}
                className="w-full bg-brand text-white rounded-xl py-3 text-[13px] font-semibold hover:bg-brand-hover transition-colors disabled:opacity-50 flex items-center justify-center mt-1"
              >
                {status === "loading" ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-[13px] text-[#6E6E73]">
              Remember your password?{" "}
              <Link href="/login" className="text-brand font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
