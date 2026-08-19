-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN "source" TEXT;
ALTER TABLE "BlogPost" ADD COLUMN "sourceUrl" TEXT;

-- CreateTable
CREATE TABLE "CurationSeen" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "CurationSeen_sourceUrl_key" ON "CurationSeen"("sourceUrl");
