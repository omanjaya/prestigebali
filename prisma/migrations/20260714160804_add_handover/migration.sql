-- CreateEnum
CREATE TYPE "HandoverPhase" AS ENUM ('OUT', 'IN');

-- CreateTable
CREATE TABLE "Handover" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "phase" "HandoverPhase" NOT NULL,
    "odometer" INTEGER NOT NULL,
    "fuelEighths" INTEGER NOT NULL DEFAULT 8,
    "exteriorClean" BOOLEAN NOT NULL DEFAULT true,
    "interiorClean" BOOLEAN NOT NULL DEFAULT true,
    "tiresOk" BOOLEAN NOT NULL DEFAULT true,
    "docStnk" BOOLEAN NOT NULL DEFAULT true,
    "spareTire" BOOLEAN NOT NULL DEFAULT true,
    "jack" BOOLEAN NOT NULL DEFAULT true,
    "toolkit" BOOLEAN NOT NULL DEFAULT true,
    "firstAidKit" BOOLEAN NOT NULL DEFAULT false,
    "accessories" TEXT[],
    "damageNotes" TEXT,
    "notes" TEXT,
    "staffName" TEXT,
    "signedByStaff" BOOLEAN NOT NULL DEFAULT false,
    "signedByCustomer" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Handover_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Handover_bookingId_phase_key" ON "Handover"("bookingId", "phase");

-- AddForeignKey
ALTER TABLE "Handover" ADD CONSTRAINT "Handover_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
