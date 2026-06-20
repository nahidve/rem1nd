import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { prisma } from "../config/prisma.js";
import { ApiResponse } from "../utils/api-response.js";
import { rollUserSubscriptions } from "../utils/subscription-rolling.js";

const router = Router();

const EXCHANGE_RATES: Record<string, number> = {
  INR: 1,
  USD: 83.5,
  EUR: 89.8,
  GBP: 105.7,
};

function convertCurrency(amount: number, from: string, to: string): number {
  const fromRate = EXCHANGE_RATES[from] || 1;
  const toRate = EXCHANGE_RATES[to] || 1;
  return (amount * fromRate) / toRate;
}

router.get("/dashboard", authenticate, async (req, res) => {
  const userId = req.user!.dbUserId;

  // Auto-roll overdue subscriptions
  await rollUserSubscriptions(userId!);

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { homeCurrency: true } as any,
  });
  const homeCurrency = (dbUser as any)?.homeCurrency || "INR";

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
    const amountInHome = convertCurrency(Number(sub.amount), (sub as any).currency || "INR", homeCurrency);

    if (sub.billingType === "YEARLY") {
      return sum + amountInHome / 12;
    }

    return sum + amountInHome;
  }, 0);

  const yearlySpendEstimate = totalMonthlySpend * 12;

  // Calculate category breakdown
  const categoryBreakdown: Record<string, number> = {};
  subscriptions.forEach((sub) => {
    const amountInHome = convertCurrency(Number(sub.amount), (sub as any).currency || "INR", homeCurrency);
    const monthlyAmount = sub.billingType === "YEARLY" ? amountInHome / 12 : amountInHome;
    const cat = (sub as any).category || "Other";
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + monthlyAmount;
  });

  // Calculate highest subscription converting to homeCurrency for comparison
  let highestSubscription = null;
  let highestAmountInHome = 0;

  for (const sub of subscriptions) {
    const amountInHome = convertCurrency(Number(sub.amount), (sub as any).currency || "INR", homeCurrency);
    if (amountInHome > highestAmountInHome) {
      highestAmountInHome = amountInHome;
      highestSubscription = sub;
    }
  }

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
    categoryBreakdown,
    homeCurrency,
  });
});

export default router;