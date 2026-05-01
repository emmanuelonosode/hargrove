"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { hasConsent, captureUTMs, captureLocation } from "@/lib/tracking";

export function TrackingScripts() {
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    // UTM + location capture run regardless of consent — no PII leaves the browser
    captureUTMs();
    captureLocation();

    setConsent(hasConsent());
    const handler = () => setConsent(true);
    window.addEventListener("hasker:consent-granted", handler);
    return () => window.removeEventListener("hasker:consent-granted", handler);
  }, []);

  if (!consent) return null;

  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  if (!gtmId) return null;

  return (
    <>
      {/* GTM main script */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`,
        }}
      />
      {/* GTM noscript fallback — for browsers with JavaScript disabled */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
    </>
  );
}
