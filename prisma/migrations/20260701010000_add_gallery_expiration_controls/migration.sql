ALTER TABLE "ClientGallery"
ADD COLUMN "expiresAt" TIMESTAMP(3),
ADD COLUMN "shareNote" TEXT,
ADD COLUMN "deliveryStatus" TEXT NOT NULL DEFAULT 'Draft';

CREATE INDEX "ClientGallery_expiresAt_idx" ON "ClientGallery"("expiresAt");
