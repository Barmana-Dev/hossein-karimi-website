"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthAdminController = exports.ALLOWED_ROLES = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../../config/prisma");
const client_1 = require("../../generated/prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const auth_cookie_1 = require("../../lib/auth-cookie");
const error_message_1 = require("../../lib/error-message");
const validators_1 = require("../../validators");
// نقش‌های مجاز سیستم
exports.ALLOWED_ROLES = ["SUPER_ADMIN", "EDITOR", "INQUIRY_MANAGER"];
function validationError(res, error) {
    return res.status(400).json({
        success: false,
        error: {
            code: "VALIDATION_ERROR",
            message: "اطلاعات ارسالی معتبر نیست.",
            fields: error.flatten().fieldErrors,
        },
    });
}
function isUniqueViolation(error) {
    return (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002");
}
class AuthAdminController {
    // دریافت لیست کاربران
    async getAllUsers(req, res) {
        try {
            const users = await prisma_1.prisma.adminUser.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                },
                orderBy: { createdAt: "asc" },
            });
            res.json({ success: true, data: users });
        }
        catch (error) {
            const message = (0, error_message_1.publicErrorMessage)(error, "خطای ناشناخته");
            res.status(500).json({ success: false, error: { message } });
        }
    }
    // ایجاد کاربر جدید
    async createUser(req, res) {
        try {
            const { name, email, password, role, isActive } = validators_1.adminUserCreateSchema.parse(req.body);
            const existing = await prisma_1.prisma.adminUser.findUnique({ where: { email } });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    error: { message: "این ایمیل قبلاً ثبت شده است" },
                });
            }
            const passwordHash = await bcryptjs_1.default.hash(password, 10);
            const user = await prisma_1.prisma.adminUser.create({
                data: {
                    name,
                    email,
                    passwordHash,
                    role,
                    isActive: isActive ?? true,
                },
            });
            res.status(201).json({
                success: true,
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                },
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError)
                return validationError(res, error);
            if (isUniqueViolation(error)) {
                return res.status(400).json({
                    success: false,
                    error: { message: "این ایمیل قبلاً ثبت شده است" },
                });
            }
            const message = (0, error_message_1.publicErrorMessage)(error, "خطای ناشناخته");
            res.status(500).json({ success: false, error: { message } });
        }
    }
    // دریافت یک کاربر
    async getUserById(req, res) {
        try {
            const id = req.params.id;
            const user = await prisma_1.prisma.adminUser.findUnique({
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
        }
        catch {
            res.status(500).json({ success: false, error: { message: "خطا" } });
        }
    }
    // ویرایش کاربر
    async updateUser(req, res) {
        try {
            const id = req.params.id;
            const { name, email, role, isActive, password } = validators_1.adminUserUpdateSchema.parse(req.body);
            const target = await prisma_1.prisma.adminUser.findUnique({ where: { id } });
            if (!target) {
                return res
                    .status(404)
                    .json({ success: false, error: { message: "کاربر یافت نشد" } });
            }
            // 👇 آخرین SUPER_ADMIN فعال نباید تنزل یا غیرفعال شود
            const removesActiveSuperAdmin = target.role === "SUPER_ADMIN" &&
                target.isActive &&
                ((role !== undefined && role !== "SUPER_ADMIN") || isActive === false);
            if (removesActiveSuperAdmin) {
                const activeSuperAdmins = await prisma_1.prisma.adminUser.count({
                    where: { role: "SUPER_ADMIN", isActive: true },
                });
                if (activeSuperAdmins <= 1) {
                    return res.status(400).json({
                        success: false,
                        error: {
                            message: "نمی‌توانید آخرین سوپر ادمین فعال را تنزل دهید یا غیرفعال کنید",
                        },
                    });
                }
            }
            const dataToUpdate = {
                name,
                email,
                role,
                isActive,
            };
            let newTokenVersion = null;
            if (password && password.trim() !== "") {
                dataToUpdate.passwordHash = await bcryptjs_1.default.hash(password, 10);
                // 👇 نشست‌های قبلی کاربر با تغییر رمز باطل می‌شوند
                dataToUpdate.tokenVersion = { increment: 1 };
                newTokenVersion = target.tokenVersion + 1;
            }
            const user = await prisma_1.prisma.adminUser.update({
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
            // اگر ادمین رمز خودش را عوض کرده، نشست فعلی را با توکن جدید ادامه می‌دهیم
            if (newTokenVersion !== null && req.user?.userId === id) {
                const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role, tokenVersion: newTokenVersion }, env_1.config.jwtSecret, { expiresIn: "1d" });
                (0, auth_cookie_1.setAuthCookie)(res, token);
            }
            res.json({ success: true, data: user });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError)
                return validationError(res, error);
            if (isUniqueViolation(error)) {
                return res.status(400).json({
                    success: false,
                    error: { message: "این ایمیل قبلاً برای کاربر دیگری ثبت شده است" },
                });
            }
            const message = (0, error_message_1.publicErrorMessage)(error, "خطای ناشناخته");
            res.status(500).json({ success: false, error: { message } });
        }
    }
    // 👇 حذف کاربر با همه چک‌ها
    async deleteUser(req, res) {
        try {
            const id = req.params.id;
            // ۱. جلوگیری از حذف خودت
            if (req.user?.userId === id) {
                return res.status(400).json({
                    success: false,
                    error: { message: "نمی‌توانید حساب خودتان را حذف کنید" },
                });
            }
            // ۲. چک وجود کاربر
            const user = await prisma_1.prisma.adminUser.findUnique({ where: { id } });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: { message: "کاربر یافت نشد" },
                });
            }
            // ۳. جلوگیری از حذف آخرین SUPER_ADMIN
            if (user.role === "SUPER_ADMIN" && user.isActive) {
                const superAdminCount = await prisma_1.prisma.adminUser.count({
                    where: { role: "SUPER_ADMIN", isActive: true },
                });
                if (superAdminCount <= 1) {
                    return res.status(400).json({
                        success: false,
                        error: { message: "نمی‌توانید آخرین سوپر ادمین را حذف کنید" },
                    });
                }
            }
            // ۴. حذف
            await prisma_1.prisma.adminUser.delete({ where: { id } });
            res.json({ success: true, message: "کاربر با موفقیت حذف شد" });
        }
        catch (error) {
            const message = (0, error_message_1.publicErrorMessage)(error, "خطای ناشناخته");
            res.status(500).json({ success: false, error: { message } });
        }
    }
    // ویرایش پروفایل خود کاربر
    async updateMyProfile(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                return res
                    .status(401)
                    .json({ success: false, error: { message: "دسترسی غیرمجاز" } });
            const { name, email, password, currentPassword } = validators_1.profileUpdateSchema.parse(req.body);
            const currentUser = await prisma_1.prisma.adminUser.findUnique({
                where: { id: userId },
            });
            if (!currentUser) {
                return res
                    .status(404)
                    .json({ success: false, error: { message: "کاربر یافت نشد" } });
            }
            const data = { name, email };
            let newTokenVersion = null;
            if (password && password.trim() !== "") {
                // 👇 تغییر رمز بدون دانستن رمز فعلی مجاز نیست
                if (!currentPassword) {
                    return res.status(400).json({
                        success: false,
                        error: { message: "برای تغییر رمز، رمز عبور فعلی الزامی است" },
                    });
                }
                const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, currentUser.passwordHash);
                if (!isCurrentPasswordValid) {
                    return res.status(400).json({
                        success: false,
                        error: { message: "رمز عبور فعلی اشتباه است" },
                    });
                }
                data.passwordHash = await bcryptjs_1.default.hash(password, 10);
                data.tokenVersion = { increment: 1 };
                newTokenVersion = currentUser.tokenVersion + 1;
            }
            const user = await prisma_1.prisma.adminUser.update({
                where: { id: userId },
                data,
                select: { id: true, name: true, email: true, role: true },
            });
            if (newTokenVersion !== null) {
                const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role, tokenVersion: newTokenVersion }, env_1.config.jwtSecret, { expiresIn: "1d" });
                (0, auth_cookie_1.setAuthCookie)(res, token);
            }
            res.json({ success: true, data: user });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError)
                return validationError(res, error);
            if (isUniqueViolation(error)) {
                return res.status(400).json({
                    success: false,
                    error: { message: "این ایمیل قبلاً برای کاربر دیگری ثبت شده است" },
                });
            }
            const message = (0, error_message_1.publicErrorMessage)(error, "خطا در ویرایش");
            res.status(500).json({ success: false, error: { message } });
        }
    }
}
exports.AuthAdminController = AuthAdminController;
