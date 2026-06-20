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

export default router;