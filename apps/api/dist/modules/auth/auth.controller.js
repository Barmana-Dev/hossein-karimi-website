"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const zod_1 = require("zod");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_service_1 = require("./auth.service");
const prisma_1 = require("../../config/prisma");
const env_1 = require("../../config/env");
const auth_cookie_1 = require("../../lib/auth-cookie");
const error_message_1 = require("../../lib/error-message");
const authService = new auth_service_1.AuthService();
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("ایمیل نامعتبر است"),
    password: zod_1.z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
});
class AuthController {
    async login(req, res) {
        try {
            // اعتبارسنجی ورودی
            const { email, password } = loginSchema.parse(req.body);
            const result = await authService.login(email, password);
            // تنظیم کوکی امن (HttpOnly) — با domain مشترک در استقرار چندزیردامنه‌ای
            (0, auth_cookie_1.setAuthCookie)(res, result.token);
            res.json({
                success: true,
                data: result.user,
                message: "ورود موفقیت‌آمیز بود",
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "اطلاعات ورود معتبر نیست.",
                        fields: error.flatten().fieldErrors,
                    },
                });
            }
            if (error instanceof auth_service_1.AuthError) {
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
    async logout(req, res) {
        // 👇 توکن فعلی را باطل می‌کنیم؛ پاک‌کردن کوکی به‌تنهایی توکن دزدیده‌شده را
        // تا زمان انقضا معتبر باقی می‌گذاشت.
        const token = req.cookies?.token;
        if (token) {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
                if (decoded.userId) {
                    await prisma_1.prisma.adminUser.update({
                        where: { id: decoded.userId },
                        data: { tokenVersion: { increment: 1 } },
                    });
                }
            }
            catch {
                // توکن نامعتبر یا منقضی: فقط کوکی پاک می‌شود
            }
        }
        (0, auth_cookie_1.clearAuthCookie)(res);
        res.json({ success: true, message: "خروج انجام شد" });
    }
    async getMe(req, res) {
        try {
            // req.user از Middleware می‌آید
            const user = await prisma_1.prisma.adminUser.findUnique({
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: {
                    message: (0, error_message_1.publicErrorMessage)(error, "خطای داخلی سرور رخ داده است."),
                },
            });
        }
    }
}
exports.AuthController = AuthController;
