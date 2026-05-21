import { readFileSync, readdirSync } from "fs";
import path from "path";
import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";

const prisma = new PrismaClient();
const gallerySlug = process.argv[2];
const sourceArg = process.argv[3];
const defaultSourceFolder = gallerySlug === "ruth-afriyie-graduation-proofs" ? "proofs" : "";
const sourceDir = sourceArg
  ? path.resolve(process.cwd(), sourceArg)
  : path.join(process.cwd(), "public/images/galleries", gallerySlug || "", defaultSourceFolder);
let r2Client: S3Client | null = null;

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

function imageFiles() {
  const entries = readdirSync(sourceDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

  return {
    files: entries.filter((entry) => /\.(jpe?g)$/i.test(entry)),
    unsupportedFiles: entries.filter((entry) => !/\.(jpe?g)$/i.test(entry))
  };
}

function contentTypeFor(filename: string) {
  return filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")
    ? "image/jpeg"
    : "application/octet-stream";
}

function env(name: string) {
  return process.env[name]?.trim() || "";
}

function isR2Configured() {
  return Boolean(env("R2_ACCOUNT_ID") && env("R2_ACCESS_KEY_ID") && env("R2_SECRET_ACCESS_KEY") && env("R2_BUCKET_NAME"));
}

function getR2Client() {
  if (!r2Client) {
    r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${env("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env("R2_ACCESS_KEY_ID"),
        secretAccessKey: env("R2_SECRET_ACCESS_KEY")
      }
    });
  }
  return r2Client;
}

async function uploadR2Object({ key, body, contentType }: { key: string; body: Buffer; contentType: string }) {
  await getR2Client().send(new PutObjectCommand({
    Bucket: env("R2_BUCKET_NAME"),
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: "private, max-age=31536000, immutable"
  }));
}

async function r2ObjectExists(key: string) {
  try {
    await getR2Client().send(new HeadObjectCommand({
      Bucket: env("R2_BUCKET_NAME"),
      Key: key
    }));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  loadEnvFile();

  if (!gallerySlug) {
    throw new Error("Usage: tsx scripts/upload-gallery-to-r2.ts <gallery-slug> [local-source-folder]");
  }

  if (!isR2Configured()) {
    throw new Error("R2 env vars are missing. Required: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME.");
  }

  const gallery = await prisma.clientGallery.findUnique({
    where: { slug: gallerySlug }
  });
  if (!gallery) throw new Error(`Gallery not found: ${gallerySlug}`);

  const { files, unsupportedFiles } = imageFiles();
  console.log(JSON.stringify({
    gallery: gallerySlug,
    sourceDir,
    filesFound: files.length,
    first5: files.slice(0, 5),
    last5: files.slice(-5),
    unsupportedExtensions: unsupportedFiles
  }, null, 2));

  let uploadedOriginals = 0;
  let skippedOriginals = 0;
  let uploadedThumbs = 0;
  let skippedThumbs = 0;
  let uploadedPreviews = 0;
  let skippedPreviews = 0;
  let updatedImages = 0;
  let createdImages = 0;
  let skippedAsDuplicates = 0;
  const errors: Array<{ filename: string; error: string }> = [];

  for (const [index, filename] of files.entries()) {
    try {
      const sourcePath = path.join(sourceDir, filename);
      const originalKey = `galleries/${gallerySlug}/originals/${filename}`;
      const thumbnailKey = `galleries/${gallerySlug}/thumbs/${filename}`;
      const previewKey = `galleries/${gallerySlug}/previews/${filename}`;
      const fallbackImageUrl = `/images/galleries/${path.relative(path.join(process.cwd(), "public/images/galleries"), sourceDir).split(path.sep).join("/")}/${filename}`;

      const [originalExists, thumbnailExists, previewExists] = await Promise.all([
        r2ObjectExists(originalKey),
        r2ObjectExists(thumbnailKey),
        r2ObjectExists(previewKey)
      ]);
      const needsOriginal = !originalExists;
      const needsThumbnail = !thumbnailExists;
      const needsPreview = !previewExists;

      if (!needsOriginal) skippedOriginals++;
      if (!needsThumbnail) skippedThumbs++;
      if (!needsPreview) skippedPreviews++;

      let original: Buffer | null = null;
      if (needsOriginal || needsThumbnail || needsPreview) {
        original = readFileSync(sourcePath);
      }

      if (needsOriginal && original) {
        await uploadR2Object({ key: originalKey, body: original, contentType: contentTypeFor(filename) });
        uploadedOriginals++;
      }
      if (needsThumbnail && original) {
        const thumbnail = await sharp(original)
          .rotate()
          .resize({ width: 900, withoutEnlargement: true })
          .jpeg({ quality: 82, progressive: true })
          .toBuffer();
        await uploadR2Object({ key: thumbnailKey, body: thumbnail, contentType: "image/jpeg" });
        uploadedThumbs++;
      }
      if (needsPreview && original) {
        const preview = await sharp(original)
          .rotate()
          .resize({ width: 2200, withoutEnlargement: true })
          .jpeg({ quality: 92, progressive: true })
          .toBuffer();
        await uploadR2Object({ key: previewKey, body: preview, contentType: "image/jpeg" });
        uploadedPreviews++;
      }

      const existing = await prisma.galleryImage.findFirst({
        where: { galleryId: gallery.id, imageUrl: fallbackImageUrl }
      });

      const data = {
        originalKey,
        thumbnailKey,
        previewKey,
        imageUrl: fallbackImageUrl,
        title: existing?.title || `${gallery.title} Photo ${index + 1}`,
        caption: existing?.caption || "Private gallery photo by PhotoKingShot",
        sortOrder: existing?.sortOrder ?? index + 1,
        isDownloadable: existing?.isDownloadable ?? true
      };

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

      console.log(`${index + 1}/${files.length} ${filename}: originals ${needsOriginal ? "uploaded" : "exists"}, thumbs ${needsThumbnail ? "uploaded" : "exists"}, previews ${needsPreview ? "uploaded" : "exists"}, db ${existing ? "updated" : "created"}`);
    } catch (error) {
      errors.push({
        filename,
        error: error instanceof Error ? error.message : String(error)
      });
      console.error(`${index + 1}/${files.length} ${filename}: ERROR ${errors[errors.length - 1].error}`);
    }
  }

  console.log(JSON.stringify({
    gallery: gallerySlug,
    sourceDir,
    filesFound: files.length,
    first5: files.slice(0, 5),
    last5: files.slice(-5),
    unsupportedExtensions: unsupportedFiles,
    uploadedOriginals,
    skippedOriginals,
    thumbnailsRegenerated: uploadedThumbs,
    previewsRegenerated: uploadedPreviews,
    uploadedThumbs,
    skippedThumbs,
    uploadedPreviews,
    skippedPreviews,
    updatedImages,
    createdImages,
    skippedAsDuplicates,
    errors
  }, null, 2));

  if (errors.length) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
