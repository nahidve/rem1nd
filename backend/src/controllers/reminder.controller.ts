import { Request, Response } from "express";
import { ReminderService } from "../services/reminder.service.js";
import {
  createReminderSchema,
  updateReminderSchema,
} from "../validators/reminder.validator.js";
import { ApiResponse } from "../utils/api-response.js";

const service = new ReminderService();

export class ReminderController {
  async create(req: Request, res: Response) {
    const parsed = createReminderSchema.safeParse(req.body);
    if (!parsed.success) {
      return ApiResponse.error(
        res,
        "Validation failed",
        400,
        parsed.error.flatten()
      );
    }
    const reminder = await service.createReminder(
      req.user!.dbUserId!,
      parsed.data.title,
      parsed.data.amount ?? null,
      parsed.data.category,
      new Date(parsed.data.dueDate),
      parsed.data.repeatType
    );
    return ApiResponse.success(
      res,
      reminder,
      "Reminder created",
      201
    );
  }

  async getAll(req: Request, res: Response) {
    const reminders = await service.getUserReminders(
      req.user!.dbUserId!
    );
    return ApiResponse.success(res, reminders);
  }

  async getOne(req: Request, res: Response) {
    const reminder = await service.getReminder(
      String(req.params.id),
      req.user!.dbUserId!
    );
    if (!reminder) {
      return ApiResponse.error(
        res,
        "Reminder not found",
        404
      );
    }
    return ApiResponse.success(res, reminder);
  }

  async update(req: Request, res: Response) {
    const parsed = updateReminderSchema.safeParse(req.body);
    if (!parsed.success) {
      return ApiResponse.error(
        res,
        "Validation failed",
        400,
        parsed.error.flatten()
      );
    }
    const reminder = await service.updateReminder(
      String(req.params.id),
      req.user!.dbUserId!,
      parsed.data
    );
    return ApiResponse.success(
      res,
      reminder,
      "Reminder updated"
    );
  }

  async delete(req: Request, res: Response) {
    await service.deleteReminder(
      String(req.params.id),
      req.user!.dbUserId!
    );
    return ApiResponse.success(
      res,
      null,
      "Reminder deleted"
    );
  }
}