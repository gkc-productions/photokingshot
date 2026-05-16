import { deleteGalleryImage } from "@/app/actions";
import { DbNotice } from "@/components/DbNotice";
import { GalleryImageForm } from "@/components/GalleryAdminForms";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function GalleryImagesPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const result = await prisma.clientGallery.findUnique({
    where: { id },
    include: { images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } }
  })
    .then((gallery) => ({ gallery, hasDb: true }))
    .catch(() => ({ gallery: null, hasDb: false }));

  return (
    <section className="section-shell py-10">
      <p className="eyebrow">Admin</p>
      <h1 className="mt-3 text-4xl font-black">Gallery Images</h1>
      {!result.hasDb ? <div className="mt-6"><DbNotice area="gallery image admin" /></div> : null}
      {result.gallery ? (
        <>
          <p className="muted-copy mt-3">{result.gallery.title}</p>
          <div className="mt-8 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <h2 className="mb-4 text-2xl font-black">Add image</h2>
              <GalleryImageForm galleryId={result.gallery.id} />
            </div>
            <div className="grid gap-4">
              {result.gallery.images.map((image) => (
                <article key={image.id} className="surface-card grid gap-4 rounded-sm p-4 md:grid-cols-[180px_1fr]">
                  <div className="aspect-[4/3] overflow-hidden rounded-sm bg-black">
                    <img src={image.imageUrl} alt={image.title || "Gallery image"} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p className="eyebrow">Sort {image.sortOrder} / {image.isDownloadable ? "Downloadable" : "No downloads"}</p>
                    <h3 className="mt-2 text-xl font-black">{image.title || "Untitled image"}</h3>
                    {image.caption ? <p className="muted-copy mt-2 text-sm">{image.caption}</p> : null}
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-bold text-[var(--gold)]">Edit image</summary>
                      <div className="mt-4"><GalleryImageForm galleryId={image.galleryId} image={image} /></div>
                    </details>
                    <form action={deleteGalleryImage} className="mt-4">
                      <input type="hidden" name="id" value={image.id} />
                      <input type="hidden" name="galleryId" value={image.galleryId} />
                      <button className="text-sm font-bold text-red-300">Delete image</button>
                    </form>
                  </div>
                </article>
              ))}
              {!result.gallery.images.length ? <p className="muted-copy rounded-sm border border-[var(--border)] p-6">No images have been added to this gallery yet.</p> : null}
            </div>
          </div>
        </>
      ) : result.hasDb ? (
        <p className="muted-copy mt-8">Gallery not found.</p>
      ) : null}
    </section>
  );
}
