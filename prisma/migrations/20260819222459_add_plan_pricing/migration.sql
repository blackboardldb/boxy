-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "saasPlanPrice" INTEGER;

-- AlterTable
ALTER TABLE "plans" ADD COLUMN     "priceMonthly" INTEGER NOT NULL DEFAULT 0;
