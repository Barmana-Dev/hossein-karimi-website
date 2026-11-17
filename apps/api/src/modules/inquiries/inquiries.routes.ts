import { Router } from "express";
import rateLimit from "express-rate-limit";
import { InquiriesController } from "./inquiries.controller";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { AuthRequest } from "../../middleware/auth.middleware";
import { config } from "../../config/env";

const router = Router();
const controller = new InquiriesController();
const inquiriesController = new InquiriesController();

// 👇 محدودیت برای ثبت فرم تماس (حداکثر ۵ درخواست در ۱۵ دقیقه)
// فقط روی همین endpoint عمومی اعمال می‌شود تا مسیر دیگری بدون محدودیت نماند.
const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.inquiryRateLimitMax,
  message: {
    success: false,
    error: {
      message:
        "تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً بعداً تلاش کنید.",
    },
  },
});

// مسیرهای ادمین
router.get(
  "/admin/list",
  requireAuth,
  requireRole(["SUPER_ADMIN", "INQUIRY_MANAGER"]),
  (req, res) => controller.adminGetAll(req as AuthRequest, res),
);
router.get(
  "/admin/:id",
  requireAuth,
  requireRole(["SUPER_ADMIN", "INQUIRY_MANAGER"]),
  (req, res) => controller.adminGetById(req as AuthRequest, res),
);
router.patch(
  "/admin/:id",
  requireAuth,
  requireRole(["SUPER_ADMIN", "INQUIRY_MANAGER"]),
  (req, res) => controller.adminUpdate(req as AuthRequest, res),
);

// 👇 مسیر حذف — اصلاح شد (به /admin/:id تغییر کرد)
router.delete(
  "/admin/:id",
  requireAuth,
  requireRole(["SUPER_ADMIN", "INQUIRY_MANAGER"]),
  (req, res) => inquiriesController.deleteInquiry(req as AuthRequest, res),
);

// مسیر عمومی (تنها راه ثبت درخواست، همراه با محدودیت)
router.post("/", inquiryLimiter, (req, res) => controller.create(req, res));

export default router;
