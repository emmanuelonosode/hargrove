import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Hasker & Co. Realty Group",
  description: "How Hasker & Co. Realty Group collects, uses, and protects your personal information.",
  alternates: { canonical: "https://haskerrealtygroup.com/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="pt-20">
      <div className="bg-brand-dark pt-16 pb-14 px-6 text-white text-center">
        <p className="text-blue-300 text-xs font-semibold tracking-[0.4em] uppercase mb-4">Legal</p>
        <h1 className="font-serif text-4xl lg:text-5xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-blue-100 max-w-xl mx-auto">Last updated: January 1, 2025</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-16 prose prose-neutral">
        <h2>1. Information We Collect</h2>
        <p>
          We collect information you provide directly to us when you submit an inquiry, rental
          application, or contact form. This includes your name, email address, phone number,
          and any details about your housing needs.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Match you with available rental and for-sale properties</li>
          <li>Respond to your inquiries and schedule viewings</li>
          <li>Process rental applications</li>
          <li>Send you updates about properties that match your criteria</li>
          <li>Improve our services</li>
        </ul>

        <h2>3. Information Sharing</h2>
        <p>
          We do not sell, trade, or otherwise transfer your personal information to third parties
          without your consent, except as necessary to process your application or as required by law.
        </p>

        <h2>4. Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal information against
          unauthorized access, alteration, disclosure, or destruction.
        </p>

        <h2>5. Cookies</h2>
        <p>
          Our website may use cookies to enhance your browsing experience. You can choose to
          disable cookies through your browser settings.
        </p>

        <h2>6. Your Rights</h2>
        <p>
          You have the right to access, correct, or delete your personal information at any time.
          To exercise these rights, contact us at{" "}
          <a href="mailto:info@haskerrealtygroup.com">info@haskerrealtygroup.com</a>.
        </p>

        <h2>7. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at:
          <br />
          Hasker &amp; Co. Realty Group
          <br />
          1230 Peachtree Street NE, Suite 400, Atlanta, GA 30309
          <br />
          <a href="mailto:info@haskerrealtygroup.com">info@haskerrealtygroup.com</a>
        </p>
      </div>
    </div>
  );
}
