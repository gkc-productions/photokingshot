import { createReadStream, existsSync } from "fs";
import path from "path";
import { PassThrough, Readable } from "stream";
// archiver v8 exports ESM classes; the community type package still models the older callable API.
// @ts-expect-error ZipArchive is provided by the installed archiver package at runtime.
import { ZipArchive } from "archiver";
import { NextResponse } from "next/server";
import { hasGalleryAccess } from "@/lib/gallery-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeLocalGalleryPath(imageUrl: string) {
  if (!imageUrl.startsWith("/images/galleries/")) return null;
  const decoded = decodeURIComponent(imageUrl);
  const publicRoot = path.join(process.cwd(), "public");
  const filePath = path.normalize(path.join(publicRoot, decoded));
  const galleryRoot = path.join(publicRoot, "images/galleries");
  if (!filePath.startsWith(galleryRoot)) return null;
  if (!existsSync(filePath)) return null;
  return filePath;
}

function zipFilename(slug: string) {
  return `${slug}-gallery.zip`;
}

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const gallery = await prisma.clientGallery.findFirst({
    where: { slug, isPublished: true },
    include: {
      images: {
        where: { isDownloadable: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
      }
    }
  }).catch(() => null);

  if (!gallery) return NextResponse.json({ error: "Gallery not found." }, { status: 404 });
  const allowed = await hasGalleryAccess(gallery);
  if (!allowed) return NextResponse.json({ error: "Gallery login required." }, { status: 401 });
  if (!gallery.allowDownloads) return NextResponse.json({ error: "Downloads are disabled for this gallery." }, { status: 403 });

  const localImages = gallery.images
    .map((image, index) => ({ image, index, filePath: safeLocalGalleryPath(image.imageUrl) }))
    .filter((item): item is { image: typeof gallery.images[number]; index: number; filePath: string } => Boolean(item.filePath));

  if (!localImages.length) {
    return NextResponse.json(
      { error: "No local downloadable images are available for ZIP export yet." },
      { status: 404 }
    );
  }

  const archive = new ZipArchive({ zlib: { level: 9 } });
  const stream = new PassThrough();
  archive.on("error", (error: Error) => stream.destroy(error));
  archive.pipe(stream);

  for (const { image, index, filePath } of localImages) {
    const extension = path.extname(filePath) || ".jpg";
    const baseName = image.title?.trim()
      ? image.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
      : `${gallery.slug}-${index + 1}`;
    archive.append(createReadStream(filePath), { name: `${String(index + 1).padStart(2, "0")}-${baseName}${extension}` });
  }

  // Remote image URLs are intentionally skipped for now. Future upgrade: fetch from trusted R2/S3 origins.
  void archive.finalize();

  return new Response(Readable.toWeb(stream) as ReadableStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipFilename(gallery.slug)}"`,
      "Cache-Control": "private, no-store"
    }
  });
}
