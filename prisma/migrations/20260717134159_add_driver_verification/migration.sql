-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "ktpNumber" TEXT,
ADD COLUMN     "licenseName" TEXT,
ADD COLUMN     "licenseNumber" TEXT,
ADD COLUMN     "verificationSubmittedAt" TIMESTAMP(3);
