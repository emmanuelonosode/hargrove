"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/portal/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold tracking-wide text-neutral-500 uppercase mb-1.5">
            Email address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-neutral-200 rounded-md px-4 py-2.5 text-sm text-brand-dark focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-wide text-neutral-500 uppercase mb-1.5">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-neutral-200 rounded-md px-4 py-2.5 text-sm text-brand-dark focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand text-white rounded-md py-2.5 text-sm font-semibold hover:bg-brand-hover transition-colors disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-brand font-medium hover:underline">
          Create one
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-8">
        <div className="mb-8">
          <h1 className="font-serif text-2xl font-bold text-brand-dark mb-1">Welcome back</h1>
          <p className="text-sm text-neutral-500">Sign in to your tenant portal</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
