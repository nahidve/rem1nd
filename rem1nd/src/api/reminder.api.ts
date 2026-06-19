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

export async function getReminder(id: string) {
  const res = await api.get(`/reminders/${id}`);
  return res.data.data;
}

export async function updateReminder(
  id: string,
  data: Partial<{
    title: string;
    amount?: number;
    category: string;
    dueDate: string;
    repeatType: "ONCE" | "MONTHLY" | "YEARLY";
    isActive: boolean;
  }>,
) {
  const res = await api.patch(`/reminders/${id}`, data);
  return res.data.data;
}

export async function deleteReminder(id: string) {
  await api.delete(`/reminders/${id}`);
}
