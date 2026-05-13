import { notFound } from "next/navigation";
import { PortfolioItemForm } from "@/components/AdminForms";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditPortfolioItemPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const item = await prisma.portfolioItem.findUnique({ where: { id } });
  if (!item) notFound();
  return <section className="section-shell max-w-3xl py-10"><p className="eyebrow">Admin</p><h1 className="mt-3 mb-8 text-4xl font-black">Edit portfolio item</h1><PortfolioItemForm item={item} /></section>;
}
