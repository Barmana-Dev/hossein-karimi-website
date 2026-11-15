import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

// ۱. بررسی لاگین بودن + فعال بودن کاربر
export const requireAuth = async (
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

    // 👇 چک کن کاربر هنوز وجود داره و فعاله
    const user = await prisma.adminUser.findUnique({
      where: { id: decoded.userId },
      select: { id: true, isActive: true, role: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: { message: "حساب شما غیرفعال شده است. دوباره وارد شوید." },
      });
    }

    // 👇 نقش رو از دیتابیس بخون (نه از توکن) تا تغییر نقش فوری اعمال بشه
    req.user = { userId: user.id, role: user.role };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { message: "نشست شما منقضی شده است. دوباره وارد شوید." },
    });
  }
};

// ۲. بررسی سطح دسترسی (نقش) — بدون تغییر
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
