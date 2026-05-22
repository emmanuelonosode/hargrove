import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#F4ECDC] flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
      <Image
        src="/illustrations/spot-not-found.svg"
        alt=""
        width={200}
        height={200}
        className="w-48 h-48 mb-8"
        priority
      />
      <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C97757] mb-3">
        404 — Page Not Found
      </p>
      <h1 className="font-serif text-4xl lg:text-5xl font-bold text-[#0B1F3A] mb-4 leading-tight">
        This door&apos;s locked.
      </h1>
      <p className="text-[#475569] text-base leading-relaxed max-w-sm mb-10">
        The page you&apos;re looking for doesn&apos;t exist or may have moved. Let&apos;s get you back home.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/homes-for-rent"
          className="inline-flex items-center justify-center gap-2 bg-[#1A56DB] text-white text-sm font-semibold px-7 py-3.5 rounded-sm hover:bg-[#1447BF] transition-colors"
        >
          Browse Homes
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center gap-2 border border-[#0B1F3A]/20 text-[#0B1F3A] text-sm font-semibold px-7 py-3.5 rounded-sm hover:bg-[#0B1F3A]/5 transition-colors"
        >
          Get in Touch
        </Link>
      </div>
    </main>
  );
}
