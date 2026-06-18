import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { prisma } from "../config/prisma.js";

const router = Router();

router.post("/push-token", authenticate, async (req, res) => {
    const { token } = req.body;

    await prisma.user.update({
        where: { id: req.user!.dbUserId },
        data: { pushToken: token },
    });

    res.json({ success: true });
});

export default router;