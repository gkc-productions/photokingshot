import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

type GallerySessionInput = {
  id: string;
  slug: string;
  passwordHash: string;
};

function secret() {
  return process.env.ADMIN_PASSWORD || process.env.DATABASE_URL || "photokingshot-gallery-session";
}

export function galleryCookieName(galleryId: string) {
  return `photokingshot_gallery_${galleryId}`;
}

function signGalleryAccess(gallery: GallerySessionInput) {
  return createHmac("sha256", secret())
    .update(`${gallery.id}:${gallery.slug}:${gallery.passwordHash}`)
    .digest("hex");
}

export async function setGalleryAccessCookie(gallery: GallerySessionInput) {
  const cookieStore = await cookies();
  cookieStore.set(galleryCookieName(gallery.id), signGalleryAccess(gallery), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: `/galleries/${gallery.slug}`,
    maxAge: 60 * 60 * 24 * 14
  });
}

export async function hasGalleryAccess(gallery: GallerySessionInput) {
  const cookieStore = await cookies();
  const value = cookieStore.get(galleryCookieName(gallery.id))?.value;
  if (!value) return false;

  const expected = signGalleryAccess(gallery);
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);
  if (valueBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(valueBuffer, expectedBuffer);
}
