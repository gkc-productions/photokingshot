import { notFound } from "next/navigation";
import { AffiliateProductForm } from "@/components/AdminForms";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditAffiliateProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const product = await prisma.affiliateProduct.findUnique({ where: { id } });
  if (!product) notFound();
  return <section className="section-shell max-w-3xl py-10"><p className="eyebrow">Admin</p><h1 className="mt-3 mb-8 text-4xl font-black">Edit affiliate product</h1><AffiliateProductForm product={product} /></section>;
}
