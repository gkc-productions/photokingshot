import Link from "next/link";
import { logoutAdmin } from "@/app/actions";

export function AdminNav() {
  return (
    <header className="border-b border-white/10 bg-black">
      <div className="section-shell flex flex-wrap items-center justify-between gap-4 py-4">
        <Link href="/admin" className="font-black">PhotoKingShot Admin</Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-white/70">
          <Link href="/admin/blog" className="hover:text-[#d6a83f]">Blog</Link>
          <Link href="/admin/gear" className="hover:text-[#d6a83f]">Gear</Link>
          <Link href="/admin/portfolio" className="hover:text-[#d6a83f]">Portfolio</Link>
          <Link href="/" className="hover:text-[#d6a83f]">Public site</Link>
          <form action={logoutAdmin}>
            <button className="hover:text-[#d6a83f]">Logout</button>
          </form>
        </nav>
      </div>
    </header>
  );
}
