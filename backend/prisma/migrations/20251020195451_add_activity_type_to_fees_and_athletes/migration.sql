/*
  Warnings:

  - Added the required column `activityName` to the `FeeSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `activityType` to the `FeeSettings` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."FeeSettings_isActive_validFrom_idx";

-- AlterTable
ALTER TABLE "AthleteProfile" ADD COLUMN     "activityType" TEXT;

-- AlterTable: Agregar columnas con valores por defecto para registros existentes
ALTER TABLE "FeeSettings" ADD COLUMN "activityType" TEXT;
ALTER TABLE "FeeSettings" ADD COLUMN "activityName" TEXT;

-- Actualizar registros existentes con valores por defecto
UPDATE "FeeSettings" SET "activityType" = 'GENERAL', "activityName" = 'General' WHERE "activityType" IS NULL;

-- Hacer las columnas NOT NULL después de actualizar los registros existentes
ALTER TABLE "FeeSettings" ALTER COLUMN "activityType" SET NOT NULL;
ALTER TABLE "FeeSettings" ALTER COLUMN "activityName" SET NOT NULL;

-- CreateIndex
CREATE INDEX "FeeSettings_activityType_isActive_idx" ON "FeeSettings"("activityType", "isActive");
