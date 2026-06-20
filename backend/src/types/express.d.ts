import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        name?: string;
        dbUserId?: string;
        homeCurrency?: string;
      };
    }
  }
}

export {};
