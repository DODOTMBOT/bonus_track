-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BonusArticle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "valueFormat" TEXT,
    "targetValue" TEXT,
    "minValue" TEXT,
    "blockId" INTEGER NOT NULL,
    CONSTRAINT "BonusArticle_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "BonusBlock" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BonusArticle" ("blockId", "id", "minValue", "name", "targetValue") SELECT "blockId", "id", "minValue", "name", "targetValue" FROM "BonusArticle";
DROP TABLE "BonusArticle";
ALTER TABLE "new_BonusArticle" RENAME TO "BonusArticle";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
