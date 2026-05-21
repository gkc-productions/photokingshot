import { existsSync, readFileSync, readdirSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const gallerySlug = "ruth-afriyie-graduation-proofs";
const accessCode = "RUTH-GRAD";
const finalSourceDir = path.join(process.cwd(), "public/images/galleries/ruth-afriyie-graduation-final");
const publicBasePath = "/images/galleries/ruth-afriyie-graduation-final";
const finalDescription = "Final edited graduation gallery by PhotoKingShot.";

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

function finalImageFiles() {
  if (!existsSync(finalSourceDir)) {
    return { files: [] as string[], unsupportedFiles: [] as string[] };
  }

  const entries = readdirSync(finalSourceDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

  return {
    files: entries.filter((name) => /\.(jpe?g)$/i.test(name)),
    unsupportedFiles: entries.filter((name) => !/\.(jpe?g)$/i.test(name))
  };
}

async function main() {
  loadEnvFile();

  const { files, unsupportedFiles } = finalImageFiles();
  console.log(JSON.stringify({
    sourceDir: finalSourceDir,
    filesFound: files.length,
    first5: files.slice(0, 5),
    last5: files.slice(-5),
    unsupportedExtensions: unsupportedFiles
  }, null, 2));

  let gallery = await prisma.clientGallery.findUnique({
    where: { slug: gallerySlug }
  });

  if (!gallery) {
    console.error("Ruth gallery not found. Create the gallery in admin and set a password before running this final-gallery setup.");
    process.exit(1);
  }

  if (!gallery.passwordHash) {
    console.error("Ruth gallery has no password hash. Admin needs to set a gallery password before final images can be published.");
    process.exit(1);
  }

  gallery = await prisma.clientGallery.update({
    where: { id: gallery.id },
    data: {
      title: "Ruth Afriyie Graduation Gallery",
      clientName: "Ruth Afriyie",
      description: finalDescription,
      accessCode,
      selectionMode: false,
      maxSelections: null,
      selectionSubmittedAt: null,
      selectionNotes: null,
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
    const imageUrl = `${publicBasePath}/${encodeURIComponent(filename).replace(/%2F/g, "/")}`;
    const data = {
      imageUrl,
      title: `Ruth Afriyie Graduation Photo ${index + 1}`,
      caption: "Final edited graduation photo by PhotoKingShot",
      sortOrder: index + 1,
      isDownloadable: true
    };
    const existing = existingByUrl.get(imageUrl);

    if (existing) {
      await prisma.galleryImage.update({
        where: { id: existing.id },
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
    console.log("No final edited images found. Drop photos into public/images/galleries/ruth-afriyie-graduation-final/ and rerun.");
  }

  console.log(JSON.stringify({
    galleryId: gallery.id,
    title: gallery.title,
    slug: gallery.slug,
    accessCode: gallery.accessCode,
    passwordHashPreserved: true,
    sourceDir: finalSourceDir,
    filesFound: files.length,
    first5: files.slice(0, 5),
    last5: files.slice(-5),
    unsupportedExtensions: unsupportedFiles,
    createdImages,
    updatedImages,
    skippedAsDuplicates,
    duplicateImageUrls,
    isPublished: gallery.isPublished,
    allowDownloads: gallery.allowDownloads,
    selectionMode: gallery.selectionMode,
    maxSelections: gallery.maxSelections
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
