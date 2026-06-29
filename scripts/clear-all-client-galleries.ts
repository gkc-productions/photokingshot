import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { deleteR2Objects, isR2Configured, listR2ObjectsByPrefix } from "../lib/r2";

const prisma = new PrismaClient();
const confirmDelete = process.env.CONFIRM_DELETE_ALL_CLIENT_GALLERIES === "yes";
const r2GalleryPrefix = "galleries/";
const localGalleryRoot = path.join(process.cwd(), "public/images/galleries");

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

function localGalleryFolders() {
  if (!existsSync(localGalleryRoot)) return [];
  return readdirSync(localGalleryRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
}

function recreateLocalGalleryRoot() {
  rmSync(localGalleryRoot, { recursive: true, force: true });
  mkdirSync(localGalleryRoot, { recursive: true });
  writeFileSync(
    path.join(localGalleryRoot, "README.md"),
    "Gallery image folders are intentionally ignored and can be recreated by admin uploads or maintenance scripts.\n"
  );
}

async function counts() {
  const [clientGalleries, galleryImages, gallerySelections] = await Promise.all([
    prisma.clientGallery.count(),
    prisma.galleryImage.count(),
    prisma.gallerySelection.count()
  ]);
  return { clientGalleries, galleryImages, gallerySelections };
}

async function main() {
  loadEnvFile();

  const [beforeCounts, galleries] = await Promise.all([
    counts(),
    prisma.clientGallery.findMany({
      orderBy: [{ createdAt: "asc" }, { title: "asc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        accessCode: true,
        _count: { select: { images: true, selections: true } }
      }
    })
  ]);

  const r2Keys = isR2Configured() ? await listR2ObjectsByPrefix(r2GalleryPrefix) : [];
  const safeR2Keys = r2Keys.filter((key) => key.startsWith(r2GalleryPrefix));
  const unsafeR2Keys = r2Keys.filter((key) => !key.startsWith(r2GalleryPrefix));
  const beforeLocalFolders = localGalleryFolders();

  console.log(JSON.stringify({
    mode: confirmDelete ? "DELETE" : "DRY_RUN",
    willDelete: {
      clientGalleryRecords: beforeCounts.clientGalleries,
      galleryImageRecords: beforeCounts.galleryImages,
      gallerySelectionRecords: beforeCounts.gallerySelections,
      r2ObjectsUnderGalleriesPrefix: safeR2Keys.length,
      localGalleryFolders: beforeLocalFolders
    },
    galleries: galleries.map((gallery) => ({
      title: gallery.title,
      slug: gallery.slug,
      accessCode: gallery.accessCode,
      imageCount: gallery._count.images,
      selectionCount: gallery._count.selections
    })),
    safety: {
      r2Prefix: r2GalleryPrefix,
      r2Configured: isR2Configured(),
      unsafeR2KeysReturnedByPrefixQuery: unsafeR2Keys.length,
      localGalleryRoot: "public/images/galleries"
    }
  }, null, 2));

  if (!confirmDelete) {
    console.log("Dry run only. Set CONFIRM_DELETE_ALL_CLIENT_GALLERIES=yes to delete current client galleries.");
    return;
  }

  if (unsafeR2Keys.length) {
    throw new Error("R2 prefix query returned keys outside galleries/. Refusing to delete.");
  }

  const [deletedSelections, deletedImages, deletedGalleries] = await prisma.$transaction([
    prisma.gallerySelection.deleteMany({}),
    prisma.galleryImage.deleteMany({}),
    prisma.clientGallery.deleteMany({})
  ]);

  const deletedR2Objects = await deleteR2Objects(safeR2Keys);
  recreateLocalGalleryRoot();

  const afterCounts = await counts();
  const remainingR2Keys = isR2Configured() ? await listR2ObjectsByPrefix(r2GalleryPrefix) : [];
  const afterLocalFolders = localGalleryFolders();

  console.log(JSON.stringify({
    deleted: {
      clientGalleryRecords: deletedGalleries.count,
      galleryImageRecords: deletedImages.count,
      gallerySelectionRecords: deletedSelections.count,
      r2ObjectsUnderGalleriesPrefix: deletedR2Objects,
      localGalleryRootCleared: true
    },
    final: {
      clientGalleryRecords: afterCounts.clientGalleries,
      galleryImageRecords: afterCounts.galleryImages,
      gallerySelectionRecords: afterCounts.gallerySelections,
      r2ObjectsRemainingUnderGalleriesPrefix: remainingR2Keys.length,
      localGalleryRoot: "public/images/galleries",
      localGalleryFolders: afterLocalFolders,
      localGalleryRootExists: existsSync(localGalleryRoot)
    }
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
