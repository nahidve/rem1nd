import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { ApiResponse } from "../utils/api-response.js";

const router = Router();

router.get("/me", authenticate, async (req, res) => {
  return ApiResponse.success(res, req.user);
});

export default router;