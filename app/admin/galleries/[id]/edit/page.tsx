import { notFound } from "next/navigation";
import { DbNotice } from "@/components/DbNotice";
import { ClientGalleryForm, DeleteClientGalleryForm, GalleryClientInstructions, GalleryPasswordResetForm } from "@/components/GalleryAdminForms";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditClientGalleryPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ delete?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const query = await searchParams;
  const gallery = await prisma.clientGallery.findUnique({ where: { id } }).catch(() => "DB_ERROR" as const);
  if (gallery === "DB_ERROR") {
    return <section className="section-shell max-w-3xl py-10"><p className="eyebrow">Admin</p><h1 className="mt-3 mb-8 text-4xl font-black">Edit client gallery</h1><DbNotice area="client gallery editor" /></section>;
  }
  if (!gallery) notFound();

  return (
    <section className="section-shell py-10">
      <p className="eyebrow">Admin</p>
      <h1 className="mt-3 mb-8 text-4xl font-black">Edit client gallery</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        <ClientGalleryForm gallery={gallery} />
        <div className="grid content-start gap-5">
          {query.delete === "slug-mismatch" ? (
            <p className="rounded-sm border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-100">
              The confirmation slug did not match. Type the gallery slug exactly before deleting.
            </p>
          ) : null}
          <GalleryClientInstructions gallery={gallery} />
          <GalleryPasswordResetForm galleryId={gallery.id} />
          <DeleteClientGalleryForm gallery={gallery} />
        </div>
      </div>
    </section>
  );
}
