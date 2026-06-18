import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.string().optional(),
});

export const env = envSchema.parse(process.env);
