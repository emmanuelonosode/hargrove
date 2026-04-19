import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility — Hasker & Co. Realty Group",
  description: "Hasker & Co. Realty Group's commitment to web accessibility and how to request assistance.",
  robots: { index: true, follow: true },
};

export default function AccessibilityPage() {
  return (
    <div className="pt-20">
      <div className="bg-brand-dark pt-16 pb-14 px-6 text-white text-center">
        <p className="text-blue-300 text-xs font-semibold tracking-[0.4em] uppercase mb-4">Commitment</p>
        <h1 className="font-serif text-4xl lg:text-5xl font-bold mb-4">Accessibility</h1>
        <p className="text-blue-100 max-w-xl mx-auto">
          We are committed to making our website accessible to everyone.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-16 prose prose-neutral">
        <h2>Our Commitment</h2>
        <p>
          Hasker &amp; Co. Realty Group is committed to ensuring digital accessibility for people
          with disabilities. We continually improve the user experience for everyone and apply
          relevant accessibility standards.
        </p>

        <h2>Conformance Status</h2>
        <p>
          We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.
          These guidelines explain how to make web content more accessible to people with disabilities.
        </p>

        <h2>Technical Specifications</h2>
        <p>Our website relies on the following technologies for conformance:</p>
        <ul>
          <li>HTML</li>
          <li>CSS</li>
          <li>JavaScript</li>
        </ul>

        <h2>Known Limitations</h2>
        <p>
          We are actively working to identify and resolve any accessibility barriers. If you
          encounter any issues, please contact us so we can address them promptly.
        </p>

        <h2>Feedback &amp; Contact</h2>
        <p>
          We welcome your feedback on the accessibility of our website. If you experience any
          barriers or need assistance, please contact us:
        </p>
        <ul>
          <li>
            Email:{" "}
            <a href="mailto:info@haskerrealtygroup.com">info@haskerrealtygroup.com</a>
          </li>
          <li>
            Address: 1230 Peachtree Street NE, Suite 400, Atlanta, GA 30309
          </li>
        </ul>
        <p>We aim to respond to accessibility feedback within 2 business days.</p>
      </div>
    </div>
  );
}
