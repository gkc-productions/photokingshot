import { existsSync, readFileSync } from "fs";
import { rm } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { deleteR2Objects, listR2ObjectsByPrefix } from "../lib/r2";

const prisma = new PrismaClient();
const gallerySlug = "ruth-afriyie-graduation-proofs";
const accessCode = "RUTH-GRAD";
const ruthR2Prefix = "galleries/ruth-afriyie-graduation-proofs/";
const localGalleryPath = path.join(process.cwd(), "public/images/galleries/ruth-afriyie-graduation-proofs");

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env");
  let content = "";
  try {
    content = readFileSync(envPath, "utf8");
  } catch {
    return;
  }

  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    let value = match[2].trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

function assertRuthPrefix(prefix: string) {
  if (prefix !== ruthR2Prefix) {
    throw new Error(`Refusing to delete R2 objects outside exact Ruth prefix: ${prefix}`);
  }
}

function assertSafeR2Keys(keys: string[]) {
  for (const key of keys) {
    if (!key.startsWith(ruthR2Prefix)) {
      throw new Error(`Refusing to delete non-Ruth R2 object: ${key}`);
    }
  }
}

function assertSafeLocalPath(targetPath: string) {
  const resolved = path.resolve(targetPath);
  const expected = path.resolve(process.cwd(), "public/images/galleries/ruth-afriyie-graduation-proofs");

  if (resolved !== expected || !resolved.includes("public/images/galleries/ruth-afriyie-graduation-proofs")) {
    throw new Error(`Refusing to delete unsafe local path: ${resolved}`);
  }
}

async function main() {
  loadEnvFile();
  assertRuthPrefix(ruthR2Prefix);

  const gallery = await prisma.clientGallery.findFirst({
    where: {
      OR: [
        { slug: gallerySlug },
        { accessCode }
      ]
    },
    include: {
      _count: {
        select: {
          images: true,
          selections: true
        }
      }
    }
  });

  if (!gallery) {
    console.log("Ruth gallery not found");
    return;
  }

  const r2Keys = await listR2ObjectsByPrefix(ruthR2Prefix);
  assertSafeR2Keys(r2Keys);

  console.log("Ruth gallery found before cleanup:");
  console.log(JSON.stringify({
    id: gallery.id,
    title: gallery.title,
    slug: gallery.slug,
    accessCode: gallery.accessCode,
    isPublished: gallery.isPublished,
    selectionMode: gallery.selectionMode,
    maxSelections: gallery.maxSelections,
    selectionSubmittedAt: gallery.selectionSubmittedAt,
    imageRows: gallery._count.images,
    selectionRows: gallery._count.selections,
    r2Objects: r2Keys.length
  }, null, 2));

  const r2ObjectsDeleted = await deleteR2Objects(r2Keys);
  const selections = await prisma.gallerySelection.deleteMany({
    where: { galleryId: gallery.id }
  });
  const images = await prisma.galleryImage.deleteMany({
    where: { galleryId: gallery.id }
  });

  const updatedGallery = await prisma.clientGallery.update({
    where: { id: gallery.id },
    data: {
      description: "Final edited gallery coming soon.",
      selectionSubmittedAt: null,
      selectionNotes: null,
      allowDownloads: false,
      isPublished: false,
      selectionMode: false
    }
  });

  assertSafeLocalPath(localGalleryPath);
  const localFolderExisted = existsSync(localGalleryPath);
  await rm(localGalleryPath, { recursive: true, force: true });

  console.log("Ruth proofing cleanup complete:");
  console.log(JSON.stringify({
    r2ObjectsDeleted,
    selectionsDeleted: selections.count,
    imagesDeleted: images.count,
    galleryPreserved: true,
    galleryId: updatedGallery.id,
    isPublished: updatedGallery.isPublished,
    allowDownloads: updatedGallery.allowDownloads,
    selectionMode: updatedGallery.selectionMode,
    selectionSubmittedAt: updatedGallery.selectionSubmittedAt,
    localFolderDeleted: localFolderExisted
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
