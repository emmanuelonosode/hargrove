declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    fbq: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

const CONSENT_KEY = "hasker_cookie_consent";
const CONSENT_EVENT = "hasker:consent-granted";
const UTM_KEY = "hasker_utms";

// ── Consent ───────────────────────────────────────────────────────────────────

export function hasConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(CONSENT_KEY) === "granted";
}

export function consentDecided(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(CONSENT_KEY) !== null;
}

export function grantConsent(): void {
  localStorage.setItem(CONSENT_KEY, "granted");
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

export function denyConsent(): void {
  localStorage.setItem(CONSENT_KEY, "denied");
}

// ── UTM Capture ───────────────────────────────────────────────────────────────

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

/**
 * Reads UTM params from the current URL and stores them in sessionStorage.
 * Only overwrites if the URL contains fresh UTM values (paid/organic click).
 * Safe to call without consent — no data leaves the browser.
 */
export function captureUTMs(): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const source   = params.get("utm_source");
  const medium   = params.get("utm_medium");
  const campaign = params.get("utm_campaign");
  if (source || medium || campaign) {
    const utms: UTMParams = {};
    if (source)   utms.utm_source   = source;
    if (medium)   utms.utm_medium   = medium;
    if (campaign) utms.utm_campaign = campaign;
    sessionStorage.setItem(UTM_KEY, JSON.stringify(utms));
  }
}

/** Returns stored UTM params for attaching to form payloads. */
export function getStoredUTMs(): UTMParams {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(UTM_KEY);
    return raw ? (JSON.parse(raw) as UTMParams) : {};
  } catch {
    return {};
  }
}

// ── Location Intelligence ─────────────────────────────────────────────────────

const LOCATION_KEY = "hasker_location";
const SEARCH_INTENT_KEY = "hasker_search_intent";

export interface LocationData {
  city?: string;
  region?: string;
  country_code?: string;
}

/**
 * Silently detects city from IP via ipapi.co — no browser permission needed.
 * Only runs once per session. Safe without consent (no PII sent to third party,
 * IP geolocation is standard industry practice).
 */
export async function captureLocation(): Promise<void> {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem(LOCATION_KEY)) return; // already captured this session
  try {
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return;
    const data = await res.json();
    const location: LocationData = {
      city: data.city ?? undefined,
      region: data.region ?? undefined,
      country_code: data.country_code ?? undefined,
    };
    sessionStorage.setItem(LOCATION_KEY, JSON.stringify(location));
  } catch {
    // Silently swallow — never block page load
  }
}

/** Returns the IP-detected location for the current session. */
export function getStoredLocation(): LocationData {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(LOCATION_KEY);
    return raw ? (JSON.parse(raw) as LocationData) : {};
  } catch {
    return {};
  }
}

/** Stores explicit search/browse intent city — overrides IP city when present. */
export function captureSearchIntent(city: string, listingType?: string): void {
  if (typeof window === "undefined" || !city.trim()) return;
  sessionStorage.setItem(
    SEARCH_INTENT_KEY,
    JSON.stringify({ city: city.trim(), listing_type: listingType ?? "" })
  );
}

/**
 * Returns the best known city for this visitor.
 * Priority: explicit search/browse intent > IP geolocation > ""
 */
export function getBestKnownCity(): string {
  if (typeof window === "undefined") return "";
  try {
    const intent = sessionStorage.getItem(SEARCH_INTENT_KEY);
    if (intent) {
      const parsed = JSON.parse(intent) as { city: string };
      if (parsed.city) return parsed.city;
    }
    const location = getStoredLocation();
    return location.city ?? "";
  } catch {
    return "";
  }
}

// ── GTM Events ────────────────────────────────────────────────────────────────

export function trackEvent(event: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined" || !hasConsent()) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}

export function trackPageView(url?: string): void {
  trackEvent("page_view", {
    page_location: typeof window !== "undefined" ? (url ?? window.location.href) : url,
  });
}

export function identifyUser(email: string, userId?: string | number): void {
  if (typeof window === "undefined" || !hasConsent()) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "identify_user",
    user_id: userId?.toString() ?? undefined,
    user_email: email,
  });
}

// ── Meta Pixel Events ─────────────────────────────────────────────────────────

/** Fires a standard Meta Pixel event (fbq("track", ...)). No-ops if Pixel not loaded or no consent. */
export function trackMetaEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === "undefined" || !hasConsent()) return;
  if (typeof window.fbq !== "function") return;
  window.fbq("track", eventName, params ?? {});
}

/** Fires a custom Meta Pixel event (fbq("trackCustom", ...)). */
export function trackMetaCustom(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === "undefined" || !hasConsent()) return;
  if (typeof window.fbq !== "function") return;
  window.fbq("trackCustom", eventName, params ?? {});
}
