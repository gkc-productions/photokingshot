import Link from "next/link";
import { deleteClientGallery } from "@/app/actions";
import { DbNotice } from "@/components/DbNotice";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminGalleriesPage() {
  await requireAdmin();
  const result = await prisma.clientGallery.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { images: true } } }
  })
    .then((galleries) => ({ galleries, hasDb: true }))
    .catch(() => ({ galleries: [], hasDb: false }));

  return (
    <section className="section-shell py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-3 text-4xl font-black">Client Galleries</h1>
        </div>
        <Link href="/admin/galleries/new" className="gold-button rounded-sm px-4 py-3 text-sm font-black">New Gallery</Link>
      </div>
      {!result.hasDb ? <div className="mt-6"><DbNotice area="client gallery admin" /></div> : null}
      <div className="mt-8 grid gap-4">
        {result.galleries.map((gallery) => (
          <article key={gallery.id} className="surface-card rounded-sm p-5">
            <p className="eyebrow">{gallery.isPublished ? "PUBLISHED" : "DRAFT"} / {gallery.accessCode} / {gallery._count.images} images</p>
            <h2 className="mt-2 text-2xl font-black">{gallery.title}</h2>
            <p className="muted-copy mt-2">{gallery.clientName}{gallery.sessionDate ? ` • ${gallery.sessionDate.toLocaleDateString()}` : ""}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold">
              <Link href={`/galleries/${gallery.slug}`} className="text-[var(--gold)]">View</Link>
              <Link href={`/admin/galleries/${gallery.id}/edit`} className="text-[var(--gold)]">Edit</Link>
              <Link href={`/admin/galleries/${gallery.id}/images`} className="text-[var(--gold)]">Images</Link>
              <form action={deleteClientGallery}><input type="hidden" name="id" value={gallery.id} /><button className="text-red-300">Delete</button></form>
            </div>
          </article>
        ))}
      </div>
      {result.hasDb && !result.galleries.length ? <p className="muted-copy mt-8">No client galleries yet.</p> : null}
    </section>
  );
}
