-- CreateTable
CREATE TABLE "BonusActual" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "restaurantId" INTEGER NOT NULL,
    "articleId" INTEGER NOT NULL,
    "period" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "BonusActual_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BonusActual_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "BonusArticle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BonusActual_restaurantId_articleId_period_key" ON "BonusActual"("restaurantId", "articleId", "period");
