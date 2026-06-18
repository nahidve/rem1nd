import { api } from "./axios";
import { scheduleReminderNotification } from "../utils/notifications";

export type Reminder = {
  id: string;
  title: string;
  amount?: number;
  category: string;
  dueDate: string;
  repeatType: "ONCE" | "MONTHLY" | "YEARLY";
  isActive: boolean;
};

export async function getReminders(): Promise<Reminder[]> {
  const res = await api.get("/reminders");
  return res.data.data;
}

export async function createReminder(data: {
  title: string;
  amount?: number;
  category: string;
  dueDate: string;
  repeatType: "ONCE" | "MONTHLY" | "YEARLY";
}) {
  const res = await api.post("/reminders", data);

  const reminder = res.data.data;

  // schedule notification locally
  await scheduleReminderNotification(
    reminder.title,
    new Date(reminder.dueDate),
  );

  return reminder;
}
