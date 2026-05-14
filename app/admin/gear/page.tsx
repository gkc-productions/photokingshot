import Link from "next/link";
import { deleteAffiliateProduct } from "@/app/actions";
import { DbNotice } from "@/components/DbNotice";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminGearPage() {
  await requireAdmin();
  const result = await prisma.affiliateProduct.findMany({ orderBy: { updatedAt: "desc" } })
    .then((products) => ({ products, hasDb: true }))
    .catch(() => ({ products: [], hasDb: false }));
  return (
    <section className="section-shell py-10">
      <div className="flex items-center justify-between gap-4">
        <div><p className="eyebrow">Admin</p><h1 className="mt-3 text-4xl font-black">Affiliate products</h1></div>
        <Link href="/admin/gear/new" className="gold-button rounded-sm px-4 py-3 text-sm font-black">New Product</Link>
      </div>
      {!result.hasDb ? <div className="mt-6"><DbNotice area="affiliate product admin" /></div> : null}
      <div className="mt-8 grid gap-4">
        {result.products.map((product) => (
          <article key={product.id} className="surface-card rounded-sm p-5">
            <p className="eyebrow">{product.isActive ? "ACTIVE" : "INACTIVE"} / {product.category}</p>
            <h2 className="mt-2 text-2xl font-black">{product.title}</h2>
            <p className="muted-copy mt-2">{product.bestFor}</p>
            <div className="mt-4 flex gap-3">
              <Link href={`/admin/gear/${product.id}/edit`} className="text-[var(--gold)]">Edit</Link>
              <form action={deleteAffiliateProduct}><input type="hidden" name="id" value={product.id} /><button className="text-red-300">Delete</button></form>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
