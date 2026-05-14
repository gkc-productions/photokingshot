import Link from "next/link";
import { logoutAdmin } from "@/app/actions";

export function AdminNav() {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--background)]">
      <div className="section-shell flex flex-wrap items-center justify-between gap-4 py-4">
        <Link href="/admin" className="font-black">PhotoKingShot Admin</Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-[var(--muted)]">
          <Link href="/admin/blog" className="hover:text-[var(--gold)]">Blog</Link>
          <Link href="/admin/gear" className="hover:text-[var(--gold)]">Gear</Link>
          <Link href="/admin/portfolio" className="hover:text-[var(--gold)]">Portfolio</Link>
          <Link href="/" className="hover:text-[var(--gold)]">Public site</Link>
          <form action={logoutAdmin}>
            <button className="hover:text-[var(--gold)]">Logout</button>
          </form>
        </nav>
      </div>
    </header>
  );
}
