import { readdir } from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

const gallerySlug = "ruth-afriyie-graduation-proofs";
const accessCode = "RUTH-GRAD";
const temporaryPassword = "RuthGrad2026!";
const proofsDir = path.join(process.cwd(), "public/images/galleries", gallerySlug, "proofs");
const publicBasePath = `/images/galleries/${gallerySlug}/proofs`;
const jpegPattern = /\.(jpe?g)$/i;

async function readProofFiles() {
  try {
    const entries = await readdir(proofsDir, { withFileTypes: true });
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
  const files = await readProofFiles();
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);

  const gallery = await prisma.clientGallery.upsert({
    where: { slug: gallerySlug },
    update: {
      title: "Ruth Afriyie Graduation Proofs",
      clientName: "Ruth Afriyie",
      clientEmail: null,
      sessionDate: null,
      description: "Select up to 20 graduation photos for editing.",
      accessCode,
      passwordHash,
      isPublished: true,
      allowDownloads: false,
      selectionMode: true,
      maxSelections: 20
    },
    create: {
      title: "Ruth Afriyie Graduation Proofs",
      slug: gallerySlug,
      clientName: "Ruth Afriyie",
      clientEmail: null,
      sessionDate: null,
      description: "Select up to 20 graduation photos for editing.",
      accessCode,
      passwordHash,
      isPublished: true,
      allowDownloads: false,
      selectionMode: true,
      maxSelections: 20
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
      skipped++;
      continue;
    }

    await prisma.galleryImage.create({
      data: {
        galleryId: gallery.id,
        imageUrl,
        title: `Ruth Afriyie Graduation Proof ${index + 1}`,
        caption: "Graduation proof by PhotoKingShot",
        sortOrder: index + 1,
        isDownloadable: false
      }
    });
    added++;
  }

  console.log(JSON.stringify({
    gallery: gallerySlug,
    filesFound: files.length,
    imagesAdded: added,
    duplicatesSkipped: skipped,
    published: true,
    selectionMode: true,
    maxSelections: 20,
    downloadsAllowed: false
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
