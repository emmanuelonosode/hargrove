import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
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
    default: "Hasker & Co. Realty Group | Affordable Rental Homes & Apartments",
    template: "%s | Hasker & Co. Realty Group",
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
  authors: [{ name: "Hasker & Co. Realty Group", url: "https://haskerrealtygroup.com" }],
  creator: "Hasker & Co. Realty Group",
  publisher: "Hasker & Co. Realty Group",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://haskerrealtygroup.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://haskerrealtygroup.com",
    siteName: "Hasker & Co. Realty Group",
    title: "Hasker & Co. Realty Group | Affordable Rental Homes & Apartments",
    description: "Discover quality, affordable rental homes and apartments with no hidden fees and fast approvals.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hasker & Co. Realty Group | Affordable Rental Homes & Apartments",
    description:
      "Find affordable rental apartments and homes across Atlanta, Charlotte, Houston, Dallas, Nashville & more. No hidden fees, fast approvals.",
    creator: "@haskerrealty",
  },
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png', sizes: '320x320' },
    ],
    apple: '/apple-icon.png',
    shortcut: '/icon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    "llms-txt": "https://haskerrealtygroup.com/llms.txt",
    "llms-full-txt": "https://haskerrealtygroup.com/llms-full.txt",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "Hasker & Co. Realty Group",
  "image": "https://haskerrealtygroup.com/logo/logo.png",
  "logo": "https://haskerrealtygroup.com/logo/logo.png",
  "url": "https://haskerrealtygroup.com",
  "telephone": "+14045550182",
  "email": "info@haskerrealtygroup.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "213 Bob Ln",
    "addressLocality": "Virginia Beach",
    "addressRegion": "VA",
    "postalCode": "23454",
    "addressCountry": "US"
  },
  "areaServed": [
    {"@type": "City", "name": "Atlanta"},
    {"@type": "City", "name": "Charlotte"},
    {"@type": "City", "name": "Houston"},
    {"@type": "City", "name": "Dallas"},
    {"@type": "City", "name": "Nashville"}
  ],
  "priceRange": "$$",
  "makesOffer": [
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Affordable Home Rentals",
        "description": "Providing quality, affordable rental homes and apartments with fast approvals and no hidden fees."
      }
    },
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Property Management",
        "description": "Professional property management services ensuring tenant satisfaction and property upkeep."
      }
    },
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Relocation Assistance",
        "description": "Helping families and individuals relocate seamlessly to new cities."
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfairDisplay.variable} h-full scroll-smooth`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
