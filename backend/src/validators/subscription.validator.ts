import { BillingType } from "@prisma/client";
import { z } from "zod";

export const createSubscriptionSchema = z.object({
  name: z.string().min(1).max(100),

  amount: z.number().positive(),

  billingType: z.nativeEnum(BillingType),
  renewalDate: z.iso.datetime(),

  autoPay: z.boolean().default(false),
});

export const updateSubscriptionSchema = createSubscriptionSchema.partial();
