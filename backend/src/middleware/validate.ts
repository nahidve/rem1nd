import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

import { ApiResponse } from "../utils/api-response.js";

type ValidationSchema = {
    body?: ZodSchema;
    params?: ZodSchema;
    query?: ZodSchema;
};

export const validate =
    (schema: ValidationSchema) =>
        (
            req: Request,
            res: Response,
            next: NextFunction
        ) => {
            try {
                if (schema.body) {
                    req.body = schema.body.parse(req.body);
                }

                if (schema.params) {
                    req.params = schema.params.parse(
                        req.params
                    ) as any;
                }

                if (schema.query) {
                    req.query = schema.query.parse(
                        req.query
                    ) as any;
                }

                next();
            } catch (error: any) {
                return ApiResponse.error(
                    res,
                    "Validation failed",
                    400,
                    error.errors
                );
            }
        };