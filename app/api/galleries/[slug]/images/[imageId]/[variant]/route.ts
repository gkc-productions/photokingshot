import { NextResponse } from "next/server";
import { hasGalleryAccess } from "@/lib/gallery-auth";
import { prisma } from "@/lib/prisma";
import { createSignedR2DownloadUrl, createSignedR2ViewUrl, isR2Configured } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeFilename(value: string) {
  return value.trim().replace(/[^a-z0-9._-]+/gi, "-").replace(/(^-|-$)+/g, "") || "photokingshot-gallery-image.jpg";
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ slug: string; imageId: string; variant: string }> }
) {
  const { slug, imageId, variant } = await params;
  if (!["thumb", "preview", "download"].includes(variant)) {
    return NextResponse.json({ error: "Unsupported image variant." }, { status: 404 });
  }

  const gallery = await prisma.clientGallery.findFirst({
    where: { slug, isPublished: true },
    include: {
      images: {
        where: { id: imageId },
        take: 1
      }
    }
  }).catch(() => null);

  if (!gallery || !gallery.images[0]) {
    return NextResponse.json({ error: "Image not found." }, { status: 404 });
  }

  const allowed = await hasGalleryAccess(gallery);
  if (!allowed) return NextResponse.json({ error: "Gallery login required." }, { status: 401 });

  const image = gallery.images[0];
  if (variant === "download" && (!gallery.allowDownloads || !image.isDownloadable)) {
    return NextResponse.json({ error: "Downloads are disabled for this image." }, { status: 403 });
  }

  const r2Key = variant === "thumb" ? image.thumbnailKey : variant === "preview" ? image.previewKey : image.originalKey;
  if (r2Key && isR2Configured()) {
    const url = variant === "download"
      ? await createSignedR2DownloadUrl(r2Key, safeFilename(`${image.title || gallery.slug}-${image.id}.jpg`))
      : await createSignedR2ViewUrl(r2Key);
    const response = NextResponse.redirect(url);
    response.headers.set("Cache-Control", "private, max-age=300");
    return response;
  }

  const fallbackUrl = variant === "thumb"
    ? image.thumbnailUrl || image.imageUrl
    : variant === "preview"
      ? image.previewUrl || image.imageUrl
      : image.imageUrl;

  const response = NextResponse.redirect(new URL(fallbackUrl, process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002"));
  response.headers.set("Cache-Control", "private, max-age=300");
  return response;
}
