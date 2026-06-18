import * as Notifications from "expo-notifications";

export async function scheduleReminderNotification(title: string, date: Date) {
  const now = Date.now();
  const triggerTime = date.getTime();

  const seconds = Math.floor((triggerTime - now) / 1000);

  // do not schedule past notifications
  if (seconds <= 0) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Reminder",
      body: title,
    },
    trigger: {
      seconds,
    } as any,
  });
}
