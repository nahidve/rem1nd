import { Request, Response } from "express";
import { ReminderService } from "../services/reminder.service.js";
import {
  createReminderSchema,
  updateReminderSchema,
} from "../validators/reminder.validator.js";

const service = new ReminderService();

export class ReminderController {
  async create(req: Request, res: Response): Promise<void> {
    const parsed = createReminderSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        errors: parsed.error.flatten(),
      });

      return;
    }

    const reminder = await service.createReminder(
      req.user!.dbUserId!,
      parsed.data.title,
      parsed.data.amount ?? null,
      parsed.data.category,
      new Date(parsed.data.dueDate),
      parsed.data.repeatType,
    );

    res.status(201).json({
      success: true,
      data: reminder,
    });
  }

  async getAll(req: Request, res: Response): Promise<void> {
    const reminders = await service.getUserReminders(req.user!.dbUserId!);

    res.status(200).json({
      success: true,
      data: reminders,
    });
  }

  async getOne(req: Request, res: Response): Promise<void> {
    const reminder = await service.getReminder(
      String(req.params.id),
      req.user!.dbUserId!,
    );

    if (!reminder) {
      res.status(404).json({
        success: false,
        message: "Reminder not found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: reminder,
    });
  }

  async update(req: Request, res: Response): Promise<void> {
    const parsed = updateReminderSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        errors: parsed.error.flatten(),
      });

      return;
    }

    const reminder = await service.updateReminder(
      String(req.params.id),
      req.user!.dbUserId!,
      parsed.data,
    );

    res.status(200).json({
      success: true,
      data: reminder,
    });
  }

  async delete(req: Request, res: Response): Promise<void> {
    await service.deleteReminder(String(req.params.id), req.user!.dbUserId!);

    res.status(200).json({
      success: true,
      message: "Reminder deleted",
    });
  }
}
