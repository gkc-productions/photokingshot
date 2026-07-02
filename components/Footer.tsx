import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)] py-10">
      <div className="section-shell grid gap-6 text-sm text-[var(--muted)] md:grid-cols-[1.5fr_1fr]">
        <div>
          <Image src={site.logo.fullDark} alt={site.fullName} width={900} height={319} unoptimized className="hidden h-16 w-auto dark:block" />
          <Image src={site.logo.fullLight} alt={site.fullName} width={900} height={319} unoptimized className="h-16 w-auto dark:hidden" />
          <p className="mt-4 max-w-xl text-[var(--muted)]">Atlanta-based photography for graduation portraits, birthday photos, church and event coverage, family sessions, couple portraits, and creative work, delivered with clean editing and private client galleries.</p>
          <p className="mt-3">
            <a href={`mailto:${site.contactEmail}`} className="font-semibold text-[var(--gold)] hover:text-[var(--foreground)]">{site.contactEmail}</a>
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-[var(--muted)] md:justify-end">
          <Link href="/privacy-policy" className="hover:text-[var(--gold)]">Privacy Policy</Link>
          <Link href="/pricing" className="hover:text-[var(--gold)]">Pricing</Link>
          <Link href="/booking" className="hover:text-[var(--gold)]">Book a Session</Link>
          <Link href="/admin" className="hover:text-[var(--gold)]">Admin</Link>
        </div>
        <p className="text-xs text-[var(--muted)] md:col-span-2">Copyright {new Date().getFullYear()} PhotoKingShot by GKC Productions. All rights reserved.</p>
      </div>
    </footer>
  );
}
