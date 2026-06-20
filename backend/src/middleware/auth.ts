import { Request, Response, NextFunction } from "express";
import { getAuth } from "firebase-admin/auth";
import { findOrCreateUser } from "../services/user.service.js";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const token = header.split(" ")[1];

    const decoded = await getAuth().verifyIdToken(token);

    const user = await findOrCreateUser(
      decoded.uid,
      decoded.email,
      decoded.name,
    );

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
      dbUserId: user.id,
      homeCurrency: (user as any).homeCurrency,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
}
