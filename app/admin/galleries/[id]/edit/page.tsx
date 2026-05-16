import { notFound } from "next/navigation";
import { DbNotice } from "@/components/DbNotice";
import { ClientGalleryForm } from "@/components/GalleryAdminForms";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditClientGalleryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const gallery = await prisma.clientGallery.findUnique({ where: { id } }).catch(() => "DB_ERROR" as const);
  if (gallery === "DB_ERROR") {
    return <section className="section-shell max-w-3xl py-10"><p className="eyebrow">Admin</p><h1 className="mt-3 mb-8 text-4xl font-black">Edit client gallery</h1><DbNotice area="client gallery editor" /></section>;
  }
  if (!gallery) notFound();

  return (
    <section className="section-shell max-w-3xl py-10">
      <p className="eyebrow">Admin</p>
      <h1 className="mt-3 mb-8 text-4xl font-black">Edit client gallery</h1>
      <ClientGalleryForm gallery={gallery} />
    </section>
  );
}
