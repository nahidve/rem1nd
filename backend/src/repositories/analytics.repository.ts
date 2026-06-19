import { prisma } from "../config/prisma.js";

export class AnalyticsRepository {
  async getDashboard(userId: string) {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId,
      },
      orderBy: {
        amount: "desc",
      },
    });

    const reminders = await prisma.reminder.findMany({
      where: {
        userId,
        dueDate: {
          gte: new Date(),
        },
      },
      orderBy: {
        dueDate: "asc",
      },
      take: 5,
    });

    return {
      subscriptions,
      reminders,
    };
  }
}
