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

router.get("/history", authenticate, async (req, res) => {
  const userId = req.user!.dbUserId;

  const history = await (prisma as any).paymentHistory.findMany({
    where: { userId },
    include: {
      subscription: {
        select: {
          name: true,
          category: true,
        },
      },
    },
    orderBy: { paymentDate: "desc" },
  });

  return ApiResponse.success(res, history);
});

router.get("/forecast", authenticate, async (req, res) => {
  const userId = req.user!.dbUserId;

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { homeCurrency: true } as any,
  });
  const homeCurrency = (dbUser as any)?.homeCurrency || "INR";

  const subscriptions = await prisma.subscription.findMany({
    where: { userId },
  });

  const reminders = await prisma.reminder.findMany({
    where: { userId, isActive: true },
  });

  const now = new Date();
  const days30 = new Date(now); days30.setDate(now.getDate() + 30);
  const days60 = new Date(now); days60.setDate(now.getDate() + 60);
  const days90 = new Date(now); days90.setDate(now.getDate() + 90);

  const forecastEvents: any[] = [];
  
  // 1. Project subscriptions
  subscriptions.forEach(sub => {
    let projectDate = new Date(sub.renewalDate);
    const amountInHome = convertCurrency(Number(sub.amount), (sub as any).currency || "INR", homeCurrency);

    while (projectDate.getTime() <= days90.getTime()) {
      if (projectDate.getTime() >= now.getTime()) {
        forecastEvents.push({
          type: "Subscription",
          name: sub.name,
          category: sub.category,
          amount: Number(sub.amount),
          amountInHome,
          currency: sub.currency,
          dueDate: new Date(projectDate),
        });
      }
      
      if (sub.billingType === "YEARLY") {
        projectDate.setFullYear(projectDate.getFullYear() + 1);
      } else {
        projectDate.setMonth(projectDate.getMonth() + 1);
      }
    }
  });

  // 2. Project reminders
  reminders.forEach(rem => {
    let projectDate = new Date(rem.dueDate);
    const amountInHome = convertCurrency(Number(rem.amount || 0), rem.currency || "INR", homeCurrency);

    if (rem.repeatType === "ONCE") {
      if (projectDate.getTime() >= now.getTime() && projectDate.getTime() <= days90.getTime()) {
        forecastEvents.push({
          type: "Reminder",
          name: rem.title,
          category: rem.category,
          amount: Number(rem.amount || 0),
          amountInHome,
          currency: rem.currency,
          dueDate: new Date(projectDate),
        });
      }
    } else {
      while (projectDate.getTime() <= days90.getTime()) {
        if (projectDate.getTime() >= now.getTime()) {
          forecastEvents.push({
            type: "Reminder",
            name: rem.title,
            category: rem.category,
            amount: Number(rem.amount || 0),
            amountInHome,
            currency: rem.currency,
            dueDate: new Date(projectDate),
          });
        }

        if (rem.repeatType === "YEARLY") {
          projectDate.setFullYear(projectDate.getFullYear() + 1);
        } else {
          projectDate.setMonth(projectDate.getMonth() + 1);
        }
      }
    }
  });

  forecastEvents.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  let total30 = 0;
  let total60 = 0;
  let total90 = 0;

  forecastEvents.forEach(e => {
    if (e.dueDate.getTime() <= days30.getTime()) {
      total30 += e.amountInHome;
    }
    if (e.dueDate.getTime() <= days60.getTime()) {
      total60 += e.amountInHome;
    }
    if (e.dueDate.getTime() <= days90.getTime()) {
      total90 += e.amountInHome;
    }
  });

  return ApiResponse.success(res, {
    homeCurrency,
    forecast: {
      days30: { total: total30, eventCount: forecastEvents.filter(e => e.dueDate.getTime() <= days30.getTime()).length },
      days60: { total: total60, eventCount: forecastEvents.filter(e => e.dueDate.getTime() <= days60.getTime()).length },
      days90: { total: total90, eventCount: forecastEvents.filter(e => e.dueDate.getTime() <= days90.getTime()).length },
    },
    upcomingEvents: forecastEvents,
  }, "Cash flow forecast generated");
});

export default router;