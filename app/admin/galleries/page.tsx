import Link from "next/link";
import { toggleClientGalleryPublished } from "@/app/actions";
import { DbNotice } from "@/components/DbNotice";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function galleryType(gallery: { selectionMode: boolean; _count: { images: number } }) {
  if (!gallery._count.images) return "Empty/Draft";
  return gallery.selectionMode ? "Proofing Gallery" : "Final Gallery";
}

export default async function AdminGalleriesPage() {
  await requireAdmin();
  const result = await prisma.clientGallery.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { images: true, selections: true } } }
  })
    .then((galleries) => ({ galleries, hasDb: true }))
    .catch(() => ({ galleries: [], hasDb: false }));

  return (
    <section className="section-shell py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-3 text-4xl font-black">Client galleries</h1>
          <p className="muted-copy mt-3 max-w-2xl">Publish galleries, review proofing selections, reset access, and keep image upload instructions close to each client record.</p>
        </div>
        <Link href="/admin/galleries/new" className="gold-button rounded-sm px-4 py-3 text-sm font-black">New Gallery</Link>
      </div>
      {!result.hasDb ? <div className="mt-6"><DbNotice area="client gallery admin" /></div> : null}

      <div className="mt-8 overflow-x-auto rounded-sm border border-[var(--border)]">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="bg-[var(--card-strong)] text-[var(--foreground)]">
            <tr>
              {["Gallery", "Client", "Slug", "Access", "Images", "Status", "Downloads", "Proofing", "Actions"].map((head) => <th key={head} className="p-3">{head}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] text-[var(--muted)]">
            {result.galleries.map((gallery) => (
              <tr key={gallery.id} className="align-top">
                <td className="p-3">
                  <p className="font-black text-[var(--foreground)]">{gallery.title}</p>
                  <p className="mt-1 rounded-sm border border-[var(--border)] px-2 py-1 text-xs font-black uppercase text-[var(--gold)]">{galleryType(gallery)}</p>
                </td>
                <td className="p-3">{gallery.clientName}</td>
                <td className="p-3 font-mono text-xs">{gallery.slug}</td>
                <td className="p-3 font-mono text-xs">{gallery.accessCode}</td>
                <td className="p-3">{gallery._count.images}</td>
                <td className="p-3">{gallery.isPublished ? "Published" : "Unpublished"}</td>
                <td className="p-3">{gallery.allowDownloads ? "Allowed" : "Off"}</td>
                <td className="p-3">
                  {gallery.selectionMode ? `${gallery._count.selections} selected${gallery.selectionSubmittedAt ? " / submitted" : ""}` : "Off"}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-3 font-bold">
                    <Link href={`/galleries/${gallery.slug}`} className="text-[var(--gold)]">View</Link>
                    <Link href={`/admin/galleries/${gallery.id}/edit`} className="text-[var(--gold)]">Edit</Link>
                    <Link href={`/admin/galleries/${gallery.id}/images`} className="text-[var(--gold)]">Images</Link>
                    <Link href={`/admin/galleries/${gallery.id}/selections`} className="text-[var(--gold)]">Selections</Link>
                    <form action={toggleClientGalleryPublished}>
                      <input type="hidden" name="id" value={gallery.id} />
                      <button className="text-[var(--gold)]">{gallery.isPublished ? "Unpublish" : "Publish"}</button>
                    </form>
                    <Link href={`/admin/galleries/${gallery.id}/edit#reset-password`} className="text-[var(--gold)]">Reset Password</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {result.hasDb && !result.galleries.length ? <p className="muted-copy mt-8">No client galleries yet.</p> : null}
    </section>
  );
}
