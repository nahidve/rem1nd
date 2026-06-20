import { Request, Response } from "express";

import { SubscriptionService } from "../services/subscription.service.js";

import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
} from "../validators/subscription.validator.js";

import { ApiResponse } from "../utils/api-response.js";

const service = new SubscriptionService();

export class SubscriptionController {
  async create(req: Request, res: Response) {
    const parsed = createSubscriptionSchema.safeParse(req.body);

    if (!parsed.success) {
      return ApiResponse.error(
        res,
        "Validation failed",
        400,
        parsed.error.flatten()
      );
    }

    const subscription = await service.createSubscription(
      req.user!.dbUserId!,
      parsed.data.name,
      parsed.data.amount,
      parsed.data.billingType,
      new Date(parsed.data.renewalDate),
      parsed.data.autoPay
    );

    return ApiResponse.success(
      res,
      subscription,
      "Subscription created",
      201
    );
  }

  async getAll(req: Request, res: Response) {
    const subscriptions =
      await service.getUserSubscriptions(
        req.user!.dbUserId!
      );

    return ApiResponse.success(
      res,
      subscriptions
    );
  }

  async getOne(req: Request, res: Response) {
    const subscription =
      await service.getSubscription(
        String(req.params.id),
        req.user!.dbUserId!
      );

    if (!subscription) {
      return ApiResponse.error(
        res,
        "Subscription not found",
        404
      );
    }

    return ApiResponse.success(
      res,
      subscription
    );
  }

  async update(req: Request, res: Response) {
    const parsed = updateSubscriptionSchema.safeParse(
      req.body
    );

    if (!parsed.success) {
      return ApiResponse.error(
        res,
        "Validation failed",
        400,
        parsed.error.flatten()
      );
    }

    const subscription =
      await service.updateSubscription(
        String(req.params.id),
        req.user!.dbUserId!,
        parsed.data
      );

    return ApiResponse.success(
      res,
      subscription,
      "Subscription updated"
    );
  }

  async delete(req: Request, res: Response) {
    await service.deleteSubscription(
      String(req.params.id),
      req.user!.dbUserId!
    );

    return ApiResponse.success(
      res,
      null,
      "Subscription deleted"
    );
  }
}