"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
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
      router.push("/portal/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  const field = (label: string, key: string, type = "text", placeholder = "") => (
    <div>
      <label className="block text-xs font-semibold tracking-wide text-neutral-500 uppercase mb-1.5">
        {label}
      </label>
      <input
        type={type}
        required={key !== "phone"}
        value={form[key as keyof typeof form]}
        onChange={(e) => update(key, e.target.value)}
        placeholder={placeholder}
        className="w-full border border-neutral-200 rounded-md px-4 py-2.5 text-sm text-brand-dark focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
      />
    </div>
  );

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-8">
        <div className="mb-8">
          <h1 className="font-serif text-2xl font-bold text-brand-dark mb-1">Create your account</h1>
          <p className="text-sm text-neutral-500">Access your tenant portal and manage payments</p>
        </div>

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {field("First Name", "first_name", "text", "Jane")}
            {field("Last Name", "last_name", "text", "Smith")}
          </div>
          {field("Email Address", "email", "email", "you@example.com")}
          {field("Phone (optional)", "phone", "tel", "+1 555-000-0000")}
          {field("Password", "password", "password", "Min. 8 characters")}
          {field("Confirm Password", "confirm_password", "password", "Re-enter password")}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-white rounded-md py-2.5 text-sm font-semibold hover:bg-brand-hover transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link href="/login" className="text-brand font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
