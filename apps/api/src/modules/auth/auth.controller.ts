import { Request, Response } from "express";
import { z } from "zod";
import { AuthService } from "./auth.service";
import { AuthRequest } from "../../middleware/auth.middleware";
import { prisma } from "../../config/prisma";

const authService = new AuthService();

const loginSchema = z.object({
  email: z.string().email("ایمیل نامعتبر است"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
});

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      // اعتبارسنجی ورودی
      const { email, password } = loginSchema.parse(req.body);

      const result = await authService.login(email, password);

      // تنظیم کوکی امن (HttpOnly)
      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // ۱ روز
      });

      res.json({
        success: true,
        data: result.user,
        message: "ورود موفقیت‌آمیز بود",
      });
    } catch (error: unknown) {
      // بررسی اینکه آیا خطا یک Error است یا نه
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
      res.status(400).json({ success: false, error: { message } });
    }
  }

  async logout(req: Request, res: Response) {
    res.clearCookie("token");
    res.json({ success: true, message: "خروج انجام شد" });
  }

  async getMe(req: AuthRequest, res: Response) {
    try {
      // req.user از Middleware می‌آید
      const user = await prisma.adminUser.findUnique({
        where: { id: req.user?.userId },
      });

      if (!user)
        return res
          .status(404)
          .json({ success: false, error: { message: "کاربر یافت نشد" } });

      res.json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
      res.status(500).json({ success: false, error: { message } });
    }
  }
}
