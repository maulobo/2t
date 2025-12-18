/*
  Warnings:

  - You are about to drop the column `activityType` on the `AthleteActivity` table. All the data in the column will be lost.
  - You are about to drop the column `activityType` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerUnit` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the `WOD` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WODAssignment` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[athleteId,activityId,startDate]` on the table `AthleteActivity` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `activityId` to the `AthleteActivity` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."WOD" DROP CONSTRAINT "WOD_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."WODAssignment" DROP CONSTRAINT "WODAssignment_athleteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WODAssignment" DROP CONSTRAINT "WODAssignment_wodId_fkey";

-- DropIndex
DROP INDEX "public"."AthleteActivity_activityType_idx";

-- DropIndex
DROP INDEX "public"."AthleteActivity_athleteId_activityType_startDate_key";

-- DropIndex
DROP INDEX "public"."Payment_activityType_idx";

-- AlterTable
ALTER TABLE "AthleteActivity" DROP COLUMN "activityType",
ADD COLUMN     "activityId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "activityType",
DROP COLUMN "pricePerUnit",
DROP COLUMN "quantity",
ADD COLUMN     "activityId" TEXT;

-- DropTable
DROP TABLE "public"."WOD";

-- DropTable
DROP TABLE "public"."WODAssignment";

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "color" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Training" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "track" TEXT,
    "videoUrl" TEXT,
    "activityId" TEXT,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Training_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingAssignment" (
    "id" TEXT NOT NULL,
    "trainingId" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,

    CONSTRAINT "TrainingAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Activity_name_key" ON "Activity"("name");

-- CreateIndex
CREATE INDEX "Training_date_idx" ON "Training"("date");

-- CreateIndex
CREATE INDEX "Training_activityId_idx" ON "Training"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingAssignment_trainingId_athleteId_key" ON "TrainingAssignment"("trainingId", "athleteId");

-- CreateIndex
CREATE INDEX "AthleteActivity_activityId_idx" ON "AthleteActivity"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "AthleteActivity_athleteId_activityId_startDate_key" ON "AthleteActivity"("athleteId", "activityId", "startDate");

-- CreateIndex
CREATE INDEX "Payment_activityId_idx" ON "Payment"("activityId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Training" ADD CONSTRAINT "Training_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Training" ADD CONSTRAINT "Training_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingAssignment" ADD CONSTRAINT "TrainingAssignment_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "Training"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingAssignment" ADD CONSTRAINT "TrainingAssignment_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "AthleteProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AthleteActivity" ADD CONSTRAINT "AthleteActivity_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
