-- DropForeignKey
ALTER TABLE "public"."AthleteProfile" DROP CONSTRAINT "AthleteProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CoachProfile" DROP CONSTRAINT "CoachProfile_userId_fkey";

-- AddForeignKey
ALTER TABLE "CoachProfile" ADD CONSTRAINT "CoachProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AthleteProfile" ADD CONSTRAINT "AthleteProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
