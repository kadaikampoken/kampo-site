-- CreateEnum
CREATE TYPE "DonorDisclosure" AS ENUM ('REAL_NAME', 'CUSTOM_NAME', 'ANONYMOUS');

-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('REPORTED', 'CONFIRMED', 'VOID');

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "publishAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "acceptingSupport" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "fundUsage" TEXT,
ADD COLUMN     "publishAt" TIMESTAMP(3),
ADD COLUMN     "purpose" TEXT,
ALTER COLUMN "goalAmount" DROP NOT NULL,
ALTER COLUMN "startDate" DROP NOT NULL,
ALTER COLUMN "endDate" DROP NOT NULL;

-- CreateTable
CREATE TABLE "bank_account" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "bankName" TEXT NOT NULL,
    "branchName" TEXT NOT NULL,
    "branchCode" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountHolder" TEXT NOT NULL,
    "accountHolderKana" TEXT,
    "note" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "transferName" TEXT NOT NULL,
    "transferDate" TIMESTAMP(3) NOT NULL,
    "disclosure" "DonorDisclosure" NOT NULL DEFAULT 'ANONYMOUS',
    "displayName" TEXT,
    "note" TEXT,
    "status" "DonationStatus" NOT NULL DEFAULT 'REPORTED',
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "adminMemo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_summaries" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "projectId" TEXT,
    "projectKey" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL DEFAULT 0,
    "donationCount" INTEGER NOT NULL DEFAULT 0,
    "uniqueSupporterCount" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "confirmedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "donations_status_transferDate_idx" ON "donations"("status", "transferDate");

-- CreateIndex
CREATE INDEX "donations_projectId_status_idx" ON "donations"("projectId", "status");

-- CreateIndex
CREATE INDEX "monthly_summaries_year_month_idx" ON "monthly_summaries"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_summaries_year_month_projectKey_key" ON "monthly_summaries"("year", "month", "projectKey");

-- CreateIndex
CREATE INDEX "events_published_publishAt_idx" ON "events"("published", "publishAt");

-- CreateIndex
CREATE INDEX "projects_status_publishAt_idx" ON "projects"("status", "publishAt");

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_summaries" ADD CONSTRAINT "monthly_summaries_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
