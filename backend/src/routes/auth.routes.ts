import { Router } from "express";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/me", authenticate, async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

export default router;
