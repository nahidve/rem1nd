import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { prisma } from "../config/prisma.js";
import { ApiResponse } from "../utils/api-response.js";
import { validate } from "../middleware/validate.js";
import {
    createSubscriptionSchema,
    updateSubscriptionSchema,
    inviteMemberSchema,
    updateMemberSchema,
    togglePaySchema,
} from "../validators/subscription.validator.js";
import { rollUserSubscriptions } from "../utils/subscription-rolling.js";
import { GroupMemberStatus } from "@prisma/client";

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

router.post("/:id/usages", authenticate, async (req, res) => {
    const userId = req.user!.dbUserId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const existing = await prisma.subscription.findFirst({
        where: { id, userId },
    });

    if (!existing) {
        return ApiResponse.error(res, "Subscription not found", 404);
    }

    const usage = await prisma.subscriptionUsage.create({
        data: {
            subscriptionId: id,
            usedAt: new Date(),
        },
    });

    return ApiResponse.success(res, usage, "Usage logged successfully", 201);
});

router.get("/:id/stats", authenticate, async (req, res) => {
    const userId = req.user!.dbUserId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const existing = await prisma.subscription.findFirst({
        where: { id, userId },
        include: {
            payments: true,
            usages: {
                orderBy: { usedAt: "desc" },
            },
        },
    });

    if (!existing) {
        return ApiResponse.error(res, "Subscription not found", 404);
    }

    const usageCount = existing.usages.length;
    const totalSpent = existing.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const activeAmount = Number(existing.amount);
    
    const costPerUse = usageCount > 0 
        ? (totalSpent > 0 ? totalSpent / usageCount : activeAmount / usageCount)
        : 0;

    return ApiResponse.success(res, {
        subscription: {
            id: existing.id,
            name: existing.name,
            amount: existing.amount,
            currency: existing.currency,
            billingType: existing.billingType,
        },
        usageCount,
        totalSpent: totalSpent > 0 ? totalSpent : activeAmount,
        costPerUse,
        lastUsed: existing.usages[0]?.usedAt || null,
        usages: existing.usages,
    }, "Subscription stats fetched");
});

// 1. Activate group splitting for a subscription
router.post("/:id/group", authenticate, async (req, res) => {
    const userId = req.user!.dbUserId;
    const subscriptionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Check if subscription exists and belongs to the user
    const sub = await prisma.subscription.findFirst({
        where: { id: subscriptionId, userId },
    });

    if (!sub) {
        return ApiResponse.error(res, "Subscription not found or not owned by you", 404);
    }

    // Check if a group already exists for this subscription
    const existingGroup = await prisma.subscriptionGroup.findUnique({
        where: { subscriptionId },
        include: { members: true },
    });

    if (existingGroup) {
        return ApiResponse.success(res, existingGroup, "Subscription group already activated", 200);
    }

    // Fetch user email to add them as the accepted creator/owner of the group
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user || !user.email) {
        return ApiResponse.error(res, "You must have a verified email address registered to activate sharing.", 400);
    }

    // Create group and add owner
    const group = await prisma.subscriptionGroup.create({
        data: {
            subscriptionId,
            members: {
                create: {
                    userId,
                    email: user.email,
                    sharePercentage: 100,
                    status: GroupMemberStatus.ACCEPTED,
                    paid: true,
                },
            },
        },
        include: {
            members: true,
        },
    });

    return ApiResponse.success(res, group, "Subscription sharing group created successfully", 201);
});

// 2. Invite a member by email and assign sharePercentage
router.post("/:id/group/members", authenticate, validate({ body: inviteMemberSchema }), async (req, res) => {
    const userId = req.user!.dbUserId;
    const subscriptionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { email, sharePercentage } = req.body;

    // Check if subscription belongs to user
    const sub = await prisma.subscription.findFirst({
        where: { id: subscriptionId, userId },
    });

    if (!sub) {
        return ApiResponse.error(res, "Subscription not found or not owned by you", 404);
    }

    const group = await prisma.subscriptionGroup.findUnique({
        where: { subscriptionId },
    });

    if (!group) {
        return ApiResponse.error(res, "Subscription group has not been activated", 400);
    }

    // Check if member already exists in the group
    const existingMember = await prisma.subscriptionGroupMember.findUnique({
        where: {
            groupId_email: {
                groupId: group.id,
                email,
            },
        },
    });

    if (existingMember) {
        return ApiResponse.error(res, "Member is already part of the subscription group", 400);
    }

    // Check if the invited email matches an existing user
    const registeredUser = await prisma.user.findUnique({
        where: { email },
    });

    // Create the group member with PENDING status
    const member = await prisma.subscriptionGroupMember.create({
        data: {
            groupId: group.id,
            userId: registeredUser ? registeredUser.id : null,
            email,
            sharePercentage,
            status: GroupMemberStatus.PENDING,
            paid: false,
        },
    });

    return ApiResponse.success(res, member, "Member invited to subscription group", 201);
});

// 3. Accept/decline invite OR update split percentages
router.put("/:id/group/members/:memberId", authenticate, validate({ body: updateMemberSchema }), async (req, res) => {
    const userId = req.user!.dbUserId;
    const subscriptionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const memberId = Array.isArray(req.params.memberId) ? req.params.memberId[0] : req.params.memberId;
    const { status, sharePercentage } = req.body;

    const sub = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
    });

    if (!sub) {
        return ApiResponse.error(res, "Subscription not found", 404);
    }

    const group = await prisma.subscriptionGroup.findUnique({
        where: { subscriptionId },
    });

    if (!group) {
        return ApiResponse.error(res, "Subscription group not found", 404);
    }

    const member = await prisma.subscriptionGroupMember.findUnique({
        where: { id: memberId, groupId: group.id },
    });

    if (!member) {
        return ApiResponse.error(res, "Group member not found", 404);
    }

    const currentUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    // Determine authorization and perform update
    const isOwner = sub.userId === userId;
    const isSelf = member.userId === userId || (currentUser?.email && member.email === currentUser.email);

    const updateData: any = {};

    if (status !== undefined) {
        if (!isSelf) {
            return ApiResponse.error(res, "Only the invited user can update their membership status", 403);
        }
        updateData.status = status;
        // If they accept and were not associated with userId (e.g. registered after invite), associate them now
        if (status === GroupMemberStatus.ACCEPTED && !member.userId) {
            updateData.userId = userId;
        }
    }

    if (sharePercentage !== undefined) {
        if (!isOwner) {
            return ApiResponse.error(res, "Only the subscription owner can update share percentages", 403);
        }
        updateData.sharePercentage = sharePercentage;
    }

    if (Object.keys(updateData).length === 0) {
        return ApiResponse.error(res, "No valid fields provided for update", 400);
    }

    const updatedMember = await prisma.subscriptionGroupMember.update({
        where: { id: memberId },
        data: updateData,
    });

    return ApiResponse.success(res, updatedMember, "Group member updated successfully");
});

// 4. Toggle whether a member has paid their split share for the current billing cycle
router.put("/:id/group/members/:memberId/pay", authenticate, validate({ body: togglePaySchema }), async (req, res) => {
    const userId = req.user!.dbUserId;
    const subscriptionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const memberId = Array.isArray(req.params.memberId) ? req.params.memberId[0] : req.params.memberId;
    const { paid } = req.body;

    const sub = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
    });

    if (!sub) {
        return ApiResponse.error(res, "Subscription not found", 404);
    }

    const group = await prisma.subscriptionGroup.findUnique({
        where: { subscriptionId },
    });

    if (!group) {
        return ApiResponse.error(res, "Subscription group not found", 404);
    }

    const member = await prisma.subscriptionGroupMember.findUnique({
        where: { id: memberId, groupId: group.id },
    });

    if (!member) {
        return ApiResponse.error(res, "Group member not found", 404);
    }

    const currentUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    const isOwner = sub.userId === userId;
    const isSelf = member.userId === userId || (currentUser?.email && member.email === currentUser.email);

    if (!isOwner && !isSelf) {
        return ApiResponse.error(res, "Unauthorized to update payment status for this member", 403);
    }

    const updatedMember = await prisma.subscriptionGroupMember.update({
        where: { id: memberId },
        data: { paid },
    });

    return ApiResponse.success(res, updatedMember, `Payment status updated to ${paid ? 'paid' : 'unpaid'}`);
});

// 5. Get details of the group split, membership statuses, and split amounts
router.get("/:id/group", authenticate, async (req, res) => {
    const userId = req.user!.dbUserId;
    const subscriptionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const sub = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
    });

    if (!sub) {
        return ApiResponse.error(res, "Subscription not found", 404);
    }

    const group: any = await prisma.subscriptionGroup.findUnique({
        where: { subscriptionId },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });

    if (!group) {
        return ApiResponse.error(res, "Subscription group not found", 404);
    }

    const currentUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    // Check if requester is a member of this group or the subscription owner
    const isOwner = sub.userId === userId;
    const isMember = group.members.some((m: any) => m.userId === userId || (currentUser?.email && m.email === currentUser.email));

    if (!isOwner && !isMember) {
        return ApiResponse.error(res, "Access denied. You are not a member of this subscription group.", 403);
    }

    // Calculate split amounts
    const totalAmount = Number(sub.amount);
    const membersWithSplit = group.members.map((m: any) => {
        const sharePercent = Number(m.sharePercentage);
        const splitAmount = (totalAmount * sharePercent) / 100;
        return {
            ...m,
            splitAmount: parseFloat(splitAmount.toFixed(2)),
        };
    });

    return ApiResponse.success(res, {
        id: group.id,
        subscriptionId: group.subscriptionId,
        subscriptionName: sub.name,
        totalAmount,
        currency: sub.currency,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
        members: membersWithSplit,
    }, "Group split details fetched successfully");
});

export default router;