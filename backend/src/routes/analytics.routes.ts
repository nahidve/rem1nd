import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { prisma } from "../config/prisma.js";

const router = Router();

router.get("/dashboard", authenticate, async (req, res) => {
    const userId = req.user!.dbUserId;

    const now = new Date();
    const next7Days = new Date();
    next7Days.setDate(now.getDate() + 7);

    const subscriptions = await prisma.subscription.findMany({
        where: { userId },
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
    });

    const totalMonthlySpend = subscriptions.reduce((sum, s) => {
        return sum + Number(s.amount);
    }, 0);

    res.json({
        success: true,
        data: {
            totalMonthlySpend,
            subscriptionCount: subscriptions.length,
            upcomingReminders: reminders.length,
            reminders,
        },
    });
});

export default router;