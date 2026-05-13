import Link from "next/link";
import { deleteAffiliateProduct } from "@/app/actions";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminGearPage() {
  await requireAdmin();
  const products = await prisma.affiliateProduct.findMany({ orderBy: { updatedAt: "desc" } });
  return (
    <section className="section-shell py-10">
      <div className="flex items-center justify-between gap-4">
        <div><p className="eyebrow">Admin</p><h1 className="mt-3 text-4xl font-black">Affiliate products</h1></div>
        <Link href="/admin/gear/new" className="rounded-sm bg-[#d6a83f] px-4 py-3 text-sm font-black text-black">New Product</Link>
      </div>
      <div className="mt-8 grid gap-4">
        {products.map((product) => (
          <article key={product.id} className="rounded-sm border border-white/10 bg-white/[0.04] p-5">
            <p className="eyebrow">{product.isActive ? "ACTIVE" : "INACTIVE"} / {product.category}</p>
            <h2 className="mt-2 text-2xl font-black">{product.title}</h2>
            <p className="mt-2 text-white/64">{product.bestFor}</p>
            <div className="mt-4 flex gap-3">
              <Link href={`/admin/gear/${product.id}/edit`} className="text-[#d6a83f]">Edit</Link>
              <form action={deleteAffiliateProduct}><input type="hidden" name="id" value={product.id} /><button className="text-red-300">Delete</button></form>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
