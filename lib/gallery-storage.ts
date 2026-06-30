import { access, rm } from "fs/promises";
import path from "path";
import { deleteR2Objects, isR2Configured, listR2ObjectsByPrefix } from "@/lib/r2";

const gallerySlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function assertSafeGallerySlug(slug: string) {
  if (!gallerySlugPattern.test(slug)) {
    throw new Error("Refusing to delete gallery storage for an unsafe slug.");
  }
}

export function galleryR2Prefix(slug: string) {
  assertSafeGallerySlug(slug);
  return `galleries/${slug}/`;
}

export function localGalleryPath(slug: string) {
  assertSafeGallerySlug(slug);
  const basePath = path.resolve(process.cwd(), "public/images/galleries");
  const targetPath = path.resolve(basePath, slug);

  if (targetPath !== path.join(basePath, slug) || !targetPath.startsWith(`${basePath}${path.sep}`)) {
    throw new Error("Refusing to delete local files outside the gallery folder.");
  }

  return targetPath;
}

export async function deleteGalleryR2Objects(slug: string) {
  const prefix = galleryR2Prefix(slug);
  if (!isR2Configured()) {
    return { configured: false, prefix, deleted: 0 };
  }

  const keys = await listR2ObjectsByPrefix(prefix);
  if (keys.some((key) => !key.startsWith(prefix))) {
    throw new Error("Refusing to delete R2 objects outside the gallery prefix.");
  }

  return {
    configured: true,
    prefix,
    deleted: await deleteR2Objects(keys)
  };
}

export async function deleteLocalGalleryFolder(slug: string) {
  const targetPath = localGalleryPath(slug);

  try {
    await access(targetPath);
  } catch {
    return { path: targetPath, deleted: false };
  }

  await rm(targetPath, { recursive: true, force: false });
  return { path: targetPath, deleted: true };
}
