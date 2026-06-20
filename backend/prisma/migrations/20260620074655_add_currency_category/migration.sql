-- AlterTable
ALTER TABLE "Reminder" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'INR';

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Other',
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'INR';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "homeCurrency" TEXT NOT NULL DEFAULT 'INR';
