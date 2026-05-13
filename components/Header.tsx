import Link from "next/link";
import { site } from "@/lib/site";

const nav = [
  ["Services", "/services"],
  ["Portfolio", "/portfolio"],
  ["Booking", "/book"],
  ["Galleries", "/galleries"],
  ["Blog", "/blog"],
  ["Gear", "/gear"],
  ["About", "/about"]
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/86 backdrop-blur">
      <div className="section-shell flex min-h-16 items-center justify-between gap-6 py-3">
        <Link href="/" className="leading-tight">
          <span className="block text-lg font-black tracking-wide">{site.name}</span>
          <span className="block text-[11px] uppercase tracking-[0.22em] text-[#d6a83f]">{site.parent}</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-white/78 lg:flex">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="hover:text-[#d6a83f]">
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/book" className="rounded-sm bg-white px-4 py-2 text-sm font-bold text-black hover:bg-[#d6a83f]">
          Book
        </Link>
      </div>
    </header>
  );
}
