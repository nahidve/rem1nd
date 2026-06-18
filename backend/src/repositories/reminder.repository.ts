import { Prisma, Reminder } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

export class ReminderRepository {
  async create(data: Prisma.ReminderCreateInput) {
    return prisma.reminder.create({
      data,
    });
  }

  async findAllByUser(userId: string) {
    return prisma.reminder.findMany({
      where: {
        userId,
      },
      orderBy: {
        dueDate: "asc",
      },
    });
  }

  async findById(id: string, userId: string) {
    return prisma.reminder.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  async update(id: string, userId: string, data: Prisma.ReminderUpdateInput) {
    const reminder = await prisma.reminder.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!reminder) {
      throw new AppError("Reminder not found", 404);
    }

    return prisma.reminder.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string, userId: string) {
    const reminder = await prisma.reminder.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!reminder) {
      throw new AppError("Reminder not found", 404);
    }

    return prisma.reminder.delete({
      where: {
        id,
      },
    });
  }
}
