import { Request, Response } from "express";
import { AnalyticsService } from "../services/analytics.service.js";

const service = new AnalyticsService();

export class AnalyticsController {
  async dashboard(req: Request, res: Response) {
    const data = await service.getDashboard(req.user!.dbUserId!);

    return res.status(200).json({
      success: true,
      data,
    });
  }
}
