import type { Metadata } from "next";
import { existsSync } from "fs";
import path from "path";
import { redirect } from "next/navigation";
import { GalleryLightbox } from "@/components/GalleryLightbox";
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
  const downloadableCount = gallery.images.filter((image) => gallery.allowDownloads && image.isDownloadable).length;
  const audioUrl = gallery.slug === "alexis-kofi-graduation" && existsSync(path.join(process.cwd(), "public/audio/graduation-gallery.mp3"))
    ? "/audio/graduation-gallery.mp3"
    : undefined;

  return (
    <section className="section-shell py-16 md:py-24">
      <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <div className="max-w-4xl">
          <p className="eyebrow">Private gallery</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">{gallery.title}</h1>
          <div className="muted-copy mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <span>{gallery.clientName}</span>
            {gallery.sessionDate ? <span>{gallery.sessionDate.toLocaleDateString()}</span> : null}
            <span>{gallery.images.length} images</span>
          </div>
          {gallery.description ? <p className="muted-copy mt-5 max-w-3xl text-lg leading-8">{gallery.description}</p> : null}
        </div>
        <p className="gold-notice rounded-sm p-4 text-sm md:max-w-xs">Please only share this gallery link with people you trust.</p>
      </div>

      {gallery.images.length ? (
        <GalleryLightbox
          galleryTitle={gallery.title}
          downloadAllUrl={gallery.allowDownloads && downloadableCount ? `/api/galleries/${gallery.slug}/download-all` : undefined}
          audioUrl={audioUrl}
          images={gallery.images.map((image) => ({
            id: image.id,
            imageUrl: image.imageUrl,
            title: image.title,
            caption: image.caption,
            canDownload: gallery.allowDownloads && image.isDownloadable
          }))}
        />
      ) : (
        <p className="muted-copy mt-10 rounded-sm border border-[var(--border)] p-6">No images have been added to this gallery yet.</p>
      )}
    </section>
  );
}
