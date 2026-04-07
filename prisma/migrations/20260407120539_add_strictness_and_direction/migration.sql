-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BonusArticle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "valueFormat" TEXT DEFAULT 'decimal',
    "targetValue" TEXT,
    "minValue" TEXT,
    "isStrict" BOOLEAN NOT NULL DEFAULT false,
    "isMaxGoal" BOOLEAN NOT NULL DEFAULT false,
    "blockId" INTEGER NOT NULL,
    CONSTRAINT "BonusArticle_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "BonusBlock" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BonusArticle" ("blockId", "id", "minValue", "name", "targetValue", "valueFormat") SELECT "blockId", "id", "minValue", "name", "targetValue", "valueFormat" FROM "BonusArticle";
DROP TABLE "BonusArticle";
ALTER TABLE "new_BonusArticle" RENAME TO "BonusArticle";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
