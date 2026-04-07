-- CreateTable
CREATE TABLE "BonusBlock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "restaurantId" INTEGER NOT NULL,
    CONSTRAINT "BonusBlock_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BonusArticle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "blockId" INTEGER NOT NULL,
    CONSTRAINT "BonusArticle_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "BonusBlock" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
