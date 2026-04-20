import { MapPin, Phone, Mail, Clock } from "lucide-react";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact Us — Hasker & Co. Realty Group",
  description:
    "Looking for an affordable home to rent or buy? Contact Hasker & Co. Realty Group. Our housing specialists respond within 24 hours with matching properties — no fees, no pressure.",
  alternates: { canonical: "https://haskerrealtygroup.com/contact" },
  openGraph: { title: "Contact Us — Hasker & Co. Realty Group", description: "Our housing specialists respond within 24 hours. No fees, no pressure.", type: "website", url: "https://haskerrealtygroup.com/contact" },
};

const offices = [
  {
    city: "Atlanta",
    address: "1230 Peachtree Street NE, Suite 400\nAtlanta, GA 30309",
    phone: "",
    email: "housing@haskerrealtygroup.com",
    hours: "Mon – Fri: 9am – 6pm ET\nSat: 10am – 4pm ET",
  },
  {
    city: "Charlotte",
    address: "525 North Tryon Street, Suite 1200\nCharlotte, NC 28202",
    phone: "",
    email: "housing@haskerrealtygroup.com",
    hours: "Mon – Fri: 9am – 6pm ET\nSat: 10am – 3pm ET",
  },
  {
    city: "Houston",
    address: "3900 Essex Lane, Suite 1000\nHouston, TX 77027",
    phone: "",
    email: "housing@haskerrealtygroup.com",
    hours: "Mon – Fri: 9am – 6pm CT\nSat: By Appointment",
  },
];

const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://haskerrealtygroup.com" }, { "@type": "ListItem", position: 2, name: "Contact", item: "https://haskerrealtygroup.com/contact" }] };

export default function ContactPage() {
  return (
    <div className="pt-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {/* Header */}
      <div className="bg-brand-dark pt-16 pb-14 px-6 text-white text-center">
        <p className="text-blue-300 text-xs font-semibold tracking-[0.4em] uppercase mb-4">
          We&apos;re Here to Help
        </p>
        <h1 className="font-serif text-4xl lg:text-5xl font-bold mb-4">Find Your Next Home</h1>
        <p className="text-blue-100 max-w-xl mx-auto">
          Tell us what you&apos;re looking for and our rental specialists will match you with the
          right options — fast. We respond within 24 hours.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-3">
            <h2 className="font-serif text-2xl font-bold text-brand-dark mb-2">
              Tell Us What You Need
            </h2>
            <p className="text-sm text-neutral-500 mb-8">
              Share your requirements and we&apos;ll get back to you with matching rentals within 24 hours.
            </p>

            <ContactForm />
          </div>

          {/* Offices + Quick Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick reassurances */}
            <div className="bg-brand-light border border-brand-muted rounded-sm p-5">
              <h3 className="font-serif text-base font-bold text-brand-dark mb-3">
                What Happens Next?
              </h3>
              <ul className="space-y-2.5 text-sm text-neutral-600">
                {[
                  "We review your inquiry within 24 hours",
                  "A rental specialist contacts you directly",
                  "We match you with available properties",
                  "You schedule viewings at your convenience",
                  "Fast, straightforward application process",
                ].map((step) => (
                  <li key={step} className="flex items-start gap-2">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-brand text-white text-[9px] flex items-center justify-center shrink-0">✓</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            {offices.map((office) => (
              <div
                key={office.city}
                className="bg-white border border-neutral-100 rounded-sm p-5"
              >
                <h3 className="font-serif text-lg font-bold text-brand-dark mb-4">{office.city}</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-sm text-neutral-600">
                    <MapPin size={14} className="text-brand mt-0.5 shrink-0" />
                    <span className="whitespace-pre-line">{office.address}</span>
                  </div>
                  {office.phone && (
                    <a
                      href={`tel:${office.phone}`}
                      className="flex items-center gap-3 text-sm text-neutral-600 hover:text-brand transition-colors"
                    >
                      <Phone size={14} className="text-brand shrink-0" />
                      {office.phone}
                    </a>
                  )}
                  <a
                    href={`mailto:${office.email}`}
                    className="flex items-center gap-3 text-sm text-neutral-600 hover:text-brand transition-colors"
                  >
                    <Mail size={14} className="text-brand shrink-0" />
                    {office.email}
                  </a>
                  <div className="flex items-start gap-3 text-sm text-neutral-600">
                    <Clock size={14} className="text-brand mt-0.5 shrink-0" />
                    <span className="whitespace-pre-line">{office.hours}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
