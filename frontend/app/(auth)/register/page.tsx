"use client";

import { useState, Suspense, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/auth";

type Step = "signup" | "verify" | "onboarding";

function MultiStepRegister() {
  const { register, verifyEmail, resendOTP } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/portal/profile";

  const [step, setStep] = useState<Step>("signup");
  
  // Step 1: Signup Form
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "",
    phone: "", password: "", confirm_password: "",
  });
  const [showPass, setShowPass] = useState(false);
  
  // Step 2: Verification
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Step 3: Onboarding
  const [intent, setIntent] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // --- Handlers ---
  async function handleSignup(e: React.FormEvent) {
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
      setStep("verify");
      setResendCooldown(60);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const otp = code.join("");
    if (otp.length < 6) {
      setError("Please enter the 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      await verifyEmail(form.email, otp);
      setStep("onboarding");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setError("");
    try {
      await resendOTP(form.email);
      setResendCooldown(60);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend code.");
    }
  }

  // Refactored API call for onboarding
  const completeOnboarding = useCallback(async (selectedIntent: string) => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/v1/auth/me/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          onboarding_completed: true,
          preferences: { primary_intent: selectedIntent },
        }),
      });
      if (!res.ok) throw new Error("Failed to save preferences.");
      router.push(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred.");
      setLoading(false); // only stop loading on error, let redirect handle the rest
    }
  }, [next, router]);

  async function handleOnboarding(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    await completeOnboarding(intent);
  }

  // Auto-complete onboarding if there's a custom 'next' URL
  useEffect(() => {
    if (step === "onboarding" && next !== "/portal/profile") {
      // Determine default intent based on next url
      const defaultIntent = next.includes("apply") || next.includes("rent") 
        ? "renting" 
        : "exploring";
      
      // Auto-redirect after a short delay for a seamless experience
      const timer = setTimeout(() => {
        completeOnboarding(defaultIntent);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step, next, completeOnboarding]);

  // Effect for cooldown timer
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (resendCooldown > 0) {
      t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const inputCls = "w-full rounded-xl px-4 py-3 text-[14px] text-[#1D1D1F] bg-[#F5F5F7] outline-none transition-all focus:bg-white focus:ring-2 focus:ring-brand/30 focus:shadow-[0_0_0_1px_#1A56DB]";

  // Handle OTP Inputs
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
       // Handle paste functionality across inputs
       const pasted = value.slice(0, 6).split('');
       const newCode = [...code];
       for(let i=0; i<pasted.length; i++){
          if(index + i < 6) newCode[index + i] = pasted[i];
       }
       setCode(newCode);
       const nextIndex = Math.min(index + pasted.length, 5);
       document.getElementById(`otp-${nextIndex}`)?.focus();
       return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Auto advance
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.08)] p-8 overflow-hidden relative min-h-[480px]">
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200/60 text-red-600 text-[12px] rounded-xl px-4 py-3 flex items-start gap-2 absolute top-8 left-8 right-8 z-10">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}
        
        <AnimatePresence mode="wait">
          {step === "signup" && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className={error ? "pt-12" : ""}
            >
              <div className="mb-7">
                <h1 className="text-[22px] font-semibold tracking-tight text-[#1D1D1F] mb-1">
                  Create your account
                </h1>
                <p className="text-[13px] text-[#6E6E73]">
                  Join Hasker &amp; Co. Realty Group
                </p>
              </div>

              <form onSubmit={handleSignup} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold tracking-[0.07em] uppercase text-[#6E6E73] mb-1.5">First Name</label>
                    <input type="text" required value={form.first_name} onChange={(e) => update("first_name", e.target.value)} placeholder="Jane" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold tracking-[0.07em] uppercase text-[#6E6E73] mb-1.5">Last Name</label>
                    <input type="text" required value={form.last_name} onChange={(e) => update("last_name", e.target.value)} placeholder="Smith" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold tracking-[0.07em] uppercase text-[#6E6E73] mb-1.5">Email Address</label>
                  <input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" className={inputCls} />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold tracking-[0.07em] uppercase text-[#6E6E73] mb-1.5">Phone <span className="normal-case font-normal text-[#C7C7CC]">(optional)</span></label>
                  <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+1 555-000-0000" className={inputCls} />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold tracking-[0.07em] uppercase text-[#6E6E73] mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} required value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Min. 8 characters" className={`${inputCls} pr-11`} />
                    <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E6E73] hover:text-[#1D1D1F] transition-colors">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold tracking-[0.07em] uppercase text-[#6E6E73] mb-1.5">Confirm Password</label>
                  <input type={showPass ? "text" : "password"} required value={form.confirm_password} onChange={(e) => update("confirm_password", e.target.value)} placeholder="Re-enter password" className={inputCls} />
                </div>

                <button type="submit" disabled={loading} className="w-full bg-brand text-white rounded-xl py-3 text-[13px] font-semibold hover:bg-brand-hover transition-colors disabled:opacity-50 mt-1 flex items-center justify-center">
                  {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Continue"}
                </button>
              </form>

              <p className="mt-6 text-center text-[13px] text-[#6E6E73]">
                Already have an account?{" "}
                <Link href={`/login${next !== "/portal/profile" ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-brand font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </motion.div>
          )}

          {step === "verify" && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className={`flex flex-col h-full justify-center ${error ? "pt-12" : ""}`}
            >
              <div className="mb-7 text-center">
                <div className="w-12 h-12 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <h1 className="text-[22px] font-semibold tracking-tight text-[#1D1D1F] mb-2">
                  Check your email
                </h1>
                <p className="text-[14px] text-[#6E6E73] px-4 leading-relaxed">
                  We sent a 6-digit verification code to <span className="font-medium text-[#1D1D1F]">{form.email}</span>
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-6">
                <div className="flex gap-2 justify-center">
                  {code.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-12 h-14 rounded-xl border border-[#D2D2D7] text-center text-[24px] font-semibold text-[#1D1D1F] focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                    />
                  ))}
                </div>

                <button type="submit" disabled={loading} className="w-full bg-brand text-white rounded-xl py-3 text-[13px] font-semibold hover:bg-brand-hover transition-colors disabled:opacity-50">
                  {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : "Verify Email"}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-[13px] text-[#6E6E73]">
                  Didn't receive the email?{" "}
                  <button 
                    onClick={handleResend}
                    disabled={resendCooldown > 0} 
                    className="text-brand font-semibold hover:underline disabled:opacity-50 disabled:hover:no-underline"
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Click to resend"}
                  </button>
                </p>
              </div>
            </motion.div>
          )}

          {step === "onboarding" && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col h-full justify-center"
            >
              {next !== "/portal/profile" ? (
                // Seamless continuation screen
                <div className="flex flex-col h-full justify-center items-center text-center px-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={36} />
                  </div>
                  <h1 className="text-[26px] font-semibold tracking-tight text-[#1D1D1F] mb-3">
                    Account Created!
                  </h1>
                  <p className="text-[15px] text-[#6E6E73] leading-relaxed mb-8 max-w-sm">
                    Welcome to Hasker &amp; Co. Realty Group. Your email is verified and you&apos;re ready to go.
                  </p>
                  
                  <button 
                    onClick={() => completeOnboarding(next.includes("apply") || next.includes("rent") ? "renting" : "exploring")}
                    disabled={loading} 
                    className="w-full max-w-[280px] bg-brand text-white rounded-xl py-4 text-[15px] font-semibold hover:bg-brand-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm mx-auto"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>Continue to {next.includes("apply") ? "Application" : "Property"} <ArrowRight size={18} /></>
                    )}
                  </button>
                  <p className="text-[13px] text-[#6E6E73] mt-4">
                    Redirecting automatically in a few seconds...
                  </p>
                </div>
              ) : (
                // Original intent selection screen
                <>
                  <div className="mb-8 text-center mt-4">
                    <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-5">
                      <CheckCircle2 size={32} />
                    </div>
                    <h1 className="text-[26px] font-semibold tracking-tight text-[#1D1D1F] mb-2">
                      Welcome aboard!
                    </h1>
                    <p className="text-[15px] text-[#6E6E73] px-2 leading-relaxed">
                      Your email is verified. To give you the best experience, what are you primarily looking to do?
                    </p>
                  </div>

                  <form onSubmit={handleOnboarding} className="space-y-3 px-2">
                    {[
                      { id: 'buying', label: 'Buying a property', desc: 'Find your dream home' },
                      { id: 'selling', label: 'Selling a property', desc: 'List and market your asset' },
                      { id: 'renting', label: 'Renting', desc: 'Find a place to lease' },
                      { id: 'exploring', label: 'Just Exploring', desc: 'Browsing the market' }
                    ].map(option => (
                      <label 
                        key={option.id}
                        className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${
                          intent === option.id 
                            ? 'border-brand bg-brand/5 shadow-[0_0_0_1px_rgba(26,86,219,1)]' 
                            : 'border-[#D2D2D7] hover:border-[#86868B] bg-white'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="intent" 
                          value={option.id}
                          checked={intent === option.id}
                          onChange={(e) => setIntent(e.target.value)}
                          className="sr-only" 
                        />
                        <div className="flex-1">
                          <div className={`text-[15px] font-semibold ${intent === option.id ? 'text-brand' : 'text-[#1D1D1F]'}`}>
                            {option.label}
                          </div>
                          <div className="text-[13px] text-[#6E6E73] mt-0.5">{option.desc}</div>
                        </div>
                        {intent === option.id && (
                          <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                        )}
                      </label>
                    ))}

                    <div className="pt-6">
                      <button 
                        type="submit" 
                        disabled={!intent || loading} 
                        className="w-full bg-brand text-white rounded-xl py-4 text-[15px] font-semibold hover:bg-brand-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                      >
                        {loading ? (
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>Go to Dashboard <ArrowRight size={18} /></>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.08)] p-8 h-[480px] animate-pulse" />
      </div>
    }>
      <MultiStepRegister />
    </Suspense>
  );
}
