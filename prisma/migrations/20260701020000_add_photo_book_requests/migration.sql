CREATE TABLE "PhotoBookRequest" (
    "id" TEXT NOT NULL,
    "galleryId" TEXT,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "phone" TEXT,
    "packageType" TEXT NOT NULL,
    "photoCountRange" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'New',
    "amountCents" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "stripeCheckoutSessionId" TEXT,
    "stripeCheckoutUrl" TEXT,
    "stripePaymentIntentId" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'Unpaid',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhotoBookRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PhotoBookRequest_galleryId_idx" ON "PhotoBookRequest"("galleryId");
CREATE INDEX "PhotoBookRequest_paymentStatus_idx" ON "PhotoBookRequest"("paymentStatus");
CREATE INDEX "PhotoBookRequest_stripeCheckoutSessionId_idx" ON "PhotoBookRequest"("stripeCheckoutSessionId");
CREATE INDEX "PhotoBookRequest_stripePaymentIntentId_idx" ON "PhotoBookRequest"("stripePaymentIntentId");

ALTER TABLE "PhotoBookRequest" ADD CONSTRAINT "PhotoBookRequest_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "ClientGallery"("id") ON DELETE SET NULL ON UPDATE CASCADE;
