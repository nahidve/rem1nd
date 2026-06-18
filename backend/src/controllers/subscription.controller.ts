import { Request, Response } from "express";

import { SubscriptionService } from "../services/subscription.service.js";

import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
} from "../validators/subscription.validator.js";

const service = new SubscriptionService();

export class SubscriptionController {
  async create(req: Request, res: Response) {
    const parsed = createSubscriptionSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.flatten(),
      });
    }

    const subscription = await service.createSubscription(
      req.user!.dbUserId!,
      parsed.data.name,
      parsed.data.amount,
      parsed.data.billingType,
      new Date(parsed.data.renewalDate),
      parsed.data.autoPay,
    );

    return res.status(201).json({
      success: true,
      data: subscription,
    });
  }

  async getAll(req: Request, res: Response) {
    const subscriptions = await service.getUserSubscriptions(
      req.user!.dbUserId!,
    );

    return res.status(200).json({
      success: true,
      data: subscriptions,
    });
  }

  async getOne(req: Request, res: Response) {
    const subscription = await service.getSubscription(
      String(req.params.id),
      req.user!.dbUserId!,
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: subscription,
    });
  }

  async update(req: Request, res: Response) {
    const parsed = updateSubscriptionSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.flatten(),
      });
    }

    const subscription = await service.updateSubscription(
      String(req.params.id),
      req.user!.dbUserId!,
      parsed.data,
    );

    return res.status(200).json({
      success: true,
      data: subscription,
    });
  }

  async delete(req: Request, res: Response) {
    await service.deleteSubscription(
      String(req.params.id),
      req.user!.dbUserId!,
    );

    return res.status(200).json({
      success: true,
      message: "Subscription deleted",
    });
  }
}
