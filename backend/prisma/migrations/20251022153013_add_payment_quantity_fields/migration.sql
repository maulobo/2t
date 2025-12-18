-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "activityType" TEXT,
ADD COLUMN     "pricePerUnit" INTEGER,
ADD COLUMN     "quantity" INTEGER DEFAULT 1;

-- CreateIndex
CREATE INDEX "Payment_activityType_idx" ON "Payment"("activityType");
