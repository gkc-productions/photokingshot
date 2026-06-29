import { existsSync, readdirSync } from "fs";
import path from "path";
import { deleteGalleryImage } from "@/app/actions";
import { DbNotice } from "@/components/DbNotice";
import { GalleryBrowserUploader } from "@/components/GalleryBrowserUploader";
import { GalleryClientInstructions, GalleryImageForm } from "@/components/GalleryAdminForms";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { isR2Configured, listR2ObjectsByPrefix } from "@/lib/r2";

export const dynamic = "force-dynamic";

function countLocalImages(slug: string) {
  const relativePath = `public/images/galleries/${slug}`;
  const absolutePath = path.join(process.cwd(), relativePath);
  if (!existsSync(absolutePath)) return { relativePath, count: 0, exists: false };

  const count = readdirSync(absolutePath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(jpe?g|png|webp)$/i.test(entry.name))
    .length;

  return { relativePath, count, exists: true };
}

export default async function GalleryImagesPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const result = await prisma.clientGallery.findUnique({
    where: { id },
    include: { images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } }
  })
    .then((gallery) => ({ gallery, hasDb: true }))
    .catch(() => ({ gallery: null, hasDb: false }));
  const gallery = result.gallery;
  const local = gallery ? countLocalImages(gallery.slug) : null;
  const r2Status = gallery && isR2Configured()
    ? await listR2ObjectsByPrefix(`galleries/${gallery.slug}/`)
      .then((keys) => ({ configured: true, ok: true, count: keys.length }))
      .catch(() => ({ configured: true, ok: false, count: 0 }))
    : { configured: false, ok: false, count: 0 };

  return (
    <section className="section-shell py-10">
      <p className="eyebrow">Admin</p>
      <h1 className="mt-3 text-4xl font-black">Gallery Images</h1>
      {!result.hasDb ? <div className="mt-6"><DbNotice area="gallery image admin" /></div> : null}
      {gallery ? (
        <>
          <p className="muted-copy mt-3">{gallery.title}</p>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <section className="rounded-sm border border-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-2xl font-black">Upload preparation</h2>
              <dl className="muted-copy mt-4 grid gap-3 text-sm">
                <div>
                  <dt className="font-bold text-[var(--foreground)]">Local drop folder</dt>
                  <dd className="font-mono text-xs">{local?.relativePath}/ {local?.exists ? "" : "(create this folder before uploading)"}</dd>
                </div>
                <div>
                  <dt className="font-bold text-[var(--foreground)]">Current image count</dt>
                  <dd>{gallery.images.length} database images / {local?.count ?? 0} local files</dd>
                </div>
                <div>
                  <dt className="font-bold text-[var(--foreground)]">Current R2 status</dt>
                  <dd>{r2Status.configured ? (r2Status.ok ? `${r2Status.count} objects found under galleries/${gallery.slug}/` : "R2 configured, but status could not be read.") : "R2 env vars are not available to this process."}</dd>
                </div>
              </dl>
              <div className="mt-4 rounded-sm border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-sm font-bold text-[var(--foreground)]">Recommended command</p>
                <code className="mt-2 block break-all text-xs text-[var(--gold)]">npm run gallery:upload-r2 -- {gallery.slug} public/images/galleries/{gallery.slug}</code>
                <p className="muted-copy mt-3 text-xs">Equivalent direct command: npx tsx scripts/upload-gallery-to-r2.ts {gallery.slug} public/images/galleries/{gallery.slug}</p>
              </div>
              {gallery.slug === "ruth-afriyie-graduation-proofs" ? (
                <p className="gold-notice mt-4 rounded-sm p-3 text-sm">Existing shortcut: npm run gallery:upload-r2:ruth-final</p>
              ) : null}
              {gallery.slug === "deborah-bonful-birthday" ? (
                <p className="gold-notice mt-4 rounded-sm p-3 text-sm">Existing shortcut: npm run gallery:upload-r2:deborah-bday</p>
              ) : null}
            </section>
            <GalleryClientInstructions gallery={gallery} />
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <GalleryBrowserUploader galleryId={gallery.id} />
              <h2 className="mb-4 mt-8 text-2xl font-black">Add image URL</h2>
              <GalleryImageForm galleryId={gallery.id} />
            </div>
            <div className="grid gap-4">
              {gallery.images.map((image) => (
                <article key={image.id} className="surface-card grid gap-4 rounded-sm p-4 md:grid-cols-[180px_1fr]">
                  <div className="aspect-[4/3] overflow-hidden rounded-sm bg-black">
                    <img
                      src={image.thumbnailKey ? `/api/admin/galleries/${gallery.id}/images/${image.id}/thumb` : image.thumbnailUrl || image.imageUrl}
                      alt={image.title || "Gallery image"}
                      className="h-full w-full object-cover"
                    />
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
              {!gallery.images.length ? <p className="muted-copy rounded-sm border border-[var(--border)] p-6">No images have been added to this gallery yet.</p> : null}
            </div>
          </div>
        </>
      ) : result.hasDb ? (
        <p className="muted-copy mt-8">Gallery not found.</p>
      ) : null}
    </section>
  );
}
