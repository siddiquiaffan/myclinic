/*
  Warnings:

  - A unique constraint covering the columns `[dayOfWeek]` on the table `WorkingHour` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "WorkingHour_dayOfWeek_key" ON "WorkingHour"("dayOfWeek");
