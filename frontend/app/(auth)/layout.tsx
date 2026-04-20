import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="px-6 py-5 border-b border-neutral-100 bg-white">
        <Link href="/" className="inline-flex items-center">
          <Image src="/logo.svg" alt="Hasker & Co. Realty Group" width={140} height={36} className="h-8 w-auto" />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>
      <footer className="py-5 text-center text-xs text-neutral-400 border-t border-neutral-100">
        © {new Date().getFullYear()} Hasker & Co. Realty Group. All rights reserved.
      </footer>
    </div>
  );
}
