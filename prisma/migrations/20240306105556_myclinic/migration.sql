-- AlterTable
ALTER TABLE "Appointment" ALTER COLUMN "trackingId" DROP DEFAULT,
ALTER COLUMN "trackingId" SET DATA TYPE TEXT;
DROP SEQUENCE "Appointment_trackingId_seq";
