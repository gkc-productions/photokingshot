import { existsSync, readFileSync } from "fs";
import { rm } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { deleteR2Objects, listR2ObjectsByPrefix } from "../lib/r2";

const prisma = new PrismaClient();
const gallerySlug = "alexis-kofi-graduation";
const accessCode = "ALEXIS-GRAD";
const alexisR2Prefix = "galleries/alexis-kofi-graduation/";
const ruthR2Prefix = "galleries/ruth-afriyie-graduation-proofs/";
const localGalleryPath = path.join(process.cwd(), "public/images/galleries/alexis-kofi-graduation");

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

function assertAlexisPrefix(prefix: string) {
  if (prefix !== alexisR2Prefix) {
    throw new Error(`Refusing to delete R2 objects outside exact Alexis prefix: ${prefix}`);
  }
}

function assertSafeR2Keys(keys: string[]) {
  for (const key of keys) {
    if (!key.startsWith(alexisR2Prefix)) {
      throw new Error(`Refusing to delete non-Alexis R2 object: ${key}`);
    }
    if (key.startsWith(ruthR2Prefix)) {
      throw new Error(`Refusing to delete Ruth R2 object: ${key}`);
    }
  }
}

function assertSafeLocalPath(targetPath: string) {
  const resolved = path.resolve(targetPath);
  const expected = path.resolve(process.cwd(), "public/images/galleries/alexis-kofi-graduation");

  if (resolved !== expected || !resolved.includes("public/images/galleries/alexis-kofi-graduation")) {
    throw new Error(`Refusing to delete unsafe local path: ${resolved}`);
  }
}

async function main() {
  loadEnvFile();
  assertAlexisPrefix(alexisR2Prefix);

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
    console.log("Alexis gallery not found");
    return;
  }

  const r2Keys = await listR2ObjectsByPrefix(alexisR2Prefix);
  assertSafeR2Keys(r2Keys);

  console.log("Alexis gallery found before deletion:");
  console.log(JSON.stringify({
    id: gallery.id,
    title: gallery.title,
    slug: gallery.slug,
    accessCode: gallery.accessCode,
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
  await prisma.clientGallery.delete({
    where: { id: gallery.id }
  });

  assertSafeLocalPath(localGalleryPath);
  const localFolderExisted = existsSync(localGalleryPath);
  await rm(localGalleryPath, { recursive: true, force: true });

  console.log("Alexis cleanup complete:");
  console.log(JSON.stringify({
    r2ObjectsDeleted,
    selectionsDeleted: selections.count,
    imagesDeleted: images.count,
    galleryDeleted: 1,
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
