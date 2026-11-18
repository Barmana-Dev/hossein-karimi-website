import { Response } from "express";
import { ZodError } from "zod";
import { prisma } from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";
import { Prisma } from "../../generated/prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../../config/env";
import { setAuthCookie } from "../../lib/auth-cookie";
import { publicErrorMessage } from "../../lib/error-message";
import {
  adminUserCreateSchema,
  adminUserUpdateSchema,
  profileUpdateSchema,
} from "../../validators";

// نقش‌های مجاز سیستم
export const ALLOWED_ROLES = ["SUPER_ADMIN", "EDITOR", "INQUIRY_MANAGER"];

function validationError(res: Response, error: ZodError) {
  return res.status(400).json({
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "اطلاعات ارسالی معتبر نیست.",
      fields: error.flatten().fieldErrors,
    },
  });
}

function isUniqueViolation(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export class AuthAdminController {
  // دریافت لیست کاربران
  async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const users = await prisma.adminUser.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        },
        orderBy: { createdAt: "asc" },
      });
      res.json({ success: true, data: users });
    } catch (error: unknown) {
      const message = publicErrorMessage(error, "خطای ناشناخته");
      res.status(500).json({ success: false, error: { message } });
    }
  }

  // ایجاد کاربر جدید
  async createUser(req: AuthRequest, res: Response) {
    try {
      const { name, email, password, role, isActive } =
        adminUserCreateSchema.parse(req.body);

      const existing = await prisma.adminUser.findUnique({ where: { email } });
      if (existing) {
        return res.status(400).json({
          success: false,
          error: { message: "این ایمیل قبلاً ثبت شده است" },
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.adminUser.create({
        data: {
          name,
          email,
          passwordHash,
          role,
          isActive: isActive ?? true,
        },
      });

      res.status(201).json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
      });
    } catch (error: unknown) {
      if (error instanceof ZodError) return validationError(res, error);
      if (isUniqueViolation(error)) {
        return res.status(400).json({
          success: false,
          error: { message: "این ایمیل قبلاً ثبت شده است" },
        });
      }
      const message = publicErrorMessage(error, "خطای ناشناخته");
      res.status(500).json({ success: false, error: { message } });
    }
  }

  // دریافت یک کاربر
  async getUserById(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const user = await prisma.adminUser.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        },
      });
      if (!user)
        return res
          .status(404)
          .json({ success: false, error: { message: "کاربر یافت نشد" } });
      res.json({ success: true, data: user });
    } catch {
      res.status(500).json({ success: false, error: { message: "خطا" } });
    }
  }

  // ویرایش کاربر
  async updateUser(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const { name, email, role, isActive, password } =
        adminUserUpdateSchema.parse(req.body);

      const target = await prisma.adminUser.findUnique({ where: { id } });
      if (!target) {
        return res
          .status(404)
          .json({ success: false, error: { message: "کاربر یافت نشد" } });
      }

      // 👇 آخرین SUPER_ADMIN فعال نباید تنزل یا غیرفعال شود
      const removesActiveSuperAdmin =
        target.role === "SUPER_ADMIN" &&
        target.isActive &&
        ((role !== undefined && role !== "SUPER_ADMIN") || isActive === false);

      if (removesActiveSuperAdmin) {
        const activeSuperAdmins = await prisma.adminUser.count({
          where: { role: "SUPER_ADMIN", isActive: true },
        });
        if (activeSuperAdmins <= 1) {
          return res.status(400).json({
            success: false,
            error: {
              message:
                "نمی‌توانید آخرین سوپر ادمین فعال را تنزل دهید یا غیرفعال کنید",
            },
          });
        }
      }

      const dataToUpdate: Prisma.AdminUserUpdateInput = {
        name,
        email,
        role,
        isActive,
      };

      let newTokenVersion: number | null = null;
      if (password && password.trim() !== "") {
        dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
        // 👇 نشست‌های قبلی کاربر با تغییر رمز باطل می‌شوند
        dataToUpdate.tokenVersion = { increment: 1 };
        newTokenVersion = target.tokenVersion + 1;
      }

      const user = await prisma.adminUser.update({
        where: { id },
        data: dataToUpdate,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        },
      });

      // اگر ادمین رمز خودش را عوض کرده، نشست فعلی را با توکن جدید ادامه می‌دهیم
      if (newTokenVersion !== null && req.user?.userId === id) {
        const token = jwt.sign(
          { userId: user.id, role: user.role, tokenVersion: newTokenVersion },
          config.jwtSecret,
          { expiresIn: "1d" },
        );
        setAuthCookie(res, token);
      }

      res.json({ success: true, data: user });
    } catch (error: unknown) {
      if (error instanceof ZodError) return validationError(res, error);
      if (isUniqueViolation(error)) {
        return res.status(400).json({
          success: false,
          error: { message: "این ایمیل قبلاً برای کاربر دیگری ثبت شده است" },
        });
      }
      const message = publicErrorMessage(error, "خطای ناشناخته");
      res.status(500).json({ success: false, error: { message } });
    }
  }

  // 👇 حذف کاربر با همه چک‌ها
  async deleteUser(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;

      // ۱. جلوگیری از حذف خودت
      if (req.user?.userId === id) {
        return res.status(400).json({
          success: false,
          error: { message: "نمی‌توانید حساب خودتان را حذف کنید" },
        });
      }

      // ۲. چک وجود کاربر
      const user = await prisma.adminUser.findUnique({ where: { id } });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: "کاربر یافت نشد" },
        });
      }

      // ۳. جلوگیری از حذف آخرین SUPER_ADMIN
      if (user.role === "SUPER_ADMIN" && user.isActive) {
        const superAdminCount = await prisma.adminUser.count({
          where: { role: "SUPER_ADMIN", isActive: true },
        });

        if (superAdminCount <= 1) {
          return res.status(400).json({
            success: false,
            error: { message: "نمی‌توانید آخرین سوپر ادمین را حذف کنید" },
          });
        }
      }

      // ۴. حذف
      await prisma.adminUser.delete({ where: { id } });

      res.json({ success: true, message: "کاربر با موفقیت حذف شد" });
    } catch (error: unknown) {
      const message = publicErrorMessage(error, "خطای ناشناخته");
      res.status(500).json({ success: false, error: { message } });
    }
  }

  // ویرایش پروفایل خود کاربر
  async updateMyProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId)
        return res
          .status(401)
          .json({ success: false, error: { message: "دسترسی غیرمجاز" } });

      const { name, email, password, currentPassword } =
        profileUpdateSchema.parse(req.body);

      const currentUser = await prisma.adminUser.findUnique({
        where: { id: userId },
      });
      if (!currentUser) {
        return res
          .status(404)
          .json({ success: false, error: { message: "کاربر یافت نشد" } });
      }

      const data: Prisma.AdminUserUpdateInput = { name, email };
      let newTokenVersion: number | null = null;

      if (password && password.trim() !== "") {
        // 👇 تغییر رمز بدون دانستن رمز فعلی مجاز نیست
        if (!currentPassword) {
          return res.status(400).json({
            success: false,
            error: { message: "برای تغییر رمز، رمز عبور فعلی الزامی است" },
          });
        }

        const isCurrentPasswordValid = await bcrypt.compare(
          currentPassword,
          currentUser.passwordHash,
        );
        if (!isCurrentPasswordValid) {
          return res.status(400).json({
            success: false,
            error: { message: "رمز عبور فعلی اشتباه است" },
          });
        }

        data.passwordHash = await bcrypt.hash(password, 10);
        data.tokenVersion = { increment: 1 };
        newTokenVersion = currentUser.tokenVersion + 1;
      }

      const user = await prisma.adminUser.update({
        where: { id: userId },
        data,
        select: { id: true, name: true, email: true, role: true },
      });

      if (newTokenVersion !== null) {
        const token = jwt.sign(
          { userId: user.id, role: user.role, tokenVersion: newTokenVersion },
          config.jwtSecret,
          { expiresIn: "1d" },
        );
        setAuthCookie(res, token);
      }

      res.json({ success: true, data: user });
    } catch (error: unknown) {
      if (error instanceof ZodError) return validationError(res, error);
      if (isUniqueViolation(error)) {
        return res.status(400).json({
          success: false,
          error: { message: "این ایمیل قبلاً برای کاربر دیگری ثبت شده است" },
        });
      }
      const message = publicErrorMessage(error, "خطا در ویرایش");
      res.status(500).json({ success: false, error: { message } });
    }
  }
}
