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
    // ── Brand keywords — teach search engines the correct spelling ──
    "Hasker Realty Group",
    "Hasker realty",
    "Hasker and Co Realty Group",
    "Hasker & Co Realty",
    "haskerrealtygroup.com",
    // ── Generic rental keywords ───────────────────────────────────
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

// ── Global entity graph — present on every page ──────────────────────────
// The @graph pattern lets Google resolve all entities together and is the
// correct way to establish an Organisation Knowledge Panel entry.
// alternateName is the primary signal that "Hasker" is intentional, not a
// typo — Google uses it to suppress "Did you mean?" autocorrections.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://haskerrealtygroup.com/#organization",
      "name": "Hasker & Co. Realty Group",
      "legalName": "Hasker & Co. Realty Group",
      // alternateName teaches Google every branded query that points here
      "alternateName": [
        "Hasker Realty Group",
        "Hasker Realty",
        "Hasker and Co Realty Group",
        "Hasker and Co Realty",
        "Hasker Co Realty Group",
        "Hasker & Co Realty"
      ],
      "url": "https://haskerrealtygroup.com",
      "logo": {
        "@type": "ImageObject",
        "@id": "https://haskerrealtygroup.com/#logo",
        "url": "https://haskerrealtygroup.com/logo/logo.png",
        "contentUrl": "https://haskerrealtygroup.com/logo/logo.png",
        "width": 280,
        "height": 48,
        "caption": "Hasker & Co. Realty Group"
      },
      "image": { "@id": "https://haskerrealtygroup.com/#logo" },
      "description": "Hasker & Co. Realty Group is a licensed US real estate company founded in 2012, specializing in affordable rental homes and budget-friendly properties for sale across 12+ US cities. No hidden fees, 24-hour application decisions, 2,000+ families housed.",
      "foundingDate": "2012",
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
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "telephone": "+14045550182",
          "email": "info@haskerrealtygroup.com",
          "availableLanguage": ["English"],
          "hoursAvailable": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
            "opens": "09:00",
            "closes": "18:00"
          }
        }
      ],
      "sameAs": [
        "https://www.instagram.com/haskerrealty",
        "https://www.linkedin.com/company/haskerrealty",
        "https://twitter.com/haskerrealty",
        "https://www.facebook.com/haskerrealty",
        "https://haskerrealtygroup.com"
      ],
      "slogan": "Quality Homes. Honest Prices. No Surprises.",
      "numberOfEmployees": { "@type": "QuantitativeValue", "minValue": 10, "maxValue": 50 },
      "award": [
        "BBB A+ Accredited Business",
        "NAR Member — National Association of Realtors",
        "Equal Housing Opportunity Provider",
        "Trustpilot 4.9/5 — 2,400+ Reviews"
      ],
      "hasCredential": [
        { "@type": "EducationalOccupationalCredential", "name": "Licensed Real Estate Broker — Virginia", "credentialCategory": "license" },
        { "@type": "EducationalOccupationalCredential", "name": "Licensed Real Estate Broker — Georgia", "credentialCategory": "license" },
        { "@type": "EducationalOccupationalCredential", "name": "Licensed Real Estate Broker — Texas", "credentialCategory": "license" },
        { "@type": "EducationalOccupationalCredential", "name": "Licensed Real Estate Broker — North Carolina", "credentialCategory": "license" },
        { "@type": "EducationalOccupationalCredential", "name": "Licensed Real Estate Broker — Tennessee", "credentialCategory": "license" },
        { "@type": "EducationalOccupationalCredential", "name": "Licensed Real Estate Broker — Arizona", "credentialCategory": "license" }
      ],
      "knowsAbout": [
        "Residential Real Estate",
        "Affordable Housing",
        "Property Rentals",
        "Property Management",
        "Tenant Services",
        "Home Buying"
      ],
      "areaServed": [
        { "@type": "City", "name": "Atlanta",    "containedInPlace": { "@type": "State", "name": "Georgia" } },
        { "@type": "City", "name": "Charlotte",  "containedInPlace": { "@type": "State", "name": "North Carolina" } },
        { "@type": "City", "name": "Houston",    "containedInPlace": { "@type": "State", "name": "Texas" } },
        { "@type": "City", "name": "Dallas",     "containedInPlace": { "@type": "State", "name": "Texas" } },
        { "@type": "City", "name": "Nashville",  "containedInPlace": { "@type": "State", "name": "Tennessee" } },
        { "@type": "City", "name": "Phoenix",    "containedInPlace": { "@type": "State", "name": "Arizona" } },
        { "@type": "City", "name": "Austin",     "containedInPlace": { "@type": "State", "name": "Texas" } },
        { "@type": "City", "name": "Denver",     "containedInPlace": { "@type": "State", "name": "Colorado" } },
        { "@type": "City", "name": "Tampa",      "containedInPlace": { "@type": "State", "name": "Florida" } },
        { "@type": "City", "name": "Raleigh",    "containedInPlace": { "@type": "State", "name": "North Carolina" } }
      ],
      "priceRange": "$$",
      "makesOffer": [
        {
          "@type": "Offer",
          "itemOffered": { "@type": "Service", "name": "Affordable Home Rentals",
            "description": "Quality, affordable rental homes and apartments with fast approvals and no hidden fees." }
        },
        {
          "@type": "Offer",
          "itemOffered": { "@type": "Service", "name": "Property Management",
            "description": "Professional residential property management across 12+ US cities." }
        },
        {
          "@type": "Offer",
          "itemOffered": { "@type": "Service", "name": "Relocation Assistance",
            "description": "Helping families and individuals relocate seamlessly to new cities." }
        }
      ]
    },
    {
      // WebSite schema enables the Sitelinks Searchbox in Google branded results
      "@type": "WebSite",
      "@id": "https://haskerrealtygroup.com/#website",
      "url": "https://haskerrealtygroup.com",
      "name": "Hasker & Co. Realty Group",
      "alternateName": ["Hasker Realty Group", "Hasker Realty", "Hasker and Co Realty Group"],
      "description": "Official website of Hasker & Co. Realty Group — affordable rental homes and properties for sale across 12+ US cities. Founded 2012. No hidden fees.",
      "publisher": { "@id": "https://haskerrealtygroup.com/#organization" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://haskerrealtygroup.com/properties?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      },
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": ["h1", "h2", ".speakable"]
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
