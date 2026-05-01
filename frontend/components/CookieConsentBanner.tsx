"use client";

import { useEffect, useState } from "react";
import { consentDecided, grantConsent, denyConsent } from "@/lib/tracking";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!consentDecided()) setVisible(true);
  }, []);

  if (!visible) return null;

  function handleAccept() {
    grantConsent();
    setVisible(false);
  }

  function handleDecline() {
    denyConsent();
    setVisible(false);
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-[9999] bg-[#0B1F3A] border-t border-[#1A56DB]/40 shadow-[0_-4px_24px_rgba(0,0,0,0.4)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-slate-300 leading-relaxed">
          We use cookies to improve your experience and understand how you found us.{" "}
          <a
            href="/privacy"
            className="text-[#4A90E2] underline underline-offset-2 hover:text-blue-300 transition-colors"
          >
            Privacy Policy
          </a>
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDecline}
            className="cursor-pointer px-4 py-2 text-sm text-slate-400 border border-slate-600 rounded-md hover:border-slate-400 hover:text-slate-200 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="cursor-pointer px-5 py-2 text-sm font-semibold bg-[#1A56DB] text-white rounded-md hover:bg-blue-500 transition-colors"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
