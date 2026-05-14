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
      <div className="section-shell flex min-h-16 items-center justify-between gap-4 py-2.5">
        <Link href="/" className="flex items-center gap-3 leading-tight" aria-label={`${site.fullName} home`}>
          <img src={site.logo.fullDark} alt="" className="hidden h-10 w-auto dark:block sm:h-11" />
          <img src={site.logo.fullLight} alt="" className="h-10 w-auto dark:hidden sm:h-11" />
          <span className="sr-only">{site.fullName}</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-[var(--muted)] lg:flex">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="hover:text-[var(--gold)]">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>
          <Link href="/booking" className="gold-button hidden rounded-sm border border-[var(--gold)] px-4 py-2 text-sm font-black uppercase tracking-wide transition sm:inline-flex">
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
            <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-sm border border-[var(--border)] px-4 py-3 text-sm font-bold text-[var(--foreground)] hover:border-[var(--gold)] hover:text-[var(--gold)]">
              {label}
            </Link>
          ))}
          <ThemeToggle />
          <Link href="/booking" onClick={() => setOpen(false)} className="gold-button rounded-sm px-4 py-3 text-sm font-black uppercase tracking-wide">
            Book a Shoot
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
