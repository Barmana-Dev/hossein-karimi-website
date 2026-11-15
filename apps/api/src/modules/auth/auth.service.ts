import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma";

export class AuthService {
  async login(email: string, password: string) {
    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user) {
      throw new Error("ایمیل یا رمز عبور اشتباه است");
    }

    // 👇 چک isActive (کاربر غیرفعال نتونه لاگین کنه)
    if (!user.isActive) {
      throw new Error("حساب کاربری شما غیرفعال شده است. با مدیر تماس بگیرید.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("ایمیل یا رمز عبور اشتباه است");
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET در متغیرهای محیطی تعریف نشده است");
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, secret, {
      expiresIn: "1d",
    });

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
