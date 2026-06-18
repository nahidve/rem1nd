import { Router } from "express";
import authRoutes from "./auth.routes.js";
import reminderRoutes from "./reminder.routes.js";
import subscriptionRoutes from "./subscription.routes.js";
import userRoutes from "./user.routes.js";
import analyticsRoutes from "./analytics.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/reminders", reminderRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/users", userRoutes);
router.use("/analytics", analyticsRoutes);

export default router;
