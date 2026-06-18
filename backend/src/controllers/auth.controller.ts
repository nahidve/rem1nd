import { Request, Response } from "express";

export class AuthController {
  async me(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  }
}
