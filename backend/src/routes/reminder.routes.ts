import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { prisma } from "../config/prisma.js";
import { validate } from "../middleware/validate.js";
import { ApiResponse } from "../utils/api-response.js";
import {
    createReminderSchema,
    updateReminderSchema,
} from "../validators/reminder.validator.js";

const router = Router();

/**
 * GET ALL
 */
router.get("/", authenticate, async (req, res) => {
    const userId = req.user!.dbUserId;

    const reminders = await prisma.reminder.findMany({
        where: { userId },
        orderBy: { dueDate: "asc" },
    });

    return ApiResponse.success(res, reminders);
});

/**
 * GET BY ID
 */
router.get("/:id", authenticate, async (req, res) => {
    const userId = req.user!.dbUserId;
    const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

    const reminder = await prisma.reminder.findFirst({
        where: { id, userId },
    });

    if (!reminder) {
        return ApiResponse.error(
            res,
            "Reminder not found",
            404
        );
    }

    return ApiResponse.success(res, reminder);
});

/**
 * CREATE
 */
router.post("/", authenticate, validate({ body: createReminderSchema }), async (req, res) => {
    const userId = req.user!.dbUserId;
    const { title, amount, category, dueDate, repeatType, currency } = req.body;

    const reminder = await prisma.reminder.create({
        data: {
            title,
            amount,
            category,
            currency,
            dueDate: new Date(dueDate),
            repeatType,
            user: {
                connect: { id: userId },
            },
        } as any,
    });

    return ApiResponse.success(
        res,
        reminder,
        "Reminder created",
        201
    );
});

/**
 * UPDATE
 */
router.put("/:id", authenticate, validate({ body: createReminderSchema }), async (req, res) => {
    const userId = req.user!.dbUserId;
    const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

    const reminder = await prisma.reminder.findFirst({
        where: { id, userId },
    });

    if (!reminder) {
        return ApiResponse.error(
            res,
            "Reminder not found",
            404
        );
    }

    const updated = await prisma.reminder.update({
        where: { id },
        data: {
            ...req.body,
            dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
        },
    });

    return ApiResponse.success(
        res,
        updated,
        "Reminder updated",
        200
    );
});

/**
 * DELETE
 */
router.delete("/:id", authenticate, async (req, res) => {
    const userId = req.user!.dbUserId;
    const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

    const reminder = await prisma.reminder.findFirst({
        where: { id, userId },
    });

    if (!reminder) {
        return ApiResponse.error(
            res,
            "Reminder not found",
            404
        );
    }

    await prisma.reminder.delete({ where: { id } });

    return ApiResponse.success(
        res,
        null,
        "Reminder deleted",
        200
    );
});

export default router;