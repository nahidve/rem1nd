import { prisma } from "../config/prisma.js";

/**
 * Rolls all subscriptions of a user forward if their renewal dates are in the past.
 */
export async function rollUserSubscriptions(userId: string) {
  const now = new Date();

  // Find all active subscriptions for this user with renewalDate <= now
  const overdueSubscriptions = await prisma.subscription.findMany({
    where: {
      userId,
      renewalDate: { lte: now },
    },
  });

  for (const sub of overdueSubscriptions) {
    let nextRenewal = new Date(sub.renewalDate);

    // Fast-forward renewal date if it's way in the past to avoid hanging and db bloat
    if (sub.billingType === "MONTHLY") {
      const monthsDiff = (now.getFullYear() - nextRenewal.getFullYear()) * 12 + (now.getMonth() - nextRenewal.getMonth());
      if (monthsDiff > 12) {
        nextRenewal.setMonth(nextRenewal.getMonth() + (monthsDiff - 12));
      }
    } else if (sub.billingType === "YEARLY") {
      const yearsDiff = now.getFullYear() - nextRenewal.getFullYear();
      if (yearsDiff > 5) {
        nextRenewal.setFullYear(nextRenewal.getFullYear() + (yearsDiff - 5));
      }
    }

    // Iteratively roll forward until the renewal date is in the future
    while (nextRenewal <= now) {
      await (prisma as any).paymentHistory.create({
        data: {
          subscriptionId: sub.id,
          userId,
          amount: sub.amount,
          currency: (sub as any).currency || "INR",
          paymentDate: new Date(nextRenewal),
        } as any,
      });

      if (sub.billingType === "MONTHLY") {
        nextRenewal.setMonth(nextRenewal.getMonth() + 1);
      } else if (sub.billingType === "YEARLY") {
        nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
      } else {
        nextRenewal.setMonth(nextRenewal.getMonth() + 1);
      }
    }

    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        renewalDate: nextRenewal,
      },
    });
  }
}
