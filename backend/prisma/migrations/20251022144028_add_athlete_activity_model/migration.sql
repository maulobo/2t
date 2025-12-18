-- CreateTable
CREATE TABLE "AthleteActivity" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AthleteActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AthleteActivity_athleteId_isActive_idx" ON "AthleteActivity"("athleteId", "isActive");

-- CreateIndex
CREATE INDEX "AthleteActivity_activityType_idx" ON "AthleteActivity"("activityType");

-- CreateIndex
CREATE UNIQUE INDEX "AthleteActivity_athleteId_activityType_startDate_key" ON "AthleteActivity"("athleteId", "activityType", "startDate");

-- AddForeignKey
ALTER TABLE "AthleteActivity" ADD CONSTRAINT "AthleteActivity_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "AthleteProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
