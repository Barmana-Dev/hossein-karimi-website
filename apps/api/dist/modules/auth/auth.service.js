"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../config/prisma");
class AuthService {
    async login(email, password) {
        const user = await prisma_1.prisma.adminUser.findUnique({ where: { email } });
        if (!user) {
            throw new Error("ایمیل یا رمز عبور اشتباه است");
        }
        // 👇 چک isActive (کاربر غیرفعال نتونه لاگین کنه)
        if (!user.isActive) {
            throw new Error("حساب کاربری شما غیرفعال شده است. با مدیر تماس بگیرید.");
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error("ایمیل یا رمز عبور اشتباه است");
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET در متغیرهای محیطی تعریف نشده است");
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, secret, {
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
    async getMe(userId) {
        const user = await prisma_1.prisma.adminUser.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error("کاربر یافت نشد");
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
    }
}
exports.AuthService = AuthService;
