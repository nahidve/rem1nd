import { prisma } from "../config/prisma.js";
import { sendPush } from "../services/push.service.js";

export async function processDueReminders() {
    const now = new Date();

    const reminders = await prisma.reminder.findMany({
        where: {
            dueDate: { lte: now },
            isActive: true,
        },
        include: { user: true },
    });

    for (const r of reminders) {
        if (r.user.pushToken) {
            await sendPush(
                r.user.pushToken,
                "Reminder Due",
                r.title,
            );
        }

        await prisma.reminder.update({
            where: { id: r.id },
            data: { isActive: false },
        });
    }
}