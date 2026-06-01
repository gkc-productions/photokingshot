import { existsSync, readFileSync, readdirSync } from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const gallerySlug = "deborah-bonful-birthday";
const accessCode = "DEBORAH-BDAY";
const temporaryPassword = "DeborahBday2026!";
const sourceDir = path.join(process.cwd(), "public/images/galleries/deborah-bonful-birthday");
const publicBasePath = "/images/galleries/deborah-bonful-birthday";
const description = "Private birthday photo gallery by PhotoKingShot.";
const jpegPattern = /\.(jpe?g)$/i;
const ignoredNamePattern = /^readme(?:\..*)?$/i;
const ignoredFolders = new Set(["thumbs", "previews", "raw"]);

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

function readDeborahBirthdayFiles() {
  if (!existsSync(sourceDir)) {
    return { files: [] as string[], unsupportedFiles: [] as string[] };
  }

  const fileEntries = readdirSync(sourceDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => !ignoredNamePattern.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

  const unsupportedDirectoryEntries = readdirSync(sourceDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !ignoredFolders.has(entry.name.toLowerCase()))
    .map((entry) => `${entry.name}/`);

  return {
    files: fileEntries.filter((name) => jpegPattern.test(name)),
    unsupportedFiles: [
      ...fileEntries.filter((name) => !jpegPattern.test(name)),
      ...unsupportedDirectoryEntries
    ]
  };
}

function publicImageUrl(filename: string) {
  return `${publicBasePath}/${encodeURIComponent(filename).replace(/%2F/g, "/")}`;
}

async function main() {
  loadEnvFile();
  const prisma = new PrismaClient();

  try {
    const { files, unsupportedFiles } = readDeborahBirthdayFiles();
    console.log(JSON.stringify({
      sourceDir,
      filesFound: files.length,
      first5: files.slice(0, 5),
      last5: files.slice(-5),
      unsupportedFiles
    }, null, 2));

    const existingGallery = await prisma.clientGallery.findUnique({
      where: { slug: gallerySlug }
    });

    const passwordHash = existingGallery?.passwordHash || await bcrypt.hash(temporaryPassword, 12);
    const passwordHashCreated = !existingGallery?.passwordHash;
    const passwordHashPreserved = Boolean(existingGallery?.passwordHash);

    const gallery = existingGallery
      ? await prisma.clientGallery.update({
        where: { id: existingGallery.id },
        data: {
          title: "Deborah Bonful Birthday Gallery",
          clientName: "Deborah Bonful",
          description,
          accessCode,
          selectionMode: false,
          allowDownloads: true,
          isPublished: files.length > 0,
          ...(existingGallery.passwordHash ? {} : { passwordHash })
        }
      })
      : await prisma.clientGallery.create({
        data: {
          title: "Deborah Bonful Birthday Gallery",
          slug: gallerySlug,
          clientName: "Deborah Bonful",
          description,
          accessCode,
          passwordHash,
          selectionMode: false,
          allowDownloads: true,
          isPublished: files.length > 0
        }
      });

    const existingImages = await prisma.galleryImage.findMany({
      where: { galleryId: gallery.id },
      select: { id: true, imageUrl: true }
    });
    const existingByUrl = new Map(existingImages.map((image) => [image.imageUrl, image]));
    const duplicateImageUrls = existingImages
      .map((image) => image.imageUrl)
      .filter((imageUrl, index, imageUrls) => imageUrls.indexOf(imageUrl) !== index);

    let createdImages = 0;
    let updatedImages = 0;
    let skippedAsDuplicates = 0;

    for (const [index, filename] of files.entries()) {
      const imageUrl = publicImageUrl(filename);
      const data = {
        imageUrl,
        title: `Deborah Bonful Birthday Photo ${index + 1}`,
        caption: "Birthday photo by PhotoKingShot",
        sortOrder: index + 1,
        isDownloadable: true
      };
      const existingImage = existingByUrl.get(imageUrl);

      if (existingImage) {
        await prisma.galleryImage.update({
          where: { id: existingImage.id },
          data
        });
        updatedImages++;
        skippedAsDuplicates++;
      } else {
        await prisma.galleryImage.create({
          data: {
            ...data,
            galleryId: gallery.id
          }
        });
        createdImages++;
      }
    }

    if (files.length === 0) {
      console.log("No Deborah birthday images found. Drop photos into public/images/galleries/deborah-bonful-birthday/ and rerun.");
    }

    const imageCount = await prisma.galleryImage.count({
      where: { galleryId: gallery.id }
    });

    console.log(JSON.stringify({
      galleryId: gallery.id,
      title: gallery.title,
      slug: gallery.slug,
      accessCode: gallery.accessCode,
      passwordHashCreated,
      passwordHashPreserved,
      sourceDir,
      filesFound: files.length,
      first5: files.slice(0, 5),
      last5: files.slice(-5),
      createdImages,
      updatedImages,
      skippedAsDuplicates,
      unsupportedFiles,
      duplicateImageUrls,
      imageCount,
      isPublished: gallery.isPublished,
      allowDownloads: gallery.allowDownloads,
      selectionMode: gallery.selectionMode
    }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
