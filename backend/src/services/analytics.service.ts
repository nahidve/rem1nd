import { AnalyticsRepository } from "../repositories/analytics.repository.js";

const repository = new AnalyticsRepository();

export class AnalyticsService {
  async getDashboard(userId: string) {
    const { subscriptions, reminders } = await repository.getDashboard(userId);

    const totalMonthlySpend = subscriptions.reduce((sum, sub) => {
      const amount = Number(sub.amount);

      return sub.billingType === "MONTHLY" ? sum + amount : sum + amount / 12;
    }, 0);

    const yearlySpendEstimate = totalMonthlySpend * 12;

    const highestSubscription =
      subscriptions.length > 0 ? subscriptions[0] : null;

    const nextPayment =
      subscriptions.sort(
        (a, b) =>
          new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime(),
      )[0] ?? null;

    return {
      totalMonthlySpend,
      yearlySpendEstimate,

      subscriptionCount: subscriptions.length,

      activeSubscriptionCount: subscriptions.length,

      upcomingReminders: reminders.length,

      highestSubscription,

      nextPayment,

      reminders,
    };
  }
}
