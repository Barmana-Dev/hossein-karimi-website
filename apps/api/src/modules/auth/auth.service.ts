import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma";
import { config } from "../../config/env";

// 👇 خطای احراز هویت با کد وضعیت مشخص (۴۰۱/۴۰۳)
export class AuthError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export class AuthService {
  async login(email: string, password: string) {
    const user = await prisma.adminUser.findUnique({ where: { email } });

    // پیام یکسان برای ایمیل ناموجود و رمز اشتباه (جلوگیری از افشای وجود حساب)
    if (!user) {
      throw new AuthError("ایمیل یا رمز عبور اشتباه است", 401);
    }

    if (!user.isActive) {
      throw new AuthError(
        "حساب کاربری شما غیرفعال شده است. با مدیر تماس بگیرید.",
        403,
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthError("ایمیل یا رمز عبور اشتباه است", 401);
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        tokenVersion: user.tokenVersion,
      },
      config.jwtSecret,
      { expiresIn: "1d" },
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getMe(userId: string) {
    const user = await prisma.adminUser.findUnique({ where: { id: userId } });
    if (!user) throw new AuthError("کاربر یافت نشد", 404);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
