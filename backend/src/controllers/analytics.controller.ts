import { Request, Response } from "express";
import { AnalyticsService } from "../services/analytics.service.js";
import { ApiResponse } from "../utils/api-response.js";

const service = new AnalyticsService();

export class AnalyticsController {
  async dashboard(req: Request, res: Response) {
    const data = await service.getDashboard(req.user!.dbUserId!);

    return ApiResponse.success(res, data);
  }
}