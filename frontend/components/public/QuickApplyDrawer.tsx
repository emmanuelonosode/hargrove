"use client";

import { useEffect, useRef, useState } from "react";
import {
  X, Send, CheckCircle, AlertCircle, Loader2,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  roleId: string;
  roleTitle: string;
}

export function QuickApplyDrawer({ open, onClose, roleId, roleTitle }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      // Small delay so the drawer has animated in before focusing
      setTimeout(() => firstFieldRef.current?.focus(), 300);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function handleClose() {
    if (status !== "loading") onClose();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const raw = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/v1/careers/apply/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role_id: roleId,
          role_title: roleTitle,
          full_name: (raw.get("name") as string) ?? "",
          email: (raw.get("email") as string) ?? "",
          phone: (raw.get("phone") as string) ?? "",
          linkedin_url: (raw.get("linkedin_url") as string) ?? "",
          motivation: "Quick Apply submission",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const detail =
          typeof data === "object" && data !== null
            ? Object.values(data).flat().join(" ")
            : "Something went wrong. Please try again.";
        throw new Error(detail);
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const inputCls =
    "w-full border border-neutral-200 rounded-sm px-4 py-3 text-sm text-brand-dark " +
    "placeholder:text-neutral-400 focus:outline-none focus:border-brand focus:ring-1 " +
    "focus:ring-brand/20 transition-colors bg-white";

  const labelCls = "block text-xs font-semibold text-brand-dark mb-1.5";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-brand-dark/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Quick Apply — ${roleTitle}`}
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[500px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-7 pt-7 pb-5 border-b border-neutral-100 shrink-0">
          <div>
            <p className="text-brand text-[10px] font-bold tracking-[0.3em] uppercase mb-1">
              Quick Apply
            </p>
            <h2 className="font-serif text-xl font-bold text-brand-dark leading-snug">
              {roleTitle}
            </h2>
            <p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed">
              Takes less than 2 minutes · We review every application within 48 hours.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close drawer"
            className="shrink-0 w-8 h-8 flex items-center justify-center border border-neutral-200 rounded-sm text-neutral-400 hover:text-brand-dark hover:border-neutral-300 transition-colors mt-0.5"
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-7 py-7">
          {status === "success" ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mb-6">
                <CheckCircle size={26} className="text-green-600" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-brand-dark mb-3">
                Application Received
              </h3>
              <p className="text-sm text-neutral-500 leading-relaxed max-w-xs">
                Thanks for applying. We&apos;ll be in touch within 2–3 business days if there&apos;s
                a fit.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-8 text-sm text-brand font-semibold hover:underline"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className={labelCls}>
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  ref={firstFieldRef}
                  name="name"
                  type="text"
                  required
                  placeholder="Jane Smith"
                  className={inputCls}
                />
              </div>

              {/* Email */}
              <div>
                <label className={labelCls}>
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="jane@example.com"
                  className={inputCls}
                />
              </div>

              {/* Phone */}
              <div>
                <label className={labelCls}>
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="(757) 555-0100"
                  className={inputCls}
                />
              </div>

              {/* LinkedIn */}
              <div>
                <label className={labelCls}>
                  LinkedIn URL
                  <span className="text-neutral-400 font-normal ml-1">(optional)</span>
                </label>
                <input
                  name="linkedin_url"
                  type="url"
                  placeholder="https://linkedin.com/in/yourname"
                  className={inputCls}
                />
              </div>

              {/* Error */}
              {status === "error" && (
                <div className="flex items-start gap-3 rounded-sm bg-red-50 border border-red-200 px-4 py-3">
                  <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">
                    {errorMsg || "Something went wrong. Please try again."}
                  </p>
                </div>
              )}

              {/* Submit */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full flex items-center justify-center gap-2.5 bg-brand text-white text-sm font-bold px-7 py-3.5 rounded-sm hover:bg-brand/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Send Application
                    </>
                  )}
                </button>
                <p className="text-[11px] text-neutral-400 leading-relaxed mt-3 text-center">
                  Your information is kept private and never shared with third parties.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
