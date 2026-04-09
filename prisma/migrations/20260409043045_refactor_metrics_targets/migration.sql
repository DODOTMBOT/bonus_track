/*
  Warnings:

  - You are about to drop the column `isMaxGoal` on the `BonusArticle` table. All the data in the column will be lost.
  - You are about to drop the column `isStrict` on the `BonusArticle` table. All the data in the column will be lost.
  - You are about to drop the column `minValue` on the `BonusArticle` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `BonusArticle` table. All the data in the column will be lost.
  - You are about to drop the column `targetValue` on the `BonusArticle` table. All the data in the column will be lost.
  - You are about to drop the column `valueFormat` on the `BonusArticle` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `MetricTarget` table. All the data in the column will be lost.
  - Added the required column `metricId` to the `BonusArticle` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BonusArticle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "weight" REAL DEFAULT 0,
    "blockId" INTEGER NOT NULL,
    "metricId" INTEGER NOT NULL,
    CONSTRAINT "BonusArticle_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "BonusBlock" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BonusArticle_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "Metric" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BonusArticle" ("blockId", "id", "weight") SELECT "blockId", "id", "weight" FROM "BonusArticle";
DROP TABLE "BonusArticle";
ALTER TABLE "new_BonusArticle" RENAME TO "BonusArticle";
CREATE TABLE "new_MetricTarget" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "restaurantId" INTEGER NOT NULL,
    "metricId" INTEGER NOT NULL,
    "valueFormat" TEXT DEFAULT 'decimal',
    "targetValue" TEXT,
    "minValue" TEXT,
    "isStrict" BOOLEAN NOT NULL DEFAULT false,
    "isMaxGoal" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "MetricTarget_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MetricTarget_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "Metric" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MetricTarget" ("id", "metricId", "restaurantId") SELECT "id", "metricId", "restaurantId" FROM "MetricTarget";
DROP TABLE "MetricTarget";
ALTER TABLE "new_MetricTarget" RENAME TO "MetricTarget";
CREATE UNIQUE INDEX "MetricTarget_restaurantId_metricId_key" ON "MetricTarget"("restaurantId", "metricId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
