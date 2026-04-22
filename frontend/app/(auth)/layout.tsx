import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col">
      <header className="px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-black/[0.06]">
        <Link href="/" className="inline-flex items-center">
          <Image src="/logo.svg" alt="Hasker & Co. Realty Group" width={130} height={34} className="h-7 w-auto" />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>
      <footer className="py-5 text-center text-[11px] text-[#6E6E73]">
        © {new Date().getFullYear()} Hasker &amp; Co. Realty Group. All rights reserved.
      </footer>
    </div>
  );
}
