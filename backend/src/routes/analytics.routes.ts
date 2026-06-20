import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { prisma } from "../config/prisma.js";
import { ApiResponse } from "../utils/api-response.js";

const router = Router();

router.get("/dashboard", authenticate, async (req, res) => {
  const userId = req.user!.dbUserId;

  const now = new Date();
  const next7Days = new Date();
  next7Days.setDate(now.getDate() + 7);

  const subscriptions = await prisma.subscription.findMany({
    where: { userId },
    orderBy: { renewalDate: "asc" },
  });

  const reminders = await prisma.reminder.findMany({
    where: {
      userId,
      isActive: true,
      dueDate: {
        gte: now,
        lte: next7Days,
      },
    },
    orderBy: { dueDate: "asc" },
  });

  const totalMonthlySpend = subscriptions.reduce((sum, sub) => {
    const amount = Number(sub.amount);

    if (sub.billingType === "YEARLY") {
      return sum + amount / 12;
    }

    return sum + amount;
  }, 0);

  const yearlySpendEstimate = totalMonthlySpend * 12;

  const highestSubscription =
    subscriptions.length > 0
      ? [...subscriptions].sort(
        (a, b) => Number(b.amount) - Number(a.amount)
      )[0]
      : null;

  const nextPayment =
    subscriptions.length > 0 ? subscriptions[0] : null;

  return ApiResponse.success(res, {
    totalMonthlySpend,
    yearlySpendEstimate,
    subscriptionCount: subscriptions.length,
    activeSubscriptionCount: subscriptions.length,
    upcomingReminders: reminders.length,
    highestSubscription,
    nextPayment,
    reminders,
  });
});

export default router;