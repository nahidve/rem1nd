import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { prisma } from "../config/prisma.js";
import { ApiResponse } from "../utils/api-response.js";

const router = Router();

router.post("/push-token", authenticate, async (req, res) => {
    const { token } = req.body;

    await prisma.user.update({
        where: {
            id: req.user!.dbUserId,
        },
        data: {
            pushToken: token,
        },
    });

    return ApiResponse.success(res, null, "Push token saved");
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