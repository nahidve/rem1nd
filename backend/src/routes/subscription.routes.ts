import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { prisma } from "../config/prisma.js";
import { ApiResponse } from "../utils/api-response.js";
import { validate } from "../middleware/validate.js";
import {
    createSubscriptionSchema,
    updateSubscriptionSchema,
} from "../validators/subscription.validator.js";
import { rollUserSubscriptions } from "../utils/subscription-rolling.js";

const router = Router();

router.get("/", authenticate, async (req, res) => {
    const userId = req.user!.dbUserId;

    await rollUserSubscriptions(userId!);

    const data = await prisma.subscription.findMany({
        where: { userId },
        orderBy: { renewalDate: "asc" },
    });

    return ApiResponse.success(res, data);
});

router.get("/:id", authenticate, async (req, res) => {
    const userId = req.user!.dbUserId;
    const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

    await rollUserSubscriptions(userId!);

    const sub = await prisma.subscription.findFirst({
        where: { id, userId },
    });

    if (!sub) {
        return ApiResponse.error(
            res,
            "Subscription not found",
            404
        );
    }

    return ApiResponse.success(res, sub);
});

router.post("/", authenticate, validate({ body: createSubscriptionSchema }), async (req, res) => {
    const userId = req.user!.dbUserId;

    const { name, amount, billingType, renewalDate, autoPay, currency, category } = req.body;

    const sub = await prisma.subscription.create({
        data: {
            name,
            amount,
            currency,
            category,
            billingType,
            renewalDate: new Date(renewalDate),
            autoPay,
            user: {
                connect: { id: userId },
            },
        } as any,
    });

    return ApiResponse.success(
        res,
        sub,
        "Subscription created",
        201
    );
});

router.put("/:id", authenticate, validate({ body: updateSubscriptionSchema }), async (req, res) => {
    const userId = req.user!.dbUserId;
    const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

    const existing = await prisma.subscription.findFirst({
        where: { id, userId },
    });

    if (!existing) {
        return ApiResponse.error(
            res,
            "Subscription not found",
            404
        );
    }

    const updated = await prisma.subscription.update({
        where: { id },
        data: {
            ...req.body,
            renewalDate: req.body.renewalDate
                ? new Date(req.body.renewalDate)
                : undefined,
        },
    });

    return ApiResponse.success(
        res,
        updated,
        "Subscription updated",
        200
    );
});

router.delete("/:id", authenticate, async (req, res) => {
    const userId = req.user!.dbUserId;
    const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

    const existing = await prisma.subscription.findFirst({
        where: { id, userId },
    });

    if (!existing) {
        return ApiResponse.error(
            res,
            "Subscription not found",
            404
        );
    }

    await prisma.subscription.delete({ where: { id } });

    return ApiResponse.success(
        res,
        null,
        "Subscription deleted",
        200
    );
});

export default router;