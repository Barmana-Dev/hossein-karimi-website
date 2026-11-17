"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../config/prisma");
// ۱. بررسی لاگین بودن + فعال بودن کاربر
const requireAuth = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({
            success: false,
            error: { message: "دسترسی غیرمجاز. لطفاً وارد شوید." },
        });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // 👇 چک کن کاربر هنوز وجود داره و فعاله
        const user = await prisma_1.prisma.adminUser.findUnique({
            where: { id: decoded.userId },
            select: { id: true, isActive: true, role: true },
        });
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                error: { message: "حساب شما غیرفعال شده است. دوباره وارد شوید." },
            });
        }
        // 👇 نقش رو از دیتابیس بخون (نه از توکن) تا تغییر نقش فوری اعمال بشه
        req.user = { userId: user.id, role: user.role };
        next();
    }
    catch {
        return res.status(401).json({
            success: false,
            error: { message: "نشست شما منقضی شده است. دوباره وارد شوید." },
        });
    }
};
exports.requireAuth = requireAuth;
// ۲. بررسی سطح دسترسی (نقش) — بدون تغییر
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res
                .status(401)
                .json({ success: false, error: { message: "دسترسی غیرمجاز." } });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: { message: "شما مجوز دسترسی به این بخش را ندارید." },
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
