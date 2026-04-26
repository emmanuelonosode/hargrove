import type { Metadata } from "next";

// Transactional confirmation page — no SEO value, keep out of index.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function SuccessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
