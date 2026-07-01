import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface AuthRequest extends Request {
  userId?: string;
}

const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("SOMETHING_WENT_WRONG");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET) as {
      _id: string;
    };
    req.userId = payload._id;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default requireAuth;
export type { AuthRequest };
