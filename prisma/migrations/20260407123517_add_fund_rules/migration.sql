-- CreateTable
CREATE TABLE "BonusFundRule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "restaurantId" INTEGER NOT NULL,
    "condition" TEXT NOT NULL,
    "threshold" REAL NOT NULL,
    "percent" REAL NOT NULL,
    "baseValue" REAL NOT NULL,
    CONSTRAINT "BonusFundRule_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BonusBlock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "restaurantId" INTEGER NOT NULL,
    CONSTRAINT "BonusBlock_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BonusBlock" ("id", "name", "restaurantId") SELECT "id", "name", "restaurantId" FROM "BonusBlock";
DROP TABLE "BonusBlock";
ALTER TABLE "new_BonusBlock" RENAME TO "BonusBlock";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
