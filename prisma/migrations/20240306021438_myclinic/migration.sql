/*
  Warnings:

  - You are about to drop the column `phone` on the `Appointment` table. All the data in the column will be lost.
  - Added the required column `email` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "phone",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "trackingId" SERIAL NOT NULL;
