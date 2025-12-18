-- AlterTable
ALTER TABLE "AthleteProfile" ADD COLUMN     "bloodType" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT DEFAULT 'Argentina',
ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "emergencyContactPhone" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "goals" TEXT,
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "injuries" TEXT,
ADD COLUMN     "medications" TEXT,
ADD COLUMN     "province" TEXT;

-- CreateTable
CREATE TABLE "AthleteMetric" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weight" DOUBLE PRECISION,
    "bodyFatPercent" DOUBLE PRECISION,
    "muscleMass" DOUBLE PRECISION,
    "bmi" DOUBLE PRECISION,
    "waist" DOUBLE PRECISION,
    "hip" DOUBLE PRECISION,
    "chest" DOUBLE PRECISION,
    "rightArm" DOUBLE PRECISION,
    "leftArm" DOUBLE PRECISION,
    "rightThigh" DOUBLE PRECISION,
    "leftThigh" DOUBLE PRECISION,
    "backSquat" DOUBLE PRECISION,
    "frontSquat" DOUBLE PRECISION,
    "deadlift" DOUBLE PRECISION,
    "benchPress" DOUBLE PRECISION,
    "shoulderPress" DOUBLE PRECISION,
    "cleanAndJerk" DOUBLE PRECISION,
    "snatch" DOUBLE PRECISION,
    "franTime" INTEGER,
    "murphTime" INTEGER,
    "cindyRounds" INTEGER,
    "graceTime" INTEGER,
    "helenTime" INTEGER,
    "maxPullUps" INTEGER,
    "maxPushUps" INTEGER,
    "plankTime" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AthleteMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AthleteMetric_athleteId_date_idx" ON "AthleteMetric"("athleteId", "date");

-- CreateIndex
CREATE INDEX "AthleteMetric_date_idx" ON "AthleteMetric"("date");

-- AddForeignKey
ALTER TABLE "AthleteMetric" ADD CONSTRAINT "AthleteMetric_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "AthleteProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
