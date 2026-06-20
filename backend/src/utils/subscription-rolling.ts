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

    // Iteratively roll forward until the renewal date is in the future
    while (nextRenewal <= now) {
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
