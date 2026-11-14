import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma";

export class AuthService {
  async login(email: string, password: string) {
    // ۱. پیدا کردن کاربر با ایمیل
    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user) {
      throw new Error("ایمیل یا رمز عبور اشتباه است");
    }

    // ۲. بررسی رمز عبور
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("ایمیل یا رمز عبور اشتباه است");
    }

    // ۳. ساخت توکن JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
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
    if (!user) throw new Error("کاربر یافت نشد");
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
