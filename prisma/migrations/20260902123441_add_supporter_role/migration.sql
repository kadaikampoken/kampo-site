-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPPORTER';

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "createdById" TEXT;

-- CreateIndex
CREATE INDEX "events_createdById_idx" ON "events"("createdById");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
