import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Hasker & Co. Realty Group — Affordable Rental Homes & Apartments",
    template: "%s — Hasker & Co. Realty Group",
  },
  description:
    "Find affordable rental apartments and homes across Atlanta, Charlotte, Houston, Dallas, Nashville & more. No hidden fees, fast approvals, 500+ units available.",
  keywords: [
    "affordable homes for rent",
    "cheap rentals near me",
    "homes for rent",
    "homes for sale",
    "affordable apartments",
    "cheap houses to rent",
    "low cost homes",
    "Atlanta rentals",
    "Charlotte affordable homes",
    "Houston homes for rent",
    "Dallas cheap rentals",
    "Nashville affordable housing",
    "Phoenix homes for rent",
    "Austin rentals",
    "Denver affordable homes",
    "Tampa rentals",
    "Raleigh homes for rent",
    "no hidden fees rental",
    "fast rental approval",
    "family homes for rent",
  ],
  authors: [{ name: "Hasker & Co. Realty Group" }],
  creator: "Hasker & Co. Realty Group",
  metadataBase: new URL("https://haskerrealtygroup.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://haskerrealtygroup.com",
    siteName: "Hasker & Co. Realty Group",
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "llms-txt": "https://haskerrealtygroup.com/llms.txt",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfairDisplay.variable} h-full scroll-smooth`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
