import { BillingType } from "@prisma/client";
import { z } from "zod";

export const createSubscriptionSchema = z.object({
  name: z.string().min(1).max(100),
  amount: z.number().positive(),
  currency: z.enum(["INR", "USD", "EUR", "GBP"]).default("INR"),
  category: z.string().default("Other"),
  billingType: z.nativeEnum(BillingType),
  renewalDate: z.string().datetime(),
  autoPay: z.boolean().default(false),
});

export const updateSubscriptionSchema =
  createSubscriptionSchema.partial();

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  sharePercentage: z.number().min(0).max(100),
});

export const updateMemberSchema = z.object({
  status: z.enum(["PENDING", "ACCEPTED", "DECLINED"]).optional(),
  sharePercentage: z.number().min(0).max(100).optional(),
});

export const togglePaySchema = z.object({
  paid: z.boolean(),
});