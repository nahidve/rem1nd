import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { prisma } from "../config/prisma.js";
import { ApiResponse } from "../utils/api-response.js";

const router = Router();

router.post("/push-token", authenticate, async (req, res) => {
    const { token } = req.body;
    const dbUserId = req.user!.dbUserId;

    try {
        if (token) {
            // Remove the token from any other users to avoid unique constraint violations
            await prisma.user.updateMany({
                where: { 
                    pushToken: token,
                    id: { not: dbUserId }
                },
                data: { pushToken: null },
            });

            await prisma.user.update({
                where: { id: dbUserId },
                data: { pushToken: token },
            });
        }

        return ApiResponse.success(res, null, "Push token saved");
    } catch (err: any) {
        console.error("Error saving push token:", err);
        return ApiResponse.error(res, "Failed to save push token", 500);
    }
});

router.put("/currency", authenticate, async (req, res) => {
    const { currency } = req.body;

    if (!["INR", "USD", "EUR", "GBP"].includes(currency)) {
        return ApiResponse.error(res, "Invalid currency", 400);
    }

    await prisma.user.update({
        where: {
            id: req.user!.dbUserId,
        },
        data: {
            homeCurrency: currency,
        } as any,
    });

    return ApiResponse.success(res, null, "Preferred currency updated successfully");
});

export default router;