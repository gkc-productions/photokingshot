import { readdir } from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

const gallerySlug = "alexis-kofi-graduation";
const accessCode = "ALEXIS-GRAD";
const temporaryPassword = "AlexisGrad2026!";
const imageDir = path.join(process.cwd(), "public/images/galleries/alexis-kofi-graduation");
const publicBasePath = "/images/galleries/alexis-kofi-graduation";
const jpegPattern = /\.(jpe?g)$/i;

async function readGalleryFiles() {
  try {
    const entries = await readdir(imageDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && jpegPattern.test(entry.name))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function main() {
  const files = await readGalleryFiles();
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);

  const gallery = await prisma.clientGallery.upsert({
    where: { slug: gallerySlug },
    update: {
      title: "Alexis Kofi Graduation Gallery",
      clientName: "Alexis Kofi",
      clientEmail: null,
      sessionDate: null,
      description: "Private graduation photo gallery by PhotoKingShot.",
      accessCode,
      passwordHash,
      isPublished: true,
      allowDownloads: true
    },
    create: {
      title: "Alexis Kofi Graduation Gallery",
      slug: gallerySlug,
      clientName: "Alexis Kofi",
      clientEmail: null,
      sessionDate: null,
      description: "Private graduation photo gallery by PhotoKingShot.",
      accessCode,
      passwordHash,
      isPublished: true,
      allowDownloads: true
    }
  });

  const existing = await prisma.galleryImage.findMany({
    where: { galleryId: gallery.id },
    select: { imageUrl: true }
  });
  const existingUrls = new Set(existing.map((image) => image.imageUrl));

  let added = 0;
  let skipped = 0;

  for (const [index, filename] of files.entries()) {
    const imageUrl = `${publicBasePath}/${encodeURIComponent(filename).replace(/%2F/g, "/")}`;
    if (existingUrls.has(imageUrl)) {
      skipped += 1;
      continue;
    }

    await prisma.galleryImage.create({
      data: {
        galleryId: gallery.id,
        imageUrl,
        title: `Alexis Kofi Graduation Photo ${index + 1}`,
        caption: "Graduation portrait by PhotoKingShot",
        sortOrder: index + 1,
        isDownloadable: true
      }
    });
    added += 1;
  }

  console.log("Alexis Kofi Graduation Gallery created/updated.");
  console.log(`Files found: ${files.length}`);
  console.log(`New images added: ${added}`);
  console.log(`Duplicates skipped: ${skipped}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
