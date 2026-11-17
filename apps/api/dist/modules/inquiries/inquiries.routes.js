"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const inquiries_controller_1 = require("./inquiries.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const env_1 = require("../../config/env");
const router = (0, express_1.Router)();
const controller = new inquiries_controller_1.InquiriesController();
const inquiriesController = new inquiries_controller_1.InquiriesController();
// 👇 محدودیت برای ثبت فرم تماس (حداکثر ۵ درخواست در ۱۵ دقیقه)
// فقط روی همین endpoint عمومی اعمال می‌شود تا مسیر دیگری بدون محدودیت نماند.
const inquiryLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: env_1.config.inquiryRateLimitMax,
    message: {
        success: false,
        error: {
            message: "تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً بعداً تلاش کنید.",
        },
    },
});
// مسیرهای ادمین
router.get("/admin/list", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN", "INQUIRY_MANAGER"]), (req, res) => controller.adminGetAll(req, res));
router.get("/admin/:id", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN", "INQUIRY_MANAGER"]), (req, res) => controller.adminGetById(req, res));
router.patch("/admin/:id", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN", "INQUIRY_MANAGER"]), (req, res) => controller.adminUpdate(req, res));
// 👇 مسیر حذف — اصلاح شد (به /admin/:id تغییر کرد)
router.delete("/admin/:id", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN", "INQUIRY_MANAGER"]), (req, res) => inquiriesController.deleteInquiry(req, res));
// مسیر عمومی (تنها راه ثبت درخواست، همراه با محدودیت)
router.post("/", inquiryLimiter, (req, res) => controller.create(req, res));
exports.default = router;
