import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Hasker & Co. Realty Group",
  description: "Terms and conditions for using Hasker & Co. Realty Group's website and services.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <div className="pt-20">
      <div className="bg-brand-dark pt-16 pb-14 px-6 text-white text-center">
        <p className="text-blue-300 text-xs font-semibold tracking-[0.4em] uppercase mb-4">Legal</p>
        <h1 className="font-serif text-4xl lg:text-5xl font-bold mb-4">Terms of Service</h1>
        <p className="text-blue-100 max-w-xl mx-auto">Last updated: January 1, 2025</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-16 prose prose-neutral">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using the Hasker &amp; Co. Realty Group website and services, you accept
          and agree to be bound by these Terms of Service.
        </p>

        <h2>2. Use of Services</h2>
        <p>
          Our services are intended to help individuals find affordable rental and for-sale
          properties. You agree to use our services only for lawful purposes and in accordance
          with these terms.
        </p>

        <h2>3. Property Listings</h2>
        <p>
          We strive to ensure that all property listings are accurate and up to date. However,
          availability and pricing are subject to change. All listings are subject to prior
          rental or sale.
        </p>

        <h2>4. Application Process</h2>
        <p>
          Submitting a rental application does not guarantee approval. Applications are reviewed
          on a case-by-case basis. We reserve the right to decline applications in accordance
          with fair housing laws.
        </p>

        <h2>5. Fair Housing</h2>
        <p>
          Hasker &amp; Co. Realty Group is committed to fair housing. We do not discriminate on
          the basis of race, color, national origin, religion, sex, familial status, or disability.
        </p>

        <h2>6. Limitation of Liability</h2>
        <p>
          Hasker &amp; Co. Realty Group shall not be liable for any indirect, incidental, or
          consequential damages arising from your use of our services.
        </p>

        <h2>7. Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. Continued use of our services
          after any changes constitutes acceptance of the new terms.
        </p>

        <h2>8. Contact</h2>
        <p>
          For questions about these Terms, contact us at{" "}
          <a href="mailto:info@haskerrealtygroup.com">info@haskerrealtygroup.com</a>.
        </p>
      </div>
    </div>
  );
}
