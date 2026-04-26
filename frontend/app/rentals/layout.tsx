import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";

export default function RentalsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-brand focus:text-white focus:rounded-sm focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="flex flex-col flex-1">{children}</main>
      <Footer />
    </>
  );
}
