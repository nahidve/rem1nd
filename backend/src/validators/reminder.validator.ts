import { RepeatType } from "@prisma/client";
import { z } from "zod";

export const createReminderSchema = z.object({
  title: z.string().min(1).max(100),
  amount: z.number().optional(),
  category: z.string().min(1),
  dueDate: z.string(),
  repeatType: z.nativeEnum(RepeatType),
});

export const updateReminderSchema = createReminderSchema.partial();
