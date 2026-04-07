-- AlterTable
ALTER TABLE "BonusBlock" ADD COLUMN "weight" REAL DEFAULT 0;

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN "activeFundRuleId" INTEGER;
