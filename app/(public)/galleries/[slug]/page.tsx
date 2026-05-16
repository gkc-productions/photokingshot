import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { hasGalleryAccess } from "@/lib/gallery-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const gallery = await prisma.clientGallery.findFirst({
    where: { slug, isPublished: true },
    select: { title: true, description: true }
  }).catch(() => null);

  return {
    title: gallery?.title ? `${gallery.title} | Client Gallery` : "Client Gallery",
    description: gallery?.description || "Private PhotoKingShot client gallery."
  };
}

export default async function ClientGalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const gallery = await prisma.clientGallery.findFirst({
    where: { slug, isPublished: true },
    include: {
      images: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
      }
    }
  }).catch(() => null);

  if (!gallery) redirect("/galleries?error=not-found");
  const allowed = await hasGalleryAccess(gallery);
  if (!allowed) redirect("/galleries?error=login-required");

  return (
    <section className="section-shell py-16 md:py-24">
      <div className="max-w-4xl">
        <p className="eyebrow">Private gallery</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">{gallery.title}</h1>
        <div className="muted-copy mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <span>{gallery.clientName}</span>
          {gallery.sessionDate ? <span>{gallery.sessionDate.toLocaleDateString()}</span> : null}
        </div>
        {gallery.description ? <p className="muted-copy mt-5 max-w-3xl text-lg leading-8">{gallery.description}</p> : null}
        <p className="gold-notice mt-6 rounded-sm p-4 text-sm">Please only share this gallery link with people you trust.</p>
        {gallery.allowDownloads ? (
          <p className="muted-copy mt-4 text-sm">Download All will be available after packaged gallery export support is added.</p>
        ) : null}
      </div>

      {gallery.images.length ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.images.map((image) => {
            const canDownload = gallery.allowDownloads && image.isDownloadable;
            return (
              <article key={image.id} className="surface-card overflow-hidden rounded-sm">
                <div className="aspect-[4/3] bg-black">
                  <img src={image.imageUrl} alt={image.title || image.caption || gallery.title} className="h-full w-full object-cover" />
                </div>
                <div className="p-4">
                  {image.title ? <h2 className="text-lg font-black">{image.title}</h2> : null}
                  {image.caption ? <p className="muted-copy mt-2 text-sm leading-6">{image.caption}</p> : null}
                  {canDownload ? (
                    <a href={image.imageUrl} download className="gold-button mt-4 inline-flex min-h-10 items-center rounded-sm px-4 py-2 text-xs font-black uppercase tracking-wide">
                      Download
                    </a>
                  ) : (
                    <p className="muted-copy mt-4 text-xs">Downloads disabled</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="muted-copy mt-10 rounded-sm border border-[var(--border)] p-6">No images have been added to this gallery yet.</p>
      )}
    </section>
  );
}
