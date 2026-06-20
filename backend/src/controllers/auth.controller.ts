import { Request, Response } from "express";
import { ApiResponse } from "../utils/api-response.js";

export class AuthController {
  async me(req: Request, res: Response) {
    return ApiResponse.success(res, req.user);
  }
}