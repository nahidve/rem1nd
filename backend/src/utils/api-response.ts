import { Response } from "express";

export class ApiResponse<T> {
  constructor(
    public success: boolean,
    public data?: T,
    public message?: string,
  ) { }

  static success<T>(
    res: Response,
    data: T,
    message = "OK",
    statusCode = 200
  ) {
    return res.status(statusCode).json(
      new ApiResponse<T>(true, data, message)
    );
  }

  static error(
    res: Response,
    message = "Something went wrong",
    statusCode = 500,
    errors?: any
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }
}