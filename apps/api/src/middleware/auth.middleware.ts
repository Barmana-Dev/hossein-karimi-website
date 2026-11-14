import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// اضافه کردن فیلد user به تایپ Request
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

// ۱. بررسی لاگین بودن کاربر
export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: "دسترسی غیرمجاز. لطفاً وارد شوید." },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { message: "نشست شما منقضی شده است. دوباره وارد شوید." },
    });
  }
};

// ۲. بررسی سطح دسترسی (نقش)
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, error: { message: "دسترسی غیرمجاز." } });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { message: "شما مجوز دسترسی به این بخش را ندارید." },
      });
    }

    next();
  };
};
