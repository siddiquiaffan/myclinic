/*
  Warnings:

  - The `trackingId` column on the `Appointment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "trackingId",
ADD COLUMN     "trackingId" SERIAL NOT NULL;
