import Image from "next/image";
import { resetGallerySelections } from "@/app/actions";
import { DbNotice } from "@/components/DbNotice";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function GallerySelectionsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const result = await prisma.clientGallery.findUnique({
    where: { id },
    include: {
      selections: {
        orderBy: { createdAt: "asc" },
        include: { image: true }
      }
    }
  })
    .then((gallery) => ({ gallery, hasDb: true }))
    .catch(() => ({ gallery: null, hasDb: false }));

  return (
    <section className="section-shell py-10">
      <p className="eyebrow">Admin</p>
      <h1 className="mt-3 text-4xl font-black">Gallery Selections</h1>
      {!result.hasDb ? <div className="mt-6"><DbNotice area="gallery selections admin" /></div> : null}
      {result.gallery ? (
        <>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="muted-copy">{result.gallery.title}</p>
              <p className="mt-2 text-sm font-bold text-[var(--gold)]">
                {result.gallery.selections.length} of {result.gallery.maxSelections || 20} selected / {result.gallery.selectionSubmittedAt ? `Submitted ${result.gallery.selectionSubmittedAt.toLocaleString()}` : "Not submitted"}
              </p>
            </div>
            <form action={resetGallerySelections}>
              <input type="hidden" name="galleryId" value={result.gallery.id} />
              <button className="rounded-sm border border-red-400/40 px-4 py-3 text-sm font-black text-red-300">Reset Selections</button>
            </form>
          </div>
          <div className="mt-8 grid gap-4">
            {result.gallery.selections.map((selection) => (
              <article key={selection.id} className="surface-card grid gap-4 rounded-sm p-4 md:grid-cols-[180px_1fr]">
                <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-black">
                  <Image src={selection.image.imageUrl} alt={selection.image.title || "Selected proof"} fill sizes="180px" unoptimized className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="eyebrow">Selected {selection.createdAt.toLocaleString()}</p>
                  <h2 className="mt-2 text-xl font-black">{selection.image.title || "Untitled proof"}</h2>
                  {selection.image.caption ? <p className="muted-copy mt-2 text-sm">{selection.image.caption}</p> : null}
                  <dl className="muted-copy mt-4 grid gap-2 text-xs">
                    <div><dt className="font-bold text-[var(--foreground)]">Image URL</dt><dd className="break-all">{selection.image.imageUrl}</dd></div>
                    <div><dt className="font-bold text-[var(--foreground)]">Original key</dt><dd className="break-all">{selection.image.originalKey || "Not uploaded to R2 yet"}</dd></div>
                    <div><dt className="font-bold text-[var(--foreground)]">Preview key</dt><dd className="break-all">{selection.image.previewKey || "Not uploaded to R2 yet"}</dd></div>
                  </dl>
                </div>
              </article>
            ))}
            {!result.gallery.selections.length ? <p className="muted-copy rounded-sm border border-[var(--border)] p-6">No selections submitted yet.</p> : null}
          </div>
        </>
      ) : result.hasDb ? (
        <p className="muted-copy mt-8">Gallery not found.</p>
      ) : null}
    </section>
  );
}
