import { Router } from "express";
import { InquiriesController } from "./inquiries.controller";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { AuthRequest } from "../../middleware/auth.middleware";

const router = Router();
const controller = new InquiriesController();
const inquiriesController = new InquiriesController();
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
// مسیر حذف درخواست
router.delete(
  "/admin/inquiries/:id",
  requireAuth,
  requireRole(["SUPER_ADMIN", "INQUIRY_MANAGER"]),
  (req, res) => inquiriesController.deleteInquiry(req as AuthRequest, res),
);
// مسیرهای عمومی
router.post("/", (req, res) => controller.create(req, res));

export default router;
