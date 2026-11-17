"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = exports.AuthError = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../config/prisma");
const env_1 = require("../../config/env");
// 👇 خطای احراز هویت با کد وضعیت مشخص (۴۰۱/۴۰۳)
class AuthError extends Error {
    status;
    constructor(message, status = 401) {
        super(message);
        this.name = "AuthError";
        this.status = status;
    }
}
exports.AuthError = AuthError;
class AuthService {
    async login(email, password) {
        const user = await prisma_1.prisma.adminUser.findUnique({ where: { email } });
        // پیام یکسان برای ایمیل ناموجود و رمز اشتباه (جلوگیری از افشای وجود حساب)
        if (!user) {
            throw new AuthError("ایمیل یا رمز عبور اشتباه است", 401);
        }
        if (!user.isActive) {
            throw new AuthError("حساب کاربری شما غیرفعال شده است. با مدیر تماس بگیرید.", 403);
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new AuthError("ایمیل یا رمز عبور اشتباه است", 401);
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, env_1.config.jwtSecret, { expiresIn: "1d" });
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
            throw new AuthError("کاربر یافت نشد", 404);
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
    }
}
exports.AuthService = AuthService;
