-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "notionId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descKo" TEXT,
    "descEn" TEXT,
    "cover" TEXT,
    "icon" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "order" INTEGER NOT NULL DEFAULT 0,
    "notionUrl" TEXT,
    "editedTime" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Competition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "notionId" TEXT,
    "name" TEXT NOT NULL,
    "result" TEXT,
    "rank" TEXT,
    "rankLabel" TEXT,
    "host" TEXT NOT NULL DEFAULT '[]',
    "year" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 99,
    "notionUrl" TEXT,
    "editedTime" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProjectAward" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    CONSTRAINT "ProjectAward_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectAward_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "notionId" TEXT,
    "name" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "year" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "notionUrl" TEXT,
    "editedTime" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PortfolioBuild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "targetRole" TEXT,
    "targetOrg" TEXT,
    "intro" TEXT,
    "accent" TEXT NOT NULL DEFAULT 'teal',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PortfolioProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "portfolioId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "highlightNote" TEXT,
    CONSTRAINT "PortfolioProject_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "PortfolioBuild" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PortfolioProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SyncLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL DEFAULT 'notion',
    "status" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_notionId_key" ON "Project"("notionId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Competition_notionId_key" ON "Competition"("notionId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectAward_projectId_competitionId_key" ON "ProjectAward"("projectId", "competitionId");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_notionId_key" ON "Activity"("notionId");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioBuild_slug_key" ON "PortfolioBuild"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioProject_portfolioId_projectId_key" ON "PortfolioProject"("portfolioId", "projectId");
