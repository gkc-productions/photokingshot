import Link from "next/link";
import { deletePortfolioItem } from "@/app/actions";
import { DbNotice } from "@/components/DbNotice";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPortfolioPage() {
  await requireAdmin();
  const result = await prisma.portfolioItem.findMany({ orderBy: { updatedAt: "desc" } })
    .then((items) => ({ items, hasDb: true }))
    .catch(() => ({ items: [], hasDb: false }));
  return (
    <section className="section-shell py-10">
      <div className="flex items-center justify-between gap-4">
        <div><p className="eyebrow">Admin</p><h1 className="mt-3 text-4xl font-black">Portfolio items</h1></div>
        <Link href="/admin/portfolio/new" className="gold-button rounded-sm px-4 py-3 text-sm font-black">New Item</Link>
      </div>
      {!result.hasDb ? <div className="mt-6"><DbNotice area="portfolio admin" /></div> : null}
      <div className="mt-8 grid gap-4">
        {result.items.map((item) => (
          <article key={item.id} className="surface-card rounded-sm p-5">
            <p className="eyebrow">{item.isFeatured ? "FEATURED" : "STANDARD"} / {item.category}</p>
            <h2 className="mt-2 text-2xl font-black">{item.title}</h2>
            <p className="muted-copy mt-2">{item.description}</p>
            <div className="mt-4 flex gap-3">
              <Link href={`/admin/portfolio/${item.id}/edit`} className="text-[var(--gold)]">Edit</Link>
              <form action={deletePortfolioItem}><input type="hidden" name="id" value={item.id} /><button className="text-red-300">Delete</button></form>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
