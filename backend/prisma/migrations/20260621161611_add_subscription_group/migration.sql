-- CreateEnum
CREATE TYPE "GroupMemberStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateTable
CREATE TABLE "SubscriptionGroup" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionGroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "sharePercentage" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" "GroupMemberStatus" NOT NULL DEFAULT 'PENDING',
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionGroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionGroup_subscriptionId_key" ON "SubscriptionGroup"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionGroupMember_groupId_email_key" ON "SubscriptionGroupMember"("groupId", "email");

-- AddForeignKey
ALTER TABLE "SubscriptionGroup" ADD CONSTRAINT "SubscriptionGroup_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionGroupMember" ADD CONSTRAINT "SubscriptionGroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "SubscriptionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionGroupMember" ADD CONSTRAINT "SubscriptionGroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
