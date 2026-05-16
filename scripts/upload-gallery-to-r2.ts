import { readFileSync, readdirSync } from "fs";
import path from "path";
import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";

const prisma = new PrismaClient();
const gallerySlug = "alexis-kofi-graduation";
const sourceDir = path.join(process.cwd(), "public/images/galleries/alexis-kofi-graduation");
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
  return readdirSync(sourceDir)
    .filter((entry) => /\.(jpe?g)$/i.test(entry))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
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

  if (!isR2Configured()) {
    throw new Error("R2 env vars are missing. Required: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME.");
  }

  const gallery = await prisma.clientGallery.findUnique({
    where: { slug: gallerySlug }
  });
  if (!gallery) throw new Error(`Gallery not found: ${gallerySlug}`);

  const files = imageFiles();
  let uploadedOriginals = 0;
  let skippedOriginals = 0;
  let uploadedThumbs = 0;
  let uploadedPreviews = 0;
  let updatedImages = 0;
  let createdImages = 0;

  for (const [index, filename] of files.entries()) {
    const sourcePath = path.join(sourceDir, filename);
    const original = readFileSync(sourcePath);
    const thumbnail = await sharp(original)
      .rotate()
      .resize({ width: 900, withoutEnlargement: true })
      .jpeg({ quality: 82, progressive: true })
      .toBuffer();
    const preview = await sharp(original)
      .rotate()
      .resize({ width: 2200, withoutEnlargement: true })
      .jpeg({ quality: 92, progressive: true })
      .toBuffer();

    const originalKey = `galleries/${gallerySlug}/originals/${filename}`;
    const thumbnailKey = `galleries/${gallerySlug}/thumbs/${filename}`;
    const previewKey = `galleries/${gallerySlug}/previews/${filename}`;
    const imageUrl = `/images/galleries/${gallerySlug}/${filename}`;

    if (await r2ObjectExists(originalKey)) {
      skippedOriginals++;
    } else {
      await uploadR2Object({ key: originalKey, body: original, contentType: contentTypeFor(filename) });
      uploadedOriginals++;
    }
    await uploadR2Object({ key: thumbnailKey, body: thumbnail, contentType: "image/jpeg" });
    uploadedThumbs++;
    await uploadR2Object({ key: previewKey, body: preview, contentType: "image/jpeg" });
    uploadedPreviews++;

    const existing = await prisma.galleryImage.findFirst({
      where: { galleryId: gallery.id, imageUrl }
    });

    const data = {
      originalKey,
      thumbnailKey,
      previewKey,
      imageUrl,
      title: existing?.title || `Alexis Kofi Graduation Photo ${index + 1}`,
      caption: existing?.caption || "Graduation portrait by PhotoKingShot",
      sortOrder: existing?.sortOrder ?? index,
      isDownloadable: existing?.isDownloadable ?? true
    };

    if (existing) {
      await prisma.galleryImage.update({
        where: { id: existing.id },
        data
      });
      updatedImages++;
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

  console.log(JSON.stringify({
    gallery: gallerySlug,
    filesFound: files.length,
    uploadedOriginals,
    skippedOriginals,
    thumbnailsRegenerated: uploadedThumbs,
    previewsRegenerated: uploadedPreviews,
    uploadedThumbs,
    uploadedPreviews,
    updatedImages,
    createdImages
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
