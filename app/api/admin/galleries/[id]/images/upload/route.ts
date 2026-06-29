import { randomUUID } from "crypto";
import path from "path";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { isR2Configured, uploadR2Object } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maxFileSize = 30 * 1024 * 1024;

function safeFilename(value: string) {
  const parsed = path.parse(value);
  const base = parsed.name.trim().replace(/[^a-z0-9._-]+/gi, "-").replace(/(^-|-$)+/g, "") || "gallery-image";
  return `${base}.jpg`;
}

function titleFromFilename(value: string) {
  return path.parse(value).name.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim() || "Gallery image";
}

function jpegContentType(file: File) {
  return file.type === "image/jpeg" || /\.(jpe?g)$/i.test(file.name);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Admin login required." }, { status: 401 });
  }

  if (!isR2Configured()) {
    return NextResponse.json({ ok: false, error: "Cloudflare R2 is not configured on the server." }, { status: 503 });
  }

  const { id } = await params;
  const gallery = await prisma.clientGallery.findUnique({
    where: { id },
    include: { _count: { select: { images: true } } }
  });

  if (!gallery) {
    return NextResponse.json({ ok: false, error: "Gallery not found." }, { status: 404 });
  }

  const formData = await request.formData();
  const files = formData.getAll("files").filter((value): value is File => value instanceof File);
  if (!files.length) {
    return NextResponse.json({ ok: false, error: "No JPEG files were uploaded." }, { status: 400 });
  }

  const results: Array<{ filename: string; ok: boolean; imageId?: string; error?: string }> = [];
  let sortOrder = gallery._count.images;

  for (const file of files) {
    const imageId = randomUUID();
    const filename = safeFilename(file.name);
    const keyFilename = `${Date.now()}-${imageId}-${filename}`;
    const originalKey = `galleries/${gallery.slug}/originals/${keyFilename}`;
    const thumbnailKey = `galleries/${gallery.slug}/thumbs/${keyFilename}`;
    const previewKey = `galleries/${gallery.slug}/previews/${keyFilename}`;

    try {
      if (!jpegContentType(file)) throw new Error("Only JPEG files are supported.");
      if (file.size > maxFileSize) throw new Error("File is larger than the 30 MB upload limit.");

      const original = Buffer.from(await file.arrayBuffer());
      const image = sharp(original).rotate();
      const metadata = await image.metadata();
      if (metadata.format !== "jpeg") throw new Error("Only JPEG files are supported.");

      const [thumbnail, preview] = await Promise.all([
        sharp(original).rotate().resize({ width: 900, withoutEnlargement: true }).jpeg({ quality: 82, progressive: true }).toBuffer(),
        sharp(original).rotate().resize({ width: 2200, withoutEnlargement: true }).jpeg({ quality: 92, progressive: true }).toBuffer()
      ]);

      await Promise.all([
        uploadR2Object({ key: originalKey, body: original, contentType: "image/jpeg" }),
        uploadR2Object({ key: thumbnailKey, body: thumbnail, contentType: "image/jpeg" }),
        uploadR2Object({ key: previewKey, body: preview, contentType: "image/jpeg" })
      ]);

      sortOrder += 1;
      await prisma.galleryImage.create({
        data: {
          id: imageId,
          galleryId: gallery.id,
          imageUrl: `/api/galleries/${gallery.slug}/images/${imageId}/preview`,
          originalKey,
          thumbnailKey,
          previewKey,
          title: titleFromFilename(file.name),
          caption: "Private gallery photo by PhotoKingShot",
          sortOrder,
          isDownloadable: true
        }
      });

      results.push({ filename: file.name, ok: true, imageId });
    } catch (error) {
      results.push({
        filename: file.name,
        ok: false,
        error: error instanceof Error ? error.message : "Upload failed."
      });
    }
  }

  const uploaded = results.filter((result) => result.ok).length;
  const failed = results.length - uploaded;

  return NextResponse.json({ ok: uploaded > 0, uploaded, failed, results }, { status: uploaded > 0 ? 200 : 400 });
}
