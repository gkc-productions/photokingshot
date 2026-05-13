"use client";

import Link from "next/link";
import { useState } from "react";
import { site } from "@/lib/site";

const nav = [
  ["Services", "/services"],
  ["Portfolio", "/portfolio"],
  ["Booking", "/booking"],
  ["Galleries", "/galleries"],
  ["Blog", "/blog"],
  ["Gear", "/gear"],
  ["About", "/about"]
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/86 backdrop-blur">
      <div className="section-shell flex min-h-16 items-center justify-between gap-4 py-3">
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
        <div className="flex items-center gap-2">
          <Link href="/booking" className="hidden rounded-sm border border-[#d6a83f] bg-[#d6a83f] px-4 py-2 text-sm font-black uppercase tracking-wide text-black transition hover:bg-white sm:inline-flex">
            Book a Shoot
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex min-h-10 items-center rounded-sm border border-white/15 px-3 text-sm font-bold text-white lg:hidden"
            aria-expanded={open}
            aria-label="Toggle navigation"
          >
            Menu
          </button>
        </div>
      </div>
      {open ? (
        <nav className="section-shell grid gap-2 border-t border-white/10 py-4 lg:hidden">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-sm border border-white/10 px-4 py-3 text-sm font-bold text-white/82 hover:border-[#d6a83f] hover:text-[#d6a83f]">
              {label}
            </Link>
          ))}
          <Link href="/booking" onClick={() => setOpen(false)} className="rounded-sm bg-[#d6a83f] px-4 py-3 text-sm font-black uppercase tracking-wide text-black">
            Book a Shoot
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
