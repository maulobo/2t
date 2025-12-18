-- DropForeignKey
ALTER TABLE "public"."AthleteProfile" DROP CONSTRAINT "AthleteProfile_coachId_fkey";

-- AlterTable
ALTER TABLE "AthleteProfile" ALTER COLUMN "coachId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "AthleteProfile" ADD CONSTRAINT "AthleteProfile_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
