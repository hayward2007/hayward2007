-- AlterTable
ALTER TABLE "Activity" ADD COLUMN "aiSummary" TEXT;
ALTER TABLE "Activity" ADD COLUMN "rawContent" TEXT;

-- AlterTable
ALTER TABLE "Competition" ADD COLUMN "aiSummary" TEXT;
ALTER TABLE "Competition" ADD COLUMN "rawContent" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "aiSummary" TEXT;
ALTER TABLE "Project" ADD COLUMN "rawContent" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BlogPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT,
    "sourceUrl" TEXT,
    "field" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_BlogPost" ("body", "createdAt", "id", "published", "slug", "source", "sourceUrl", "title", "updatedAt") SELECT "body", "createdAt", "id", "published", "slug", "source", "sourceUrl", "title", "updatedAt" FROM "BlogPost";
DROP TABLE "BlogPost";
ALTER TABLE "new_BlogPost" RENAME TO "BlogPost";
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
