"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { hasConsent, captureUTMs, captureReferralCode, captureLocation, getStructuredDevice, getStoredUTMs, getStoredReferralCode, getStoredLocation } from "@/lib/tracking";

const SESSION_KEY = "hasker_session_id";
const CAPTURED_KEY = "hasker_visitor_sent";

function getOrCreateSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

async function sendVisitorSession(): Promise<void> {
  if (sessionStorage.getItem(CAPTURED_KEY) === "true") return;
  sessionStorage.setItem(CAPTURED_KEY, "true"); // optimistic — prevent duplicate calls

  const device   = getStructuredDevice();
  const utms     = getStoredUTMs();
  const location = getStoredLocation();

  try {
    await fetch("/api/v1/analytics/visitors/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id:    getOrCreateSessionId(),
        city:          location.city          ?? "",
        region:        location.region        ?? "",
        country_code:  location.country_code  ?? "",
        browser:       device.browser,
        os:            device.os,
        device_type:   device.device_type,
        screen:        device.screen,
        language:      device.language,
        timezone:      device.timezone,
        referrer:      device.referrer,
        landing_page:  device.landing_page,
        utm_source:    utms.utm_source    ?? "",
        utm_medium:    utms.utm_medium    ?? "",
        utm_campaign:  utms.utm_campaign  ?? "",
        referral_code: getStoredReferralCode(),
      }),
      keepalive: true,
    });
  } catch {
    // Never block the page — silently swallow errors
    sessionStorage.removeItem(CAPTURED_KEY); // allow retry on next interaction
  }
}

const GTM_ID   = process.env.NEXT_PUBLIC_GTM_ID;
const GA_ID    = process.env.NEXT_PUBLIC_GA_ID;
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export function TrackingScripts() {
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    captureUTMs();
    captureReferralCode();
    captureLocation(); // async — populates sessionStorage, ready before sendVisitorSession fires

    const consentVal = hasConsent();
    setTimeout(() => setConsent(consentVal), 0);
    const handler = () => setConsent(true);
    window.addEventListener("hasker:consent-granted", handler);

    // ── Visitor session capture ──────────────────────────────────────────────
    // Fire once per session on first meaningful interaction (scroll, click, or
    // 8 seconds on page). Waits for captureLocation() to resolve so city is
    // available. keepalive:true ensures it completes even if user navigates away.
    let fired = false;
    const fire = () => {
      if (fired) return;
      fired = true;
      cleanup();
      // Small delay so captureLocation() has time to populate sessionStorage
      setTimeout(sendVisitorSession, 800);
    };

    const timer = setTimeout(fire, 8000);
    const onScroll = () => fire();
    const onClick  = () => fire();

    document.addEventListener("scroll",  onScroll, { passive: true, once: true });
    document.addEventListener("click",   onClick,  { once: true });

    function cleanup() {
      clearTimeout(timer);
      document.removeEventListener("scroll", onScroll);
      document.removeEventListener("click",  onClick);
    }

    return () => {
      window.removeEventListener("hasker:consent-granted", handler);
      cleanup();
    };
  }, []);

  return (
    <>
      {/* ── GA4 — fires on every visit, no consent required ─────────── */}
      {GA_ID && (
        <Script
          id="ga4-script"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        />
      )}
      {GA_ID && (
        <Script
          id="ga4-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`,
          }}
        />
      )}

      {/* ── GTM — fires on every visit, no consent required ─────────── */}
      {GTM_ID && (
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />
      )}
      {GTM_ID && (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
      )}

      {/* ── Meta Pixel — consent-gated (sets advertising cookies) ───── */}
      {consent && PIXEL_ID && (
        <Script
          id="meta-pixel-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${PIXEL_ID}');
fbq('track','PageView');`,
          }}
        />
      )}
      {consent && PIXEL_ID && (
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      )}
    </>
  );
}
