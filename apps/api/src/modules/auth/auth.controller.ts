import { Request, Response } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { AuthError, AuthService } from "./auth.service";
import { AuthRequest } from "../../middleware/auth.middleware";
import { prisma } from "../../config/prisma";
import { config } from "../../config/env";
import { clearAuthCookie, setAuthCookie } from "../../lib/auth-cookie";
import { publicErrorMessage } from "../../lib/error-message";

const authService = new AuthService();

const loginSchema = z.object({
  // 👇 ایمیل کاربران هنگام ساخت با حروف کوچک ذخیره می‌شود؛ ورودی ورود هم
  // باید نرمال شود تا ورود با Admin@Example.com هم کار کند.
  email: z
    .string()
    .trim()
    .email("ایمیل نامعتبر است")
    .transform((value) => value.toLowerCase()),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
});

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      // اعتبارسنجی ورودی
      const { email, password } = loginSchema.parse(req.body);

      const result = await authService.login(email, password);

      // تنظیم کوکی امن (HttpOnly) — با domain مشترک در استقرار چندزیردامنه‌ای
      setAuthCookie(res, result.token);

      res.json({
        success: true,
        data: result.user,
        message: "ورود موفقیت‌آمیز بود",
      });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "اطلاعات ورود معتبر نیست.",
            fields: error.flatten().fieldErrors,
          },
        });
      }

      if (error instanceof AuthError) {
        return res
          .status(error.status)
          .json({ success: false, error: { message: error.message } });
      }

      console.error("🔴 Login error:", error);
      res.status(500).json({
        success: false,
        error: { message: "خطای داخلی سرور رخ داده است." },
      });
    }
  }

  async logout(req: Request, res: Response) {
    // 👇 توکن فعلی را باطل می‌کنیم؛ پاک‌کردن کوکی به‌تنهایی توکن دزدیده‌شده را
    // تا زمان انقضا معتبر باقی می‌گذاشت.
    const token = req.cookies?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwtSecret) as {
          userId?: string;
          tokenVersion?: number;
        };
        if (decoded.userId) {
          const tokenVersion = decoded.tokenVersion ?? 0;
          // 👇 فقط توکنی که هنوز نسخهٔ جاری حساب را دارد باطل می‌شود؛
          // در غیر این صورت خروج با توکن قدیمی، نشست معتبر جدید را قطع می‌کرد.
          await prisma.adminUser.updateMany({
            where: { id: decoded.userId, tokenVersion },
            data: { tokenVersion: { increment: 1 } },
          });
        }
      } catch {
        // توکن نامعتبر یا منقضی: فقط کوکی پاک می‌شود
      }
    }

    clearAuthCookie(res);
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
      res.status(500).json({
        success: false,
        error: {
          message: publicErrorMessage(error, "خطای داخلی سرور رخ داده است."),
        },
      });
    }
  }
}
