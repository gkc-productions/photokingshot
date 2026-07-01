CREATE TABLE "BookingAvailabilityBlock" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "reason" TEXT,
    "isFullDay" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingAvailabilityBlock_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BookingAvailabilityBlock_date_idx" ON "BookingAvailabilityBlock"("date");
