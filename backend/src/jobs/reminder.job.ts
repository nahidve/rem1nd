import { prisma } from "../config/prisma.js";
import { sendPush } from "../services/push.service.js";

export async function processDueReminders() {
    const now = new Date();
    console.log(`[Job] Running check for due reminders at: ${now.toISOString()}`);

    try {
        const reminders = await prisma.reminder.findMany({
            where: {
                dueDate: { lte: now },
                isActive: true,
            },
            include: { user: true },
        });

        if (reminders.length > 0) {
            console.log(`[Job] Found ${reminders.length} due reminders to process.`);
        }

        for (const r of reminders) {
            console.log(`[Job] Processing reminder "${r.title}" (ID: ${r.id}) for user ${r.userId}`);
            
            if (r.user.pushToken) {
                console.log(`[Job] Sending push notification to token: ${r.user.pushToken}`);
                try {
                    await sendPush(
                        r.user.pushToken,
                        "Reminder Due",
                        r.title,
                    );
                    console.log(`[Job] Push sent successfully for reminder ${r.id}`);
                } catch (pushErr) {
                    console.error(`[Job] Error sending push for reminder ${r.id}:`, pushErr);
                }
            } else {
                console.warn(`[Job] No push token found for user ${r.userId}, skipping notification.`);
            }

            await prisma.reminder.update({
                where: { id: r.id },
                data: { isActive: false },
            });
            console.log(`[Job] Reminder ${r.id} marked as inactive.`);
        }
    } catch (err) {
        console.error("[Job] Error in processDueReminders background task:", err);
    }
}