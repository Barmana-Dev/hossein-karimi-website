import { Response } from "express";
import { prisma } from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";
import bcrypt from "bcryptjs";

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
      });
      res.json({ success: true, data: users });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
      res.status(500).json({ success: false, error: { message } });
    }
  }

  // ایجاد کاربر جدید
  async createUser(req: AuthRequest, res: Response) {
    try {
      const { name, email, password, role, isActive } = req.body;

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
          isActive: isActive ?? true, //  پیش‌فرض true
        },
      });

      res.status(201).json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive, //  برگردون
        },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
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
    } catch (error: unknown) {
      res.status(500).json({ success: false, error: { message: "خطا" } });
    }
  }

  // ویرایش کاربر
  async updateUser(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const { name, email, role, isActive, password } = req.body;

      interface AdminUserUpdate {
        name?: string;
        email?: string;
        role?: string;
        isActive?: boolean;
        passwordHash?: string;
      }

      const dataToUpdate: AdminUserUpdate = { name, email, role, isActive };

      if (password && password.trim() !== "") {
        dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
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

      res.json({ success: true, data: user });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
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
      if (user.role === "SUPER_ADMIN") {
        const superAdminCount = await prisma.adminUser.count({
          where: { role: "SUPER_ADMIN" },
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
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
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

      const { name, email, password } = req.body;

      interface UpdateProfile {
        name?: string;
        email?: string;
        passwordHash?: string;
      }

      const data: UpdateProfile = { name, email };

      if (password && password.trim() !== "") {
        data.passwordHash = await bcrypt.hash(password, 10);
      }

      const user = await prisma.adminUser.update({
        where: { id: userId },
        data,
        select: { id: true, name: true, email: true, role: true },
      });

      res.json({ success: true, data: user });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطا در ویرایش";
      res.status(500).json({ success: false, error: { message } });
    }
  }
}
