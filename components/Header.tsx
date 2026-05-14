"use client";

import Link from "next/link";
import { useState } from "react";
import { site } from "@/lib/site";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur">
      <div className="section-shell flex min-h-16 items-center justify-between gap-4 py-3">
        <Link href="/" className="flex items-center gap-3 leading-tight" aria-label={`${site.fullName} home`}>
          <img src={site.logo.fullDark} alt="" className="hidden h-12 w-auto sm:h-14 dark:sm:block" />
          <img src={site.logo.fullLight} alt="" className="hidden h-12 w-auto sm:block sm:h-14 dark:hidden" />
          <img src={site.logo.markGold} alt="" className="h-11 w-11 sm:hidden" />
          <span className="sr-only">{site.fullName}</span>
          <span className="block sm:hidden">
            <span className="block text-base font-black tracking-wide text-[var(--foreground)]">{site.name}</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">{site.parent}</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-[var(--muted)] lg:flex">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="hover:text-[#d6a83f]">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden xl:block">
            <ThemeToggle />
          </div>
          <Link href="/booking" className="hidden rounded-sm border border-[#d6a83f] bg-[#d6a83f] px-4 py-2 text-sm font-black uppercase tracking-wide text-black transition hover:bg-white sm:inline-flex">
            Book a Shoot
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex min-h-10 items-center rounded-sm border border-[var(--border)] px-3 text-sm font-bold text-[var(--foreground)] lg:hidden"
            aria-expanded={open}
            aria-label="Toggle navigation"
          >
            Menu
          </button>
        </div>
      </div>
      {open ? (
        <nav className="section-shell grid gap-2 border-t border-[var(--border)] py-4 lg:hidden">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-sm border border-[var(--border)] px-4 py-3 text-sm font-bold text-[var(--foreground)] hover:border-[#d6a83f] hover:text-[#d6a83f]">
              {label}
            </Link>
          ))}
          <ThemeToggle />
          <Link href="/booking" onClick={() => setOpen(false)} className="rounded-sm bg-[#d6a83f] px-4 py-3 text-sm font-black uppercase tracking-wide text-black">
            Book a Shoot
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
