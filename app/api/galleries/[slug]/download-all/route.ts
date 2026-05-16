import { createReadStream, existsSync } from "fs";
import path from "path";
import { PassThrough, Readable } from "stream";
// archiver v8 exports ESM classes; the community type package still models the older callable API.
// @ts-expect-error ZipArchive is provided by the installed archiver package at runtime.
import { ZipArchive } from "archiver";
import { NextResponse } from "next/server";
import { hasGalleryAccess } from "@/lib/gallery-auth";
import { prisma } from "@/lib/prisma";
import { getR2Object, isR2Configured } from "@/lib/r2";

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

function safeZipBaseName(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") || "photokingshot-gallery-image";
}

function r2BodyToNodeStream(body: unknown) {
  if (!body) return null;
  if (body instanceof Readable) return body;
  if (typeof (body as { transformToWebStream?: unknown }).transformToWebStream === "function") {
    const webStream = (body as { transformToWebStream: () => ReadableStream }).transformToWebStream();
    return Readable.fromWeb(webStream as import("stream/web").ReadableStream);
  }
  if (body instanceof Uint8Array) return Readable.from(body);
  return null;
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
  if (gallery.images.length > 100) {
    return NextResponse.json(
      { error: "This gallery is too large for one-click ZIP export right now. Please download individual images." },
      { status: 413 }
    );
  }

  const downloadableImages = gallery.images.filter((image) => image.originalKey || safeLocalGalleryPath(image.imageUrl));
  if (!downloadableImages.length) return NextResponse.json({ error: "No downloadable images are available for ZIP export yet." }, { status: 404 });

  const archive = new ZipArchive({ zlib: { level: 9 } });
  const stream = new PassThrough();
  archive.on("error", (error: Error) => stream.destroy(error));
  archive.pipe(stream);

  void (async () => {
    try {
      for (const [index, image] of downloadableImages.entries()) {
        const filePath = safeLocalGalleryPath(image.imageUrl);
        const extension = path.extname(image.imageUrl) || ".jpg";
        const baseName = safeZipBaseName(image.title || `${gallery.slug}-${index + 1}`);
        const name = `${String(index + 1).padStart(2, "0")}-${baseName}${extension}`;

        if (image.originalKey && isR2Configured()) {
          const object = await getR2Object(image.originalKey);
          const body = r2BodyToNodeStream(object.Body);
          if (body) {
            archive.append(body, { name });
            continue;
          }
        }

        if (filePath) {
          archive.append(createReadStream(filePath), { name });
        }
      }
      await archive.finalize();
    } catch (error) {
      archive.destroy(error as Error);
    }
  })();

  // Remote non-R2 image URLs are intentionally skipped for ZIP export.

  return new Response(Readable.toWeb(stream) as ReadableStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipFilename(gallery.slug)}"`,
      "Cache-Control": "private, no-store"
    }
  });
}
