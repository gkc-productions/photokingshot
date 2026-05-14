import Link from "next/link";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)] py-10">
      <div className="section-shell grid gap-6 text-sm text-white/70 md:grid-cols-[1.5fr_1fr]">
        <div>
          <img src={site.logo.fullDark} alt={site.fullName} className="hidden h-16 w-auto dark:block" />
          <img src={site.logo.fullLight} alt={site.fullName} className="h-16 w-auto dark:hidden" />
          <p className="mt-4 max-w-xl text-[var(--muted)]">Atlanta-based photography for portraits, events, graduations, church communities, and creative campaigns, built with a premium eye and a clean delivery process.</p>
          <p className="mt-3">
            <a href={`mailto:${site.contactEmail}`} className="font-semibold text-[#d6a83f] hover:text-white">{site.contactEmail}</a>
          </p>
          <p className="mt-4 text-xs text-[var(--muted)]">As an Amazon Associate, GKC Productions / PhotoKingShot earns from qualifying purchases.</p>
        </div>
        <div className="flex flex-wrap gap-4 text-[var(--muted)] md:justify-end">
          <Link href="/privacy-policy" className="hover:text-[#d6a83f]">Privacy Policy</Link>
          <Link href="/affiliate-disclosure" className="hover:text-[#d6a83f]">Affiliate Disclosure</Link>
          <Link href="/booking" className="hover:text-[#d6a83f]">Book a Shoot</Link>
          <Link href="/admin" className="hover:text-[#d6a83f]">Admin</Link>
        </div>
        <p className="text-xs text-[var(--muted)] md:col-span-2">Copyright {new Date().getFullYear()} PhotoKingShot by GKC Productions. All rights reserved.</p>
      </div>
    </footer>
  );
}
