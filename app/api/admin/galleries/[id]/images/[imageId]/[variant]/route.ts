import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { createSignedR2DownloadUrl, createSignedR2ViewUrl, isR2Configured } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeFilename(value: string) {
  return value.trim().replace(/[^a-z0-9._-]+/gi, "-").replace(/(^-|-$)+/g, "") || "photokingshot-gallery-image.jpg";
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string; imageId: string; variant: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Admin login required." }, { status: 401 });
  }

  const { id, imageId, variant } = await params;
  if (!["thumb", "preview", "download"].includes(variant)) {
    return NextResponse.json({ error: "Unsupported image variant." }, { status: 404 });
  }

  const image = await prisma.galleryImage.findFirst({
    where: { id: imageId, galleryId: id },
    include: { gallery: { select: { slug: true, title: true } } }
  });

  if (!image) {
    return NextResponse.json({ error: "Image not found." }, { status: 404 });
  }

  const r2Key = variant === "thumb" ? image.thumbnailKey : variant === "preview" ? image.previewKey : image.originalKey;
  if (r2Key && isR2Configured()) {
    const url = variant === "download"
      ? await createSignedR2DownloadUrl(r2Key, safeFilename(`${image.title || image.gallery.title}-${image.id}.jpg`))
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
