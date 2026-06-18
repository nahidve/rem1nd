import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

export class SubscriptionRepository {
  async create(data: Prisma.SubscriptionCreateInput) {
    return prisma.subscription.create({
      data,
    });
  }

  async findAllByUser(userId: string) {
    return prisma.subscription.findMany({
      where: {
        userId,
      },
      orderBy: {
        renewalDate: "asc",
      },
    });
  }

  async findById(id: string, userId: string) {
    return prisma.subscription.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  async update(
    id: string,
    userId: string,
    data: Prisma.SubscriptionUpdateInput,
  ) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!subscription) {
      throw new AppError("Subscription not found", 404);
    }

    return prisma.subscription.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string, userId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!subscription) {
      throw new AppError("Subscription not found", 404);
    }

    return prisma.subscription.delete({
      where: {
        id,
      },
    });
  }
}
