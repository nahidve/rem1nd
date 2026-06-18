import { BillingType } from "@prisma/client";
import { SubscriptionRepository } from "../repositories/subscription.repository.js";

const repository = new SubscriptionRepository();

export class SubscriptionService {
  async createSubscription(
    userId: string,
    name: string,
    amount: number,
    billingType: BillingType,
    renewalDate: Date,
    autoPay: boolean,
  ) {
    return repository.create({
      name,
      amount,
      billingType,
      renewalDate,
      autoPay,
      user: {
        connect: {
          id: userId,
        },
      },
    });
  }

  async getUserSubscriptions(userId: string) {
    return repository.findAllByUser(userId);
  }

  async getSubscription(id: string, userId: string) {
    return repository.findById(id, userId);
  }

  async updateSubscription(id: string, userId: string, data: any) {
    return repository.update(id, userId, data);
  }

  async deleteSubscription(id: string, userId: string) {
    return repository.delete(id, userId);
  }
}
