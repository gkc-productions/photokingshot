ALTER TABLE "ClientGallery" ADD COLUMN "selectionMode" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ClientGallery" ADD COLUMN "maxSelections" INTEGER;
ALTER TABLE "ClientGallery" ADD COLUMN "selectionSubmittedAt" TIMESTAMP(3);
ALTER TABLE "ClientGallery" ADD COLUMN "selectionNotes" TEXT;

CREATE TABLE "GallerySelection" (
  "id" TEXT NOT NULL,
  "galleryId" TEXT NOT NULL,
  "imageId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GallerySelection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GallerySelection_galleryId_imageId_key" ON "GallerySelection"("galleryId", "imageId");
CREATE INDEX "GallerySelection_galleryId_createdAt_idx" ON "GallerySelection"("galleryId", "createdAt");
CREATE INDEX "GallerySelection_imageId_idx" ON "GallerySelection"("imageId");

ALTER TABLE "GallerySelection" ADD CONSTRAINT "GallerySelection_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "ClientGallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GallerySelection" ADD CONSTRAINT "GallerySelection_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "GalleryImage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
