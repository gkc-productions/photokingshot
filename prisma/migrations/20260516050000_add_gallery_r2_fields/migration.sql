ALTER TABLE "GalleryImage" ADD COLUMN "originalKey" TEXT;
ALTER TABLE "GalleryImage" ADD COLUMN "thumbnailKey" TEXT;
ALTER TABLE "GalleryImage" ADD COLUMN "previewKey" TEXT;
ALTER TABLE "GalleryImage" ADD COLUMN "thumbnailUrl" TEXT;
ALTER TABLE "GalleryImage" ADD COLUMN "previewUrl" TEXT;
CREATE INDEX "GalleryImage_originalKey_idx" ON "GalleryImage"("originalKey");
