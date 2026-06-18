import { RepeatType } from "@prisma/client";
import { ReminderRepository } from "../repositories/reminder.repository.js";

const repository = new ReminderRepository();

export class ReminderService {
  async createReminder(
    userId: string,
    title: string,
    amount: number | null,
    category: string,
    dueDate: Date,
    repeatType: RepeatType,
  ) {
    return repository.create({
      title,
      amount,
      category,
      dueDate,
      repeatType,
      user: {
        connect: {
          id: userId,
        },
      },
    });
  }

  async getUserReminders(userId: string) {
    return repository.findAllByUser(userId);
  }

  async getReminder(id: string, userId: string) {
    return repository.findById(id, userId);
  }

  async updateReminder(id: string, userId: string, data: any) {
    return repository.update(id, userId, data);
  }

  async deleteReminder(id: string, userId: string) {
    return repository.delete(id, userId);
  }
}
