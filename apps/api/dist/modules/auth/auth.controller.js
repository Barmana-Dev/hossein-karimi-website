"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const zod_1 = require("zod");
const auth_service_1 = require("./auth.service");
const prisma_1 = require("../../config/prisma");
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
        }
        catch (error) {
            // بررسی اینکه آیا خطا یک Error است یا نه
            const message = error instanceof Error ? error.message : "خطای ناشناخته";
            res.status(400).json({ success: false, error: { message } });
        }
    }
    async logout(req, res) {
        res.clearCookie("token");
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
            const message = error instanceof Error ? error.message : "خطای ناشناخته";
            res.status(500).json({ success: false, error: { message } });
        }
    }
}
exports.AuthController = AuthController;
