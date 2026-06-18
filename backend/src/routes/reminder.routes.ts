import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { ReminderController } from "../controllers/reminder.controller.js";

const router = Router();
const controller = new ReminderController();

router.use(authenticate);
router.post("/", controller.create);
router.get("/", controller.getAll);
router.get("/:id", controller.getOne);
router.patch("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;
